import uuid
import pandas as pd
from io import BytesIO
from openpyxl import load_workbook

from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework import status
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

# Start a new Practice Session
class StartPracticeSessionView(APIView):
    def post(self, request):
        user = request.user  # Assuming the user is authenticated

        all_questions = list(PracticeQuestion.objects.all())
        if len(all_questions) < 10:
            return Response({'error': 'Not enough questions available.'}, status=400)

        # Select 30 random questions
        selected_questions = random.sample(all_questions, 10)
        
        # Create a new PracticeSession
        session = PracticeSession.objects.create(user=user)

        session_data = PracticeSessionSerializer(session).data
        question_data = PracticeQuestionSerializer(selected_questions, many=True).data

        return Response({
            'session': session_data,
            'questions': question_data
        }, status=status.HTTP_201_CREATED)


# Submit Answers and Calculate Score
class SubmitPracticeSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        session_id = request.data.get('session_id')

        try:
            session = PracticeSession.objects.get(id=int(session_id), user=user)
        except PracticeSession.DoesNotExist:
            return Response({'error': 'Practice session not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Save duration if provided
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

        for attempt in answers:
            selected_option_id = attempt.get('option_id')
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

        # Save score and duration
        session.score = score
        session.save()

        
        # Update user points using model method
        user_points, _ = UserPoints.objects.get_or_create(user=user)
        user_points.add_points(score)

        user_points.save()

        return Response({
            'score': score,
            'correct_answers': correct_answers,
            'wrong_answers': wrong_answers,
            'percentage': percentage_score,
            'duration_in_minutes': round(session.duration.total_seconds() / 60) if session.duration else 0,
        }, status=status.HTTP_200_OK)


# View for Leaderboard - Display Top 10 Users with highest points
class PracticeLeaderboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Step 1: Get top 10 users with the highest points
        top_users_points = (
            UserPoints.objects.select_related('user')
            .order_by('-points')[:10]
        )
        top_users = [up.user for up in top_users_points]

        # Step 2: Get points for top users and annotate
        top_data = []
        for up in top_users_points:
            top_data.append({
                'id': up.user.id,
                'username': up.user.username,
                'points': up.points,
                'attempts': PracticeSession.objects.filter(user=up.user).count(),
                'profile_image': getattr(up.user, 'profile_picture', None),
            })

        # Step 3: Serialize top users
        top_serialized = PracticeLeaderboardSerializer(top_users, many=True, context={'request': request}).data

        # Step 4: Add current user info with rank
        current_user = request.user
        current_user_points = UserPoints.objects.filter(user=current_user).first()
        current_user_data = None

        if current_user_points:
            # Get rank of current user
            user_ranks = UserPoints.objects.order_by('-points').values_list('user_id', flat=True)
            try:
                rank = list(user_ranks).index(current_user.id) + 1
            except ValueError:
                rank = None  # should not happen

            current_user_data = {
                'id': current_user.id,
                'username': current_user.username,
                'points': current_user_points.points,
                'rank': rank,
                'attempts': PracticeSession.objects.filter(user=current_user).count(),
                'profile_image': request.build_absolute_uri(current_user.profile_picture.url) if current_user.profile_picture else None,
            }

        return Response({
            'top_10': top_serialized,
            'me': current_user_data
        })




class PracticeQuestionUploadView(APIView):
    parser_classes = [MultiPartParser]

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

            with transaction.atomic():
                for index, row in df.iterrows():
                    excel_row_num = index + 2
                    question_text = str(row.get('question', '')).strip()
                    q_cell = f"{get_column_letter(df.columns.get_loc('question') + 1)}{excel_row_num}"
                    question_image = self.get_image_data_from_map(image_map.get(q_cell))

                    if not question_text and not question_image:
                        skipped_count += 1
                        continue

                    # Check if a question with the same text already exists
                    existing_question = PracticeQuestion.objects.filter(text=question_text).first()
                    if existing_question:
                        skipped_count += 1
                        continue

                    # Create the question
                    question = PracticeQuestion.objects.create(text=question_text, marks=1)

                    # Save image if any
                    if question_image:
                        q_filename = f"q_img_{question.id}_{uuid.uuid4().hex[:8]}.png"
                        q_file = self.save_image_to_field(question_image, q_filename)
                        if q_file:
                            question.image.save(q_file.name, q_file, save=True)

                    correct = str(row.get("answer", "")).strip().lower()

                    for opt in ['option1', 'option2', 'option3', 'option4']:
                        col_index = df.columns.get_loc(opt)
                        cell_ref = f"{get_column_letter(col_index + 1)}{excel_row_num}"
                        opt_image = self.get_image_data_from_map(image_map.get(cell_ref))
                        opt_text = str(row.get(opt, "")).strip()

                        is_correct = (correct == opt.lower()) or (correct == opt_text.lower())

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

    def get_image_data_from_map(self, image_data):
        if image_data:
            return image_data
        return None

    def save_image_to_field(self, image_data, filename):
        return ContentFile(image_data, name=filename)