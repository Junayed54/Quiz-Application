import uuid
import pandas as pd
from io import BytesIO
from openpyxl import load_workbook
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework import status, viewsets
from django.core.files.base import ContentFile
from django.db import transaction
from openpyxl.utils import get_column_letter
from rest_framework.permissions import IsAuthenticated
import random
from datetime import datetime, timedelta
from rest_framework import status
from rest_framework.views import APIView
from .models import *
from .serializers import *
from django.contrib.auth import get_user_model
User = get_user_model()





class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    
    
# Start a new Practice Session
class StartPracticeSessionView(APIView):
    # authentication_classes = [AllowInactiveUserJWTAuthentication]
    permission_classes = [AllowAny]
    def post(self, request):
        user = request.user  # Assuming the user is authenticated
        subject_id = request.data.get('subject_id')
        
        if not subject_id:
            return Response({'error': 'subject_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            subject = Subject.objects.get(id=subject_id)
            
        except Subject.DoesNotExist:
            return Response({'error': 'Subject not found.'}, status=status.HTTP_404_NOT_FOUND)

        questions = list(PracticeQuestion.objects.filter(subject=subject))
        
        if len(questions) < 10:
            return Response({'error': 'Not enough questions available for this subject.'}, status=status.HTTP_400_BAD_REQUEST)

        selected_questions = random.sample(questions, 10)

        question_data = PracticeQuestionSerializer(selected_questions, many=True).data

        return Response({
            'questions': question_data
        }, status=status.HTTP_201_CREATED)


# Submit Answers and Calculate Score
class SubmitPracticeSessionView(APIView):
    permission_classes = [AllowAny]  # Allow both authenticated and unauthenticated

    def post(self, request):
        user = None
        phone_number = request.data.get('phone_number')
        username = request.data.get('username')
        # print(request.data)
        if request.user and request.user.is_authenticated:
            user = request.user
        elif phone_number:
            # Try to find an existing UserPoints by phone_number
            try:
                user_points = UserPoints.objects.get(phone_number=phone_number)
                username = user_points.username  # Overwrite username if already stored
            except UserPoints.DoesNotExist:
                user_points = UserPoints.objects.create(username=username, phone_number=phone_number)
        else:
            return Response({'error': 'Authentication or phone number is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create the session
        session = PracticeSession.objects.create(user=user, username=username, phone_number=phone_number)

        # Handle duration
        duration = request.data.get('duration')
        if duration is not None:
            try:
                session.duration = timedelta(minutes=int(duration))
            except (ValueError, TypeError):
                return Response({'error': 'Invalid duration format.'}, status=status.HTTP_400_BAD_REQUEST)

        answers = request.data.get('answers', [])  # [{'question_id': ..., 'option_id': ...}]
        score = 0
        correct_answers = 0
        total_questions = len(answers)

        for question in answers:
            selected_option_id = question.get('selected_option_id')
            
            if selected_option_id:
                try:
                    selected_option = PracticeOption.objects.get(id=int(selected_option_id))
                    if selected_option.is_correct:
                        score += 1
                        correct_answers += 1
                except PracticeOption.DoesNotExist:
                    continue

        wrong_answers = total_questions - correct_answers
        percentage_score = round((correct_answers / total_questions) * 100, 2) if total_questions > 0 else 0

        # Save score
        session.score = score
        session.save()

        # Update or create UserPoints
        if user:
            user_points, _ = UserPoints.objects.get_or_create(user=user)
        elif phone_number:
            user_points, _ = UserPoints.objects.get_or_create(phone_number=phone_number, defaults={'username': username})

        user_points.add_points(score)

        return Response({
            'score': score,
            'correct_answers': correct_answers,
            'wrong_answers': wrong_answers,
            'percentage': percentage_score,
            'duration_in_minutes': round(session.duration.total_seconds() / 60) if session.duration else 0,
        }, status=status.HTTP_200_OK)

# View for Leaderboard - Display Top 10 Users with highest points
class PracticeLeaderboardAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Fetch top 10 users based on points
        top_users_points = (
            UserPoints.objects.select_related('user')
            .order_by('-points')[:10]
        )

        top_data = []
        for up in top_users_points:
            user = up.user
            profile_image = None
            if user and hasattr(user, 'profile_picture') and user.profile_picture:
                profile_image = request.build_absolute_uri(user.profile_picture.url)

            attempts = PracticeSession.objects.filter(user=user).count() if user else PracticeSession.objects.filter(phone_number=up.phone_number).count()

            top_data.append({
                'id': user.id if user else None,
                'username': user.username if user else up.username,
                'points': up.points,
                'attempts': attempts,
                'profile_image': profile_image,
            })

        current_user_data = None

        # Check if user is authenticated
        if request.user.is_authenticated:
            user = request.user
            user_points = UserPoints.objects.filter(user=user).first()
            if user_points:
                rank_list = list(UserPoints.objects.order_by('-points').values_list('user_id', flat=True))
                try:
                    rank = rank_list.index(user.id) + 1
                except ValueError:
                    rank = None

                profile_image = request.build_absolute_uri(user.profile_picture.url) if user.profile_picture else None

                current_user_data = {
                    'id': user.id,
                    'username': user.username,
                    'points': user_points.points,
                    'rank': rank,
                    'attempts': PracticeSession.objects.filter(user=user).count(),
                    'profile_image': profile_image,
                }

        # If not authenticated, check for phone_number in query params
        elif phone_number := request.query_params.get('phone_number'):
            user_points = UserPoints.objects.filter(phone_number=phone_number).first()
            if user_points:
                ranks = list(UserPoints.objects.order_by('-points').values_list('phone_number', flat=True))
                try:
                    rank = ranks.index(phone_number) + 1
                except ValueError:
                    rank = None

                current_user_data = {
                    'id': None,
                    'username': user_points.username or "Guest",
                    'points': user_points.points,
                    'rank': rank,
                    'attempts': PracticeSession.objects.filter(phone_number=phone_number).count(),
                    'profile_image': None,
                }

        return Response({
            'top_10': top_data,
            'me': current_user_data  # This will be None if no user info was found
        })




class PracticeQuestionUploadView(APIView):
    parser_classes = [MultiPartParser]

    # Optional: You may need to implement this method depending on your needs
    def extract_images(self, workbook):
        # This should return a dictionary mapping cell refs to image data
        return {}

    def get_image_data_from_map(self, img_obj):
        return img_obj

    def save_image_to_field(self, image_data, filename):
        from django.core.files.base import ContentFile
        return ContentFile(image_data, name=filename)

    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        if not file or not file.name.endswith('.xlsx'):
            return Response({'error': 'Please upload a valid .xlsx Excel file.'}, status=400)

        try:
            wb = load_workbook(file, data_only=True)
            ws = wb.active
            df = pd.DataFrame(ws.values)

            # Normalize headers
            df.columns = df.iloc[0].astype(str).str.strip().str.lower()
            df = df[1:]

            image_map = self.extract_images(wb)

            created_count, skipped_count = 0, 0

            # Label Mappings
            LABEL_MAP = {
                'option1': 'a', 'option2': 'b', 'option3': 'c', 'option4': 'd',
                'a': 'a', 'b': 'b', 'c': 'c', 'd': 'd',
                'A': 'a', 'B': 'b', 'C': 'c', 'D': 'd',
                'ক': 'a', 'খ': 'b', 'গ': 'c', 'ঘ': 'd'
            }
            OPTION_LABELS = ['a', 'b', 'c', 'd']

            with transaction.atomic():
                for index, row in df.iterrows():
                    excel_row_num = index + 2

                    question_text = str(row.get('question', '')).strip()
                    q_cell = f"{get_column_letter(df.columns.get_loc('question') + 1)}{excel_row_num}"
                    question_image = self.get_image_data_from_map(image_map.get(q_cell))

                    if not question_text and not question_image:
                        skipped_count += 1
                        continue

                    # if PracticeQuestion.objects.filter(text=question_text).exists():
                    #     skipped_count += 1
                    #     continue

                    # Get or create subject from Excel
                    subject_name = str(row.get('subject', '')).strip()
                    subject = None
                    if subject_name:
                        subject, _ = Subject.objects.get_or_create(name=subject_name)

                    # Create the question
                    question = PracticeQuestion.objects.create(
                        text=question_text,
                        marks=1,
                        subject=subject
                    )

                    if question_image:
                        q_filename = f"q_img_{question.id}_{uuid.uuid4().hex[:8]}.png"
                        q_file = self.save_image_to_field(question_image, q_filename)
                        if q_file:
                            question.image.save(q_file.name, q_file, save=True)

                    correct = str(row.get("answer", "")).strip().lower()
                    standard_correct = LABEL_MAP.get(correct, correct)

                    # Map option columns to standardized labels
                    option_columns = {}
                    for col in df.columns:
                        key = str(col).strip()
                        label = LABEL_MAP.get(key)
                        if label and label not in option_columns:
                            option_columns[label] = key

                    for label in OPTION_LABELS:
                        col_key = option_columns.get(label)
                        if not col_key:
                            continue

                        col_index = df.columns.get_loc(col_key)
                        cell_ref = f"{get_column_letter(col_index + 1)}{excel_row_num}"
                        opt_image = self.get_image_data_from_map(image_map.get(cell_ref))
                        opt_text = str(row.get(col_key, "")).strip()

                        is_correct = (standard_correct == label or standard_correct == opt_text.lower())

                        if opt_image:
                            opt_filename = f"opt_img_{question.id}_{uuid.uuid4().hex[:8]}.png"
                            opt_file = self.save_image_to_field(opt_image, opt_filename)
                            if opt_file:
                                PracticeOption.objects.create(
                                    question=question,
                                    text=None,
                                    image=opt_file,
                                    is_correct=is_correct
                                )
                        elif opt_text:
                            PracticeOption.objects.create(
                                question=question,
                                text=opt_text,
                                is_correct=is_correct
                            )

                    created_count += 1

            return Response({
                "message": "Upload complete",
                "questions_created": created_count,
                "questions_skipped": skipped_count
            })

        except Exception as e:
            return Response({'error': str(e)}, status=500)
        
        


    def extract_images(self, workbook):
        """Returns a map of Excel cell positions to image binary data"""
        image_map = {}
        for sheet in workbook.worksheets:
            for image in getattr(sheet, '_images', []):
                if hasattr(image, 'anchor'):
                    cell = image.anchor._from
                    cell_ref = f"{get_column_letter(cell.col + 1)}{cell.row + 1}"
                    with BytesIO() as output:
                        image.ref.save(output, format='PNG')
                        image_map[cell_ref] = output.getvalue()
        return image_map

    # def get_image_data_from_map(self, image_data):
    #     if image_data:
    #         return image_data
    #     return None

    # def save_image_to_field(self, image_data, filename):
    #     return ContentFile(image_data, name=filename)