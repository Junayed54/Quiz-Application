
from channels.generic.websocket import AsyncJsonWebsocketConsumer, AsyncWebsocketConsumer

# class MyAsyncJsonWebSocketConsumer(AsyncJsonWebsocketConsumer):
    
#     async def connect(self):
#         print('websocket connected...')
#         await self.accept()  # Accept the WebSocket connection
    
#     async def receive_json(self, content, **kwargs):
#         # This handler is called when data is received from the client with decoded JSON content
#         print('Message received from client...', content)
        
#     async def disconnect(self, close_code):
#         print('websocket disconnected...', close_code)  # Log when the WebSocket disconnects

# from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken
from django.contrib.auth import get_user_model
from quiz.models import Exam, Question, QuestionOption, ExamAttempt, Status
from django.utils import timezone
from uuid import UUID
CustomUser = get_user_model()
import json

# class ExamsConsumer(AsyncJsonWebsocketConsumer):
#     async def connect(self):
#         self.group_name = None  # Initialize group_name to None
#         token = self.scope['query_string'].decode('utf-8').split('=')[1]  # Extract token from query string

#         try:
#             # Decode the JWT token and extract user_id
#             decoded_data = UntypedToken(token)
#             # print("Decoded JWT Data:", decoded_data)
#             user_id = decoded_data['user_id']  # Ensure that this key is present in your token payload

#             # Retrieve the user from the database
#             self.user = await self.get_user_from_token(user_id)

#             # Proceed with the exam logic
#             self.exam_id = self.scope['url_route']['kwargs']['exam_id']
#             self.group_name = f'exam_{self.exam_id}'

#             if await self.is_exam_accessible_by_student():
#                 await self.channel_layer.group_add(self.group_name, self.channel_name)
#                 await self.accept()
#                 await self.send_user_update()  # Send initial updates to the user
#             else:
#                 await self.close()

#         except InvalidToken:
#             await self.close()  # Close connection on invalid token
#         except KeyError:
#             print("User ID not found in token.")
#             await self.close()  # Close on KeyError if user_id is not in token
#         except Exception as e:
#             print(f"Error during connect: {e}")
#             await self.close()  # Close on any other error

#     async def disconnect(self, close_code):
#         if self.group_name:  # Check if group_name is set
#             await self.channel_layer.group_discard(self.group_name, self.channel_name)

#     @database_sync_to_async
#     def get_user_from_token(self, user_id):
#         # Fetch the user by numeric ID
#         return CustomUser.objects.get(phone_number=user_id)
    
#     async def receive_json(self, content):
#         user_id = content.get('user_id')
#         is_correct = content.get('is_correct')

#         try:
#             exam = await self.get_exam()
#             attempt = await self.get_or_create_attempt(user_id)
#         except (Exam.DoesNotExist, ExamAttempt.DoesNotExist):
#             await self.send_json({'error': 'Exam or ExamAttempt not found.'})
#             return

#         # Update correct or wrong answers based on the submission
#         if is_correct:
#             exam.correct_answers += 1
#             attempt.total_correct_answers += 1
#         else:
#             exam.wrong_answers += 1

#         await self.save_exam_attempt(exam, attempt)

#         # Broadcast the update to the WebSocket group
#         await self.channel_layer.group_send(self.group_name, {
#             'type': 'exam_update',
#             'user_id': user_id,
#             'correct_answers': exam.correct_answers,
#             'wrong_answers': exam.wrong_answers,
#             'user_correct_answers': attempt.total_correct_answers,
#             'total_users': await self.get_total_users_in_exam()  # Get total users
#         })

#     async def exam_update(self, event):
#         # Send updated exam and user attempt data back to all clients
#         await self.send_json({
#             'user_id': event['user_id'],
#             'correct_answers': event['correct_answers'],
#             'wrong_answers': event['wrong_answers'],
#             'user_correct_answers': event['user_correct_answers'],
#             'total_users': event['total_users']  # Send total users count
#         })

#     async def send_user_update(self):
#         # Get all users' attempts and send them to the new user
#         all_attempts = await self.get_all_attempts()
#         await self.send_json({'all_attempts': all_attempts})

#     @database_sync_to_async
#     def get_all_attempts(self):
#         # Fetch all exam attempts for the current exam
#         return list(ExamAttempt.objects.filter(exam_id=self.exam_id).values())

#     @database_sync_to_async
#     def get_exam(self):
#         return Exam.objects.get(exam_id=self.exam_id)

#     @database_sync_to_async
#     def get_or_create_attempt(self, user_id):
#         user = User.objects.get(id=user_id)
#         attempt, created = ExamAttempt.objects.get_or_create(exam_id=self.exam_id, user=user)
#         return attempt

#     @database_sync_to_async
#     def save_exam_attempt(self, exam, attempt):
#         exam.save()
#         attempt.save()

#     @database_sync_to_async
#     def is_exam_accessible_by_student(self):
#         try:
#             status = Status.objects.get(exam__exam_id=self.exam_id)
#             return status.status == 'student'
#         except Status.DoesNotExist:
#             return False

#     @database_sync_to_async
#     def get_total_users_in_exam(self):
#         # Count total users in the exam
#         return ExamAttempt.objects.filter(exam_id=self.exam_id).count()



# consumers.py

class ExamConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.exam_id = self.scope['url_route']['kwargs']['exam_id']
        self.user = self.scope['user']
        self.current_question_index = 0  # Initialize question index

        # Join the exam group
        self.group_name = f'exam_{self.exam_id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)

        await self.accept()

        # Notify user of successful connection
        await self.send(text_data=json.dumps({
            'message': f'{self.user.username} has joined the exam.'
        }))

    async def disconnect(self, close_code):
        # Leave the exam group
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')

        if action == 'start_exam':
            await self.start_exam()

        elif action == 'next_question':
            await self.send_next_question()

        elif action == 'submit_answer':
            question_id = data.get('question_id')
            selected_option_id = data.get('selected_option_id')
            await self.check_answer(question_id, selected_option_id)

    async def start_exam(self):
        """ Fetch all exam questions and send the first one to the user. """
        try:
            # Fetch the exam and cache the questions
            exam = await database_sync_to_async(Exam.objects.prefetch_related('questions').get)(exam_id=self.exam_id)
            self.questions = await database_sync_to_async(list)(exam.questions.all())  # Cache questions

            # Directly send the first question
            await self.send_next_question()

        except Exam.DoesNotExist:
            await self.send(text_data=json.dumps({'error': 'Exam not found.'}))
        
    async def send_next_question(self):
        """ Send the next question in the exam based on the current index. """
        if self.current_question_index < len(self.questions):
            question = self.questions[self.current_question_index]

            # Send the current question with its options
            await self.send(text_data=json.dumps({
                'action': 'question',
                'question': question.text,  # Assuming question has 'text'
                'options': [
                    {'id': option.id, 'text': option.text}
                    for option in await database_sync_to_async(list)(question.options.all())
                ],
                'question_id': question.id,
            }))

            # Increment the question index for the next question
            self.current_question_index += 1
        else:
            await self.send(text_data=json.dumps({
                'action': 'exam_complete',
                'message': 'All questions have been answered.'
            }))

    async def check_answer(self, question_id, selected_option_id):
        """ Validate the selected answer and broadcast score updates. """
        try:
            # Fetch the question and selected option
            question = await database_sync_to_async(Question.objects.select_related('exam').get)(id=question_id)
            selected_option = await database_sync_to_async(QuestionOption.objects.get)(id=selected_option_id, question=question)

            correct = selected_option.is_correct

            # Record the user's attempt
            await database_sync_to_async(ExamAttempt.objects.create)(
                exam=question.exam,
                user=self.user,
                selected_option=selected_option,
                correct=correct,
                timestamp=timezone.now()
            )

            # Broadcast result to all users in the group
            await self.channel_layer.group_send(self.group_name, {
                'type': 'send_score_update',
                'user': self.user.username,
                'correct': correct,
            })

            # Optionally, send the next question after answer submission
            await self.send_next_question()

        except Question.DoesNotExist:
            await self.send(text_data=json.dumps({'error': 'Question not found.'}))
        except QuestionOption.DoesNotExist:
            await self.send(text_data=json.dumps({'error': 'Option not found.'}))

    async def send_score_update(self, event):
        """ Broadcast the score update to all users. """
        await self.send(text_data=json.dumps({
            'action': 'score_update',
            'user': event['user'],
            'correct': event['correct'],
        }))
