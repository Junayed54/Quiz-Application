
from channels.generic.websocket import AsyncJsonWebsocketConsumer, AsyncWebsocketConsumer

class MyAsyncJsonWebSocketConsumer(AsyncJsonWebsocketConsumer):
    
    async def connect(self):
        print('websocket connected...')
        await self.accept()  # Accept the WebSocket connection
    
    async def receive_json(self, content, **kwargs):
        # This handler is called when data is received from the client with decoded JSON content
        print('Message received from client...', content)
        
    async def disconnect(self, close_code):
        print('websocket disconnected...', close_code)  # Log when the WebSocket disconnects

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

class ExamsConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.group_name = None  # Initialize group_name to None
        token = self.scope['query_string'].decode('utf-8').split('=')[1]  # Extract token from query string

        try:
            # Decode the JWT token and extract user_id
            decoded_data = UntypedToken(token)
            # print("Decoded JWT Data:", decoded_data)
            user_id = decoded_data['user_id']  # Ensure that this key is present in your token payload

            # Retrieve the user from the database
            self.user = await self.get_user_from_token(user_id)

            # Proceed with the exam logic
            self.exam_id = self.scope['url_route']['kwargs']['exam_id']
            self.group_name = f'exam_{self.exam_id}'

            if await self.is_exam_accessible_by_student():
                await self.channel_layer.group_add(self.group_name, self.channel_name)
                await self.accept()
                await self.send_user_update()  # Send initial updates to the user
            else:
                await self.close()

        except InvalidToken:
            await self.close()  # Close connection on invalid token
        except KeyError:
            print("User ID not found in token.")
            await self.close()  # Close on KeyError if user_id is not in token
        except Exception as e:
            print(f"Error during connect: {e}")
            await self.close()  # Close on any other error

    async def disconnect(self, close_code):
        if self.group_name:  # Check if group_name is set
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    @database_sync_to_async
    def get_user_from_token(self, user_id):
        # Fetch the user by numeric ID
        return CustomUser.objects.get(phone_number=user_id)
    
    async def receive_json(self, content):
        user_id = content.get('user_id')
        is_correct = content.get('is_correct')

        try:
            exam = await self.get_exam()
            attempt = await self.get_or_create_attempt(user_id)
        except (Exam.DoesNotExist, ExamAttempt.DoesNotExist):
            await self.send_json({'error': 'Exam or ExamAttempt not found.'})
            return

        # Update correct or wrong answers based on the submission
        if is_correct:
            exam.correct_answers += 1
            attempt.total_correct_answers += 1
        else:
            exam.wrong_answers += 1

        await self.save_exam_attempt(exam, attempt)

        # Broadcast the update to the WebSocket group
        await self.channel_layer.group_send(self.group_name, {
            'type': 'exam_update',
            'user_id': user_id,
            'correct_answers': exam.correct_answers,
            'wrong_answers': exam.wrong_answers,
            'user_correct_answers': attempt.total_correct_answers,
            'total_users': await self.get_total_users_in_exam()  # Get total users
        })

    async def exam_update(self, event):
        # Send updated exam and user attempt data back to all clients
        await self.send_json({
            'user_id': event['user_id'],
            'correct_answers': event['correct_answers'],
            'wrong_answers': event['wrong_answers'],
            'user_correct_answers': event['user_correct_answers'],
            'total_users': event['total_users']  # Send total users count
        })

    async def send_user_update(self):
        # Get all users' attempts and send them to the new user
        all_attempts = await self.get_all_attempts()
        await self.send_json({'all_attempts': all_attempts})

    @database_sync_to_async
    def get_all_attempts(self):
        # Fetch all exam attempts for the current exam
        return list(ExamAttempt.objects.filter(exam_id=self.exam_id).values())

    @database_sync_to_async
    def get_exam(self):
        return Exam.objects.get(exam_id=self.exam_id)

    @database_sync_to_async
    def get_or_create_attempt(self, user_id):
        user = User.objects.get(id=user_id)
        attempt, created = ExamAttempt.objects.get_or_create(exam_id=self.exam_id, user=user)
        return attempt

    @database_sync_to_async
    def save_exam_attempt(self, exam, attempt):
        exam.save()
        attempt.save()

    @database_sync_to_async
    def is_exam_accessible_by_student(self):
        try:
            status = Status.objects.get(exam__exam_id=self.exam_id)
            return status.status == 'student'
        except Status.DoesNotExist:
            return False

    @database_sync_to_async
    def get_total_users_in_exam(self):
        # Count total users in the exam
        return ExamAttempt.objects.filter(exam_id=self.exam_id).count()



# consumers.py

class ExamConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.exam_id = self.scope['url_route']['kwargs']['exam_id']
        self.user = self.scope['user']

        # Join the exam group
        self.group_name = f'exam_{self.exam_id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)

        await self.accept()

        # Send a message when a user joins
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
            exam_id = data.get('exam_id')
            try:
                # Check if the exam_id is valid before using it
                exam_id = UUID(exam_id)  # Convert to UUID
                print(exam_id)
                exam = await database_sync_to_async(Exam.objects.get)(id=exam_id)
                
                # Proceed with starting the exam
                await self.send(text_data=json.dumps({'status': 'success', 'message': 'Exam started.'}))
            except ValueError as ve:
                await self.send(text_data=json.dumps({'error': 'Invalid UUID format.'}))
            except Exam.DoesNotExist:
                await self.send(text_data=json.dumps({'error': 'Exam not found.'}))
            except Exception as e:
                await self.send(text_data=json.dumps({'error': str(e)}))
                
                
    async def start_exam(self):
        # Fetch the exam questions
        exam = await Exam.objects.prefetch_related('questions').aget(self.exam_id)
        question = exam.questions.first()  # Get the first question
        
        # Send the first question to the user
        await self.send(text_data=json.dumps({
            'action': 'question',
            'question': question.text,  # Assuming the question has a 'text' field
            'options': [
                {'id': option.id, 'text': option.text}
                for option in question.options.all()
            ],
            'question_id': question.id,
        }))

    async def check_answer(self, question_id, selected_option_id):
        question = await Question.objects.select_related('exam').aget(id=question_id)
        selected_option = await QuestionOption.objects.aget(id=selected_option_id, question=question)

        correct = selected_option.is_correct
        user_attempt = await ExamAttempt.objects.create(
            exam=question.exam,
            user=self.user,
            selected_option=selected_option,
            correct=correct,
            timestamp=timezone.now()
        )

        # Broadcast the result to all users in the group
        await self.channel_layer.group_send(self.group_name, {
            'type': 'send_score_update',
            'user': self.user.username,
            'correct': correct,
        })

    async def send_score_update(self, event):
        await self.send(text_data=json.dumps({
            'action': 'score_update',
            'user': event['user'],
            'correct': event['correct'],
        }))