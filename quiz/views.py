from rest_framework import viewsets, generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from .serializers import LeaderboardSerializer, ExamSerializer, QuestionSerializer, QuestionOptionSerializer, CategorySerializer, ExamDifficultySerializer, ExamAttemptSerializer
from users.serializers import UserSerializer
from .models import Exam, Status, ExamDifficulty, Question, QuestionOption, Leaderboard, ExamAttempt, Category
from .permissions import IsAdminOrReadOnly, IsAdmin
from django.utils import timezone
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.views.generic.detail import DetailView
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils.dateparse import parse_date
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models.functions import ExtractMonth, ExtractYear
from django.db import transaction, IntegrityError
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, permission_classes
from datetime import timedelta
from django.db.models import Q, Count, Sum
from random import sample
from invitation.models import ExamInvite
from calendar import monthrange
import openpyxl
import random
import pandas as pd
from .pagination import CustomPageNumberPagination
from django.contrib.auth import get_user_model
User = get_user_model()

now = timezone.now()


class LeaderboardListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, exam_id):
        try:
            leaderboards = Leaderboard.objects.filter(exam_id=exam_id).order_by('-score')[:10]  # Get top 10 scores for the exam
            serializer = LeaderboardSerializer(leaderboards, many=True)
            # print(serializer.data)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Leaderboard.DoesNotExist:
            raise Http404("Leaderboard does not exist for this exam.")


class ExamDetailView(generics.RetrieveAPIView):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    lookup_field = 'exam_id'

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context
    


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer



    

class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes=[JWTAuthentication]

    
    def perform_create(self, serializer):
        exam = serializer.save(created_by=self.request.user)
        status = 'draft'
        
        if self.request.user.role=='student':
            status = 'student'
            Status.objects.create(exam=exam, status=status, user=self.request.user)
            return Response({'exam_id': exam.exam_id})
            # invite = ExamInvite.objects.create(invited_by = self.request.user, exam=exam)
        Status.objects.create(exam=exam, status=status, user=self.request.user)
        return Response({'exam_id': exam.exam_id})
    
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], authentication_classes=[JWTAuthentication])
    def exam_list(self, request):
        # print(request.user.role)
        # Filter exams where status is 'draft' and created_by is the current user
        exams = Exam.objects.filter(exam__status='published')
        serializer = self.get_serializer(exams, many=True)
        return Response(serializer.data)
    
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], authentication_classes=[JWTAuthentication])
    def student_exam_list(self, request):
        
        exams = Exam.objects.filter(exam__status='student', created_by=self.request.user)
        serializer = self.get_serializer(exams, many=True)
        return Response(serializer.data)
    
    
    
    @action(detail=True, methods=['get'], url_path='start', permission_classes=[IsAuthenticated], authentication_classes=[JWTAuthentication])
    def start_exam(self, request, pk=None):
        exam = self.get_object()
        status = Status.objects.filter(exam = exam)
        if status.values()[0]['status'] == 'published' or status.values()[0]['status'] == 'student':
            user = self.request.user
            return Response({
            'exam_id': exam.exam_id,
            'title': exam.title,
            'total_questions': exam.total_questions,
            'start_time': timezone.now(),  # Just return the current time as start time
        })
        
        
        return Response({"message": "The exam didn't published"})
        
        
        

    @action(detail=True, methods=['get'], url_path='questions', permission_classes=[IsAuthenticated], authentication_classes=[JWTAuthentication])
    def get_questions(self, request, pk=None):
        exam = self.get_object()
        questions_to_generate = exam.questions_to_generate
        print("question to generate", questions_to_generate)
        # Fetch the difficulty percentages from ExamDifficulty model
        try:
            difficulty = ExamDifficulty.objects.get(exam=exam)
        except ExamDifficulty.DoesNotExist:
            return Response({"error": "Difficulty settings not found for this exam."}, status=404)

        # Map difficulty levels to actual numeric values
        difficulty_distribution = {
            1: round(difficulty.difficulty1_percentage / 100 * questions_to_generate),
            2: round(difficulty.difficulty2_percentage / 100 * questions_to_generate),
            3: round(difficulty.difficulty3_percentage / 100 * questions_to_generate),
            4: round(difficulty.difficulty4_percentage / 100 * questions_to_generate),
            5: round(difficulty.difficulty5_percentage / 100 * questions_to_generate),
            6: round(difficulty.difficulty6_percentage / 100 * questions_to_generate),
        }

        selected_questions = []
        question_ids_selected = set()

        # For each difficulty level, randomly select the appropriate number of questions
        for difficulty_level, count in difficulty_distribution.items():
            if count > 0:
                questions = Question.objects.filter(exam=exam, difficulty_level=difficulty_level)
                if questions.count() > 0:
                    print("The", count)
                    # Adjust count if there are fewer questions than needed
                    count = min(count, questions.count())
                    question_sample = random.sample(list(questions), count)
                    selected_questions.extend(question_sample)
                    # print(len(selected_questions))
                    question_ids_selected.update(q.id for q in question_sample)

        # If the total number of selected questions is less than `questions_to_generate`, fill with random questions
        total_selected = len(selected_questions)
        print(total_selected)
        serializer = QuestionSerializer(selected_questions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='submit', permission_classes=[IsAuthenticated], authentication_classes=[JWTAuthentication])
    def submit_exam(self, request, pk=None):
        exam = self.get_object()
        user = request.user

        answers = request.data.get('answers', [])

        correct_answers = 0
        wrong_answers = 0

        # Calculate correct and wrong answers
        for answer in answers:
            question_id = answer.get('question_id')
            selected_option_id = answer.get('option')
            
            try:
                question = Question.objects.get(id=question_id, exam=exam)
                selected_option = QuestionOption.objects.get(id=selected_option_id, question=question)

                if selected_option.is_correct:
                    correct_answers += 1
                else:
                    wrong_answers += 1

            except (Question.DoesNotExist, QuestionOption.DoesNotExist):
                return Response({'detail': 'Invalid question or option provided.'}, status=status.HTTP_400_BAD_REQUEST)
            
            exam.correct_answers = correct_answers

        # Create an exam attempt instance
        exam_attempt = ExamAttempt.objects.create(
            exam=exam,
            user=user,
            total_correct_answers=correct_answers
        )

        # Update the exam fields
        exam.correct_answers = correct_answers
        exam.wrong_answers = wrong_answers
        exam.save()

        # Update the leaderboard with the best score
        Leaderboard.update_best_score(user, exam)

        return Response({
            'correct_answers': correct_answers,
            'wrong_answers': wrong_answers,
        })
        
    
    @action(detail=True, methods=['post'])
    def generate_exam(self, request, pk=None):
        """
        Custom action to generate an exam by selecting random questions based on difficulty percentages.
        """
        exam_id = pk  # Get the exam ID from the URL
        
        # Ensure total_questions is treated as an integer
        try:
            total_questions = int(request.data.get('total_questions', 10))  # Cast to int
        except ValueError:
            return Response({'error': 'Invalid total questions number.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Fetch the exam and its associated difficulty percentages
            exam = Exam.objects.get(exam_id=exam_id)
            total_questions = exam.total_questions
            difficulty = ExamDifficulty.objects.get(exam=exam)
        except Exam.DoesNotExist:
            return Response({'error': 'Exam not found.'}, status=status.HTTP_404_NOT_FOUND)
        except ExamDifficulty.DoesNotExist:
            return Response({'error': 'Difficulty settings not found for this exam.'}, status=status.HTTP_404_NOT_FOUND)

        # Retrieve difficulty percentages
        difficulty_percentages = {
            'difficulty1': difficulty.difficulty1_percentage,
            'difficulty2': difficulty.difficulty2_percentage,
            'difficulty3': difficulty.difficulty3_percentage,
            'difficulty4': difficulty.difficulty4_percentage,
            'difficulty5': difficulty.difficulty5_percentage,
            'difficulty6': difficulty.difficulty6_percentage,
        }

        # Calculate the number of questions for each difficulty level based on the total question count
        question_distribution = {
            'difficulty1': round((difficulty_percentages['difficulty1'] / 100) * total_questions),
            'difficulty2': round((difficulty_percentages['difficulty2'] / 100) * total_questions),
            'difficulty3': round((difficulty_percentages['difficulty3'] / 100) * total_questions),
            'difficulty4': round((difficulty_percentages['difficulty4'] / 100) * total_questions),
            'difficulty5': round((difficulty_percentages['difficulty5'] / 100) * total_questions),
            'difficulty6': total_questions - (
                round((difficulty_percentages['difficulty1'] / 100) * total_questions) +
                round((difficulty_percentages['difficulty2'] / 100) * total_questions) +
                round((difficulty_percentages['difficulty3'] / 100) * total_questions) +
                round((difficulty_percentages['difficulty4'] / 100) * total_questions) +
                round((difficulty_percentages['difficulty5'] / 100) * total_questions)
            )
        }

        # Fetch published questions for each difficulty level
        questions_by_difficulty = {
            'difficulty1': list(Question.objects.filter(status='published', difficulty_level=1)),
            'difficulty2': list(Question.objects.filter(status='published', difficulty_level=2)),
            'difficulty3': list(Question.objects.filter(status='published', difficulty_level=3)),
            'difficulty4': list(Question.objects.filter(status='published', difficulty_level=4)),
            'difficulty5': list(Question.objects.filter(status='published', difficulty_level=5)),
            'difficulty6': list(Question.objects.filter(status='published', difficulty_level=6)),
        }

        # Randomly sample the required number of questions for each difficulty
        selected_questions = []
        for difficulty_level, question_count in question_distribution.items():
            questions = questions_by_difficulty[difficulty_level]
            if question_count > 0:
                selected_questions += sample(questions, min(len(questions), question_count))

        print(len(selected_questions))
        # Check if we have enough questions selected
        if len(selected_questions) < total_questions:
            return Response({'error': 'Not enough questions available to generate the exam.'}, status=status.HTTP_400_BAD_REQUEST)

        # Associate the selected questions with the exam
        exam.questions.set(selected_questions)
        exam.save()

        return Response({
            'message': 'Exam generated successfully.',
            'exam_id': exam.exam_id,
            'questions': [q.id for q in selected_questions]
        }, status=status.HTTP_200_OK)

    #admin attampt check
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def all_exams_with_attempts(self, request):
        # Get all exams and annotate them with the count of related ExamAttempt objects
        exams = Exam.objects.annotate(num_attempts=Count('attempts'))
        
        # Prepare the response data
        data = []
        for exam in exams:
            data.append({
                'exam_id': str(exam.exam_id),  # Assuming exam.id is UUID
                'exam_title': exam.title,
                'num_attempts': exam.num_attempts
            })

        return Response(data)
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def user_attempts(self, request, pk=None):
        # Get the exam by its primary key (UUID)
        try:
            exam = Exam.objects.get(exam_id=pk)
        except Exam.DoesNotExist:
            return Response({"error": "Exam not found."}, status=404)

        # Fetch users who attempted the specific exam and count their attempts
        user_attempts = (
            ExamAttempt.objects.filter(exam=exam)
            .values('user__username')
            .annotate(num_attempts=Count('id'))  # Count the number of attempts per user
            .order_by('-num_attempts')
        )

        # Prepare the response data
        data = []
        for user_attempt in user_attempts:
            data.append({
                'username': user_attempt['user__username'],
                'num_attempts': user_attempt['num_attempts'],
            })

        return Response(data)
    
    

class ExamDifficultyView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = ExamDifficultySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Exam difficulty added successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

    def perform_create(self, serializer):
        exam = serializer.validated_data.get('exam')
        question = serializer.save(exam=exam)
        return Response({"question_id": question.id})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminOrReadOnly])
    def add_option(self, request, pk=None):
        question = self.get_object()
        serializer = QuestionOptionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(question=question)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def upload_questions(self, request):
        # Check if a file is provided in the request
        if 'file' not in request.FILES:
            return Response({"error": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)

        file = request.FILES['file']

        # Try to read the file as an Excel file
        try:
            df = pd.read_excel(file)
        except Exception as e:
            return Response({"error": f"Error reading file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure the required columns are in the Excel file
        required_columns = ['Question', 'Option1', 'Option2', 'Option3', 'Option4', 'Answer', 'Options_num', 'Category', 'Difficulty']
        if not all(col in df.columns for col in required_columns):
            missing_cols = [col for col in required_columns if col not in df.columns]
            return Response({"error": f"Missing columns: {', '.join(missing_cols)}"}, status=status.HTTP_400_BAD_REQUEST)

        question_count = 0  # Counter for successfully added questions
        duplicate_questions = []  # List to store duplicated questions
        error_details = []  # List to store detailed errors

        # Perform atomic transaction to ensure either all or none of the records are added
        try:
            with transaction.atomic():
                for _, row in df.iterrows():
                    # Get data from the row
                    question_text = row['Question']
                    options = [row['Option1'], row['Option2'], row['Option3'], row['Option4']]
                    correct_answer = row['Answer'].strip().lower().replace(" ", "")  # Normalize answer for comparison
                    option_num = row['Options_num']
                    category_name = row['Category']
                    difficulty_level = int(row['Difficulty'])

                    # Validate the difficulty level
                    if difficulty_level not in range(1, 7):
                        error_details.append(f"Question '{question_text}' has invalid difficulty level {difficulty_level}. It must be between 1 and 6.")
                        continue

                    # Get or create category
                    category, created = Category.objects.get_or_create(name=category_name)

                    try:
                        # Create the question
                        question, created = Question.objects.get_or_create(
                            text=question_text,
                            defaults={
                                'marks': 1,
                                'category': category,
                                'difficulty_level': difficulty_level,
                                'created_by': request.user,
                                'status': 'submitted'  # Assuming 'submitted' is the status
                            }
                        )

                        if created:
                            question_count += 1

                            # Create the options for the question
                            for i, option_text in enumerate(options, start=1):
                                normalized_option_label = f"option{i}".strip().lower().replace(" ", "")  # Normalize option label
                                is_correct = (normalized_option_label == correct_answer)  # Compare normalized values
                                QuestionOption.objects.create(
                                    question=question,
                                    text=option_text,
                                    is_correct=is_correct
                                )
                        else:
                            # Track duplicate questions
                            duplicate_questions.append(question_text)

                    except IntegrityError:
                        # Handle other potential integrity errors and log error
                        error_details.append(f"Error creating question '{question_text}'.")
                        continue

        # Handle any exceptions that may occur during the transaction
        except Exception as e:
            return Response({"error": f"Error while saving questions: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Prepare response message
        response_message = f"{question_count} questions uploaded successfully."
        if duplicate_questions:
            response_message += f" Duplicate questions skipped: {', '.join(duplicate_questions)}"
        if error_details:
            response_message += f" Errors: {', '.join(error_details)}"

        return Response({"message": response_message}, status=status.HTTP_200_OK)



    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminOrReadOnly])
    def user_questions(self, request):
        user = self.request.user
        
        user_questions = Question.objects.filter(created_by=user)  # Filter by the logged-in user
        # print(user_questions)
        serializer = self.get_serializer(user_questions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def submitted_users(self, request):
        # Get users who have submitted questions (status='submitted')
        submitted_status = 'submitted'
        users = User.objects.filter(
            question_created_by__status=submitted_status
        ).annotate(total_submitted_questions=Count('question_created_by')).distinct()

        # Prepare the user data for the response
        users_data = [
            {
                'username': user.username,
                'total_questions': user.total_submitted_questions,
                'user_id': user.id
            }
            for user in users
        ]

        # Return the list of users with their total submitted questions
        return Response(users_data, status=status.HTTP_200_OK)

    # View all submitted questions of a specific user
    @action(detail=False, methods=['get'], url_path='submitted_questions/(?P<user_id>\d+)')
    def submitted_questions(self, request, user_id=None):
        submitted_status = 'submitted'
        user = User.objects.get(id=user_id)
        # print('Hello')

        user_questions = Question.objects.filter(created_by=user, status=submitted_status)  # Filter by the logged-in user
        serializer = self.get_serializer(user_questions, many=True)
        return Response(serializer.data)

    # List users with reviewed questions and show total reviewed questions
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def reviewed_users(self, request):
        """
        Custom view to get users whose questions have a status of 'reviewed' and 
        were reviewed by the currently logged-in user, along with the total number of such questions.
        """
        user = self.request.user

        # Filter questions that are reviewed by the logged-in user and have a status of 'reviewed'
        questions = Question.objects.filter(status='reviewed', reviewed_by=user)

        # Aggregate data to count the total number of questions reviewed by the logged-in user
        users = User.objects.filter(
            question_created_by__in=questions
        ).annotate(total_reviewed_questions=Count('question_created_by')).distinct()

        # Prepare user data with total reviewed questions
        users_data = [
            {
                'username': user.username,
                'total_reviewed_questions': user.total_reviewed_questions,
                'user_id': user.id
            }
            for user in users
        ]

        # Return the list of users with the total number of reviewed questions
        return Response(users_data, status=status.HTTP_200_OK)

    # View all reviewed questions of a specific user
    @action(detail=True, methods=['get'], permission_classes=[IsAdminOrReadOnly])
    def reviewed_questions(self, request, pk=None):
        reviewed_status = 'reviewed'
        # print('hello')
        # print("pk: ", pk)
        # Get the reviewer (the logged-in user)
        reviewer =self.request.user
        # print(reviewer)

        # If user_id is provided, filter questions created by that user and reviewed by the current reviewer
        if pk:
            user = User.objects.get(id=pk)
            # Filter questions created by the user and reviewed by the current reviewer with a "reviewed" status
            questions = Question.objects.filter(
                created_by=user,
                status=reviewed_status,
                reviewed_by=reviewer
            ).distinct()
        else:
            # If no user_id is provided, just get the questions reviewed by the current reviewer
            questions = Question.objects.filter(
                status_history__status=reviewed_status,
                status_history__user=reviewer
            ).distinct()

        # Serialize the reviewed questions
        serializer = self.get_serializer(questions, many=True)

        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def approved_users(self, request):
        """
        Custom view to get users whose questions have a status of 'reviewed' and 
        were reviewed by the currently logged-in user, along with the total number of such questions.
        """
        user = self.request.user

        # Filter questions that are reviewed by the logged-in user and have a status of 'reviewed'
        questions = Question.objects.filter(status='approved')

        # Aggregate data to count the total number of questions reviewed by the logged-in user
        users = User.objects.filter(
            question_created_by__in=questions
        ).annotate(total_reviewed_questions=Count('question_created_by')).distinct()
        # print(users)
        # Prepare user data with total reviewed questions
        users_data = [
            {
                'username': user.username,
                'total_approved_questions': user.total_reviewed_questions,
                'reviewer': questions.filter(created_by=user).first().reviewed_by.username if questions.filter(created_by=user).first() else None,
                'user_id': user.id
            }
            for user in users
        ]

        # Return the list of users with the total number of reviewed questions
        return Response(users_data, status=status.HTTP_200_OK)
    
        
    @action(detail=True, methods=['get'], permission_classes=[IsAdminOrReadOnly])
    def approved_questions(self, request, pk=None):
        reviewed_status = 'approved'
        # print('hello')
        # print("pk: ", pk)
        # Get the reviewer (the logged-in user)
        user = self.request.user

        # If user_id is provided, filter questions created by that user and reviewed by the current reviewer
        if pk:
            user = User.objects.get(id=pk)
            # Filter questions created by the user and reviewed by the current reviewer with a "reviewed" status
            questions = Question.objects.filter(
                created_by=user,
                status=reviewed_status,
            ).distinct()
        else:
            # If no user_id is provided, just get the questions reviewed by the current reviewer
            questions = Question.objects.filter(
                status_history__status=reviewed_status,
                status_history__user=reviewer
            ).distinct()

        # Serialize the reviewed questions
        serializer = self.get_serializer(questions, many=True)
        # id = pk
        # data ={"id": id, "questions": serializer.data}
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def submit_all_reviews(self, request):
        reviews = request.data.get('reviews', [])
        
        if not reviews:
            return Response({"error": "No reviews provided"}, status=status.HTTP_400_BAD_REQUEST)

        question_ids = [review.get('question_id') for review in reviews]
        remarks_by_id = {review.get('question_id'): review.get('remarks', '') for review in reviews}
        
        # val = remarks_by_id.get('1760', '')
        # print(val)
        # print("id: ", question_ids)
        # print("remarks: ", remarks_by_id)

        # Use a transaction to wrap the whole process
        with transaction.atomic():
            questions = Question.objects.filter(id__in=question_ids)
            # print(questions)
            for question in questions:
                # print(remarks_by_id.get(question.id))
                # print("remark", remarks_by_id.get(question.id, ''))
                print(question.id)
                question.remarks = remarks_by_id.get(str(question.id), '')
                question.status = 'approved'
            
            Question.objects.bulk_update(questions, ['remarks', 'status'])

        return Response({"message": "All reviews processed successfully"}, status=status.HTTP_200_OK)
    
    
    
    @action(detail=False, methods=['post'], permission_classes=[IsAdmin])
    def assign_teacher(self, request):
        """
        Custom action to assign a teacher to multiple questions and update their status to reviewed
        """
        teacher_id = self.request.data.get('teacherId')
        question_ids = self.request.data.get('question_ids', [])
        print("teacher id:", teacher_id)
        if not teacher_id:
            return Response({'error': 'Teacher id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not question_ids or not isinstance(question_ids, list):
            return Response({'error': 'A list of question IDs is required.'}, status=status.HTTP_400_BAD_REQUEST)

        teacher = get_object_or_404(User, id=teacher_id, role='teacher')

        questions = Question.objects.filter(id__in=question_ids).update(reviewed_by=teacher, status='reviewed')
        updated_count = 0
             
        return Response({'message': f'{updated_count} questions updated.'}, status=status.HTTP_200_OK)
    
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def publish_approved(self, request, pk):
        user = get_object_or_404(User, id=pk)

        # Filter questions created by the user with status 'approved'
        approved_questions = Question.objects.filter(created_by=user, status='approved')

        if not approved_questions.exists():
            return Response({'error': 'No approved questions found for this user.'}, status=status.HTTP_404_NOT_FOUND)

        # Split questions based on whether they have remarks
        questions_with_remarks = approved_questions.filter(~Q(remarks=''))  # Questions with remarks
        questions_without_remarks = approved_questions.filter(remarks='')  # Questions without remarks

        # Update the status of questions with remarks to 'rejected'
        rejected_count = questions_with_remarks.update(status='rejected')

        # Update the status of questions without remarks to 'published'
        published_count = questions_without_remarks.update(status='published')

        return Response({
            'message': f'{published_count} questions published successfully and {rejected_count} questions rejected.'
        }, status=status.HTTP_200_OK)


    @action(detail=False, methods=['get'], permission_classes=[IsAdminOrReadOnly])
    def question_bank(self, request):
        try:
            # Get all questions with 'approved' status
            questions = Question.objects.filter(status='published')
            paginator = CustomPageNumberPagination()
            paginated_questions = paginator.paginate_queryset(questions, request)
            
            # Serialize the updated questions
            serializer = self.get_serializer(paginated_questions, many=True)

            return paginator.get_paginated_response(serializer.data)

        except Exception as e:
            # Log the error message
            print(f"Error in question_bank view: {e}")
            return Response({'error': 'An error occurred while fetching questions.'}, status=500)

   
    @action(detail=False, methods=['get'], permission_classes=[IsAdminOrReadOnly])
    def get_remarks(self, request):
        questions = self.get_queryset().exclude(remarks='')
        serializer = self.get_serializer(questions, many=True)
        return Response(serializer.data)
    
class QuestionOptionViewSet(viewsets.ModelViewSet):
    queryset = QuestionOption.objects.all()
    serializer_class = QuestionOptionSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    authentication_classes = [JWTAuthentication]
    
    def perform_create(self, serializer):
        question = serializer.validated_data.get('question')  # Ensure exam is included
        serializer.save(question=question)

    
    
class UserCreatedExamsView(ListAPIView):
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        return Exam.objects.filter(created_by=user)


class ExamUploadView(APIView):
    def post(self, request, *args, **kwargs):
        exam_id = request.POST.get('exam_id')

        if not exam_id:
            return Response({"error": "Exam ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        if 'file' not in request.FILES:
            return Response({"error": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            exam = Exam.objects.get(exam_id=exam_id)
        except Exam.DoesNotExist:
            return Response({"error": "Exam not found."}, status=status.HTTP_404_NOT_FOUND)

        file = request.FILES['file']
        try:
            df = pd.read_excel(file)
        except Exception as e:
            return Response({"error": f"Error reading file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        required_columns = ['Question', 'Option1', 'Option2', 'Option3', 'Option4', 'Answer', 'Options_num', 'Category', 'Difficulty']
        df_columns_lower = [col.lower() for col in df.columns]

        # Check for missing columns in a case-insensitive manner
        missing_cols = [col for col in required_columns if col.lower() not in df_columns_lower]
        if missing_cols:
            return Response({"error": f"Missing columns: {', '.join(missing_cols)}"}, status=status.HTTP_400_BAD_REQUEST)

        question_count = 0
        duplicate_questions = []

        try:
            with transaction.atomic():
                for _, row in df.iterrows():
                    # Normalize column access to be case-insensitive
                    row = {col.lower(): value for col, value in row.items()}

                    question_text = row['question']
                    options = [row['option1'], row['option2'], row['option3'], row['option4']]

                    # Normalize the correct answer (e.g., 'Option 2' becomes 'option2')
                    correct_answer = row['answer'].strip().lower().replace(" ", "")

                    # Check if the question already exists for this exam (to avoid duplicates)
                    if Question.objects.filter(exam=exam, text=question_text).exists():
                        duplicate_questions.append(question_text)
                        continue

                    # Handle the difficulty level and category
                    category_name = row['category']
                    try:
                        difficulty_level = int(row['difficulty'])  # Assuming difficulty is an integer
                    except ValueError:
                        return Response({"error": f"Invalid difficulty level '{row['difficulty']}'. It must be an integer."}, status=status.HTTP_400_BAD_REQUEST)

                    if difficulty_level not in range(1, 7):  # Validate difficulty level
                        return Response({"error": f"Invalid difficulty level {difficulty_level}. It must be between 1 and 6."}, status=status.HTTP_400_BAD_REQUEST)

                    category, created = Category.objects.get_or_create(name=category_name)
                    question_count += 1

                    # Create the question object
                    question = Question.objects.create(
                        exam=exam,
                        text=question_text,
                        marks=1,  # Assuming static marks for each question
                        category=category,
                        difficulty_level=difficulty_level
                    )

                    # Create the options and mark the correct one
                    for i, option_text in enumerate(options, start=1):
                        normalized_option_label = f"option{i}".strip().lower().replace(" ", "")  # Normalize option label
                        is_correct = (normalized_option_label == correct_answer)  # Compare normalized values
                        QuestionOption.objects.create(
                            question=question,
                            text=option_text,
                            is_correct=is_correct
                        )
                
                # Update the total number of questions in the exam
                exam.total_questions = question_count
                exam.save()

                # Provide feedback on duplicate questions
                if duplicate_questions:
                    return Response({"message": "Some questions were duplicates and skipped.", "duplicates": duplicate_questions}, status=status.HTTP_201_CREATED)
                else:
                    return Response({"message": "All questions created successfully."}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)





class TeacherListView(ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        teachers = User.objects.filter(role='teacher').exclude(id=self.request.user.id)
        print("the teacher", teachers[0].username)
        # Filter users who are teachers (you might use a role or a specific flag)
        return teachers

class StudentListView(ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        students = User.objects.filter(role='student').exclude(id=self.request.user.id)
        # print("the student", students[0].username)
        # Filter users who are teachers (you might use a role or a specific flag)
        return students

class QuestionHistoryByMonthView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    authentication_classes = [JWTAuthentication]

    def get(self, request, format=None):
        year = request.query_params.get('year')
        month = request.query_params.get('month')

        if not year or not month:
            return Response({'detail': 'Year and month are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            year = int(year)
            month = int(month)
            if month < 1 or month > 12:
                raise ValueError
        except (ValueError, TypeError):
            return Response({'detail': 'Invalid year or month.'}, status=status.HTTP_400_BAD_REQUEST)

        # Construct the start and end date for the month
        start_date = parse_date(f'{year}-{month:02d}-01')
        end_day = start_date.replace(day=28) + timedelta(days=4)  # Get the last day of the month
        end_date = end_day - timedelta(days=end_day.day)

        # Filter questions that are published and created within the date range
        questions = Question.objects.filter(
            created_at__range=(start_date, end_date),
            status='published'
        )

        # Serialize the results
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    
class QuestionHistoryByTeacherMonthYearView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    authentication_classes = [JWTAuthentication]

    def get(self, request, format=None):
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        teacher_id = request.query_params.get('teacher_id')

        # Validate parameters
        if not year or not month or not teacher_id:
            return Response({'detail': 'Year, month, and teacher_id are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            year = int(year)
            month = int(month)
            teacher_id = int(teacher_id)
            if month < 1 or month > 12:
                raise ValueError
        except (ValueError, TypeError):
            return Response({'detail': 'Invalid year, month, or teacher_id.'}, status=status.HTTP_400_BAD_REQUEST)
        
        
        # Verify teacher_id is a valid teacher
        if not User.objects.filter(id=teacher_id, role='teacher').exists():
            return Response({'detail': 'Invalid teacher_id.'}, status=status.HTTP_400_BAD_REQUEST)

        
        
        # Annotating month and year from created_at
        questions = Question.objects.annotate(
            question_month=ExtractMonth('created_at'),
            question_year=ExtractYear('created_at')
        ).filter(
            created_by_id=teacher_id
        )

        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserQuestionSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        month = request.data.get('month')
        year = request.data.get('year')
        user_id = request.data.get('user_id')
        print("hello world")
        print(month, year, user_id)
        # Validate parameters
        if not year or not month:
            return Response({'detail': 'Year and month are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            year = int(year)
            month = int(month)
            if month < 1 or month > 12:
                raise ValueError
        except ValueError:
            return Response({'detail': 'Invalid year or month.'}, status=status.HTTP_400_BAD_REQUEST)

        results = []

        if user_id:
            if isinstance(user_id, str) and user_id.lower() == "all":
                teachers = User.objects.filter(role='teacher')
                overall_summary = self.get_category_summary(year, month)
            else:
                try:
                    user_id = int(user_id)
                    teachers = User.objects.filter(id=user_id, role='teacher')
                except ValueError:
                    return Response({'detail': 'Invalid user ID.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            teachers = User.objects.filter(role='teacher')

        for teacher in teachers:
            total_questions = Question.objects.filter(
                Q(exam__created_by=teacher) & Q(exam__created_at__year=year, exam__created_at__month=month)
            ).count()

            category_counts = Question.objects.filter(
                Q(exam__created_by=teacher) & Q(exam__created_at__year=year, exam__created_at__month=month)
            ).values('category__name').annotate(
                question_count=Count('id')
            ).order_by('category__name')

            category_data = [
                {'category_name': item['category__name'], 'question_count': item['question_count']}
                for item in category_counts
            ]
            print(total_questions)

            results.append({
                'username': teacher.username,
                'total_questions': total_questions,
                'categories': category_data
            })

        if user_id and isinstance(user_id, str) and user_id.lower() == "all":
            # print(overall_summary)
            return Response({
                'overall_summary': overall_summary,
                'individual_teachers': results
            }, status=status.HTTP_200_OK)

        return Response(results, status=status.HTTP_200_OK)

    def get_category_summary(self, year, month):
        category_counts = Question.objects.filter(
            exam__created_at__year=year,
            exam__created_at__month=month
        ).values('category__name').annotate(
            question_count=Count('id')
        ).order_by('category__name')

        return [
            {'category_name': item['category__name'], 'question_count': item['question_count']}
            for item in category_counts
        ]

# Work Flow 
class ExamAttemptViewSet(viewsets.ViewSet):
    queryset = ExamAttempt.objects.all()
    serializer_class = ExamAttemptSerializer
    permission_classes = []
    
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def all_attempts(self, request):
        user = self.request.user

        # Query to get all the exams the user has attempted
        user_attempts = ExamAttempt.objects.filter(user=user).select_related('exam')

        if not user_attempts.exists():
            return Response({"message": "No exam attempts found for this user."}, status=status.HTTP_404_NOT_FOUND)

        # Aggregate the number of attempts and include exam_id, exam title, and count of attempts per exam
        exams_summary = user_attempts.values('exam_id', 'exam__title').annotate(
            num_attempts=Count('id'),
        ).order_by('-num_attempts')

        # Return the data in the response
        return Response(exams_summary, status=status.HTTP_200_OK)
    

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def user_attempts(self, request):
        user = self.request.user
        exam_id = request.query_params.get('exam_id', None)  # Get 'exam_id' from the query parameters
        # exam_id = pk
        if not exam_id:
            return Response({"error": "exam_id parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate that the exam exists
        try:
            exam = Exam.objects.get(exam_id=exam_id)
        except Exam.DoesNotExist:
            return Response({"error": "Exam not found."}, status=status.HTTP_404_NOT_FOUND)

        # Fetch all attempts by the user for the specific exam
        user_attempts = ExamAttempt.objects.filter(user=user, exam=exam)

        if not user_attempts.exists():
            return Response({"message": "No attempts found for this exam."}, status=status.HTTP_404_NOT_FOUND)

        # Serialize the attempts
        serializer = ExamAttemptSerializer(user_attempts, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
    
    

@login_required
@api_view(['GET'])
def user_attempts_by_month(request):
    user = request.user
    month = request.GET.get('month')
    year = request.GET.get('year')

    if not month or not year:
        return Response({"error": "Month and year parameters are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        month = int(month)
        year = int(year)
    except ValueError:
        return Response({"error": "Invalid month or year."}, status=status.HTTP_400_BAD_REQUEST)

    # Validate month and year
    if month < 1 or month > 12 or year < 1:
        return Response({"error": "Month must be between 1 and 12 and year must be positive."}, status=status.HTTP_400_BAD_REQUEST)

    # Create timezone-aware dates
    start_date = timezone.make_aware(timezone.datetime(year, month, 1))
    end_date = (timezone.make_aware(timezone.datetime(year, month, 1)) + timezone.timedelta(days=31)).replace(day=1) - timezone.timedelta(seconds=1)

    # Filter attempts by the selected month and year
    attempts = ExamAttempt.objects.filter(user=user, timestamp__range=(start_date, end_date))

    if not attempts.exists():
        return Response({"message": "No attempts found for the selected month."})

    serializer = ExamAttemptSerializer(attempts, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@login_required
@api_view(['GET'])
@permission_classes([IsAdmin])
def user_exam_attempts_by_month(request):
    user_id = request.GET.get('user_id')
    month = request.GET.get('month')
    year = request.GET.get('year')

    if not user_id or not month or not year:
        return Response({"error": "User ID, month, and year parameters are required."})

    try:
        month = int(month)
        year = int(year)
        user = User.objects.get(id=user_id)
    except (ValueError, User.DoesNotExist):
        return Response({"error": "Invalid month, year, or user ID."})

    # Validate month and year
    if month < 1 or month > 12 or year < 1:
        return Response({"error": "Month must be between 1 and 12 and year must be positive."})

    # Create timezone-aware dates
    start_date = timezone.make_aware(timezone.datetime(year, month, 1))
    end_date = (timezone.make_aware(timezone.datetime(year, month, 1)) + timezone.timedelta(days=31)).replace(day=1) - timezone.timedelta(seconds=1)

    # Filter attempts by the selected month and year
    attempts = ExamAttempt.objects.filter(user=user, timestamp__range=(start_date, end_date))

    if not attempts.exists():
        return Response({"message": "No attempts found for the selected month for this user."})

    serializer = ExamAttemptSerializer(attempts, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)