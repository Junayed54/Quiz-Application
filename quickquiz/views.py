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
        user = request.user  # Authenticated user
        session_id = request.data.get('session_id')
        print(request.data)

        try:
            session = PracticeSession.objects.get(id=int(session_id), user=user)
        except PracticeSession.DoesNotExist:
            return Response({'error': 'Practice session not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Save duration if provided
        duration = request.data.get('duration')
        if duration is not None:
            try:
                # Convert duration (in seconds) to timedelta
                session.duration = timedelta(seconds=int(duration))
            except (ValueError, TypeError):
                return Response({'error': 'Invalid duration format.'}, status=status.HTTP_400_BAD_REQUEST)

        answers = request.data.get('answers', [])  # Expected format: [{'question_id': ..., 'selected_option_id': ...}, ...]
        score = 0
        correct_answers = 0

        for attempt_data in answers:
            selected_option_id = attempt_data.get('selected_option_id')
            if selected_option_id:
                try:
                    selected_option = PracticeOption.objects.get(id=int(selected_option_id))
                    if selected_option.is_correct:
                        score += 1
                        correct_answers += 1
                except PracticeOption.DoesNotExist:
                    continue  # Skip invalid option

        # Save score and duration
        session.score = score
        session.save()

        # Update or create user points
        user_points, _ = UserPoints.objects.get_or_create(user=user)
        user_points.points += score
        user_points.save()

        return Response({
            'score': score,
            'correct_answers': correct_answers,
            'duration_in_minutes': round(session.duration.total_seconds() / 60) if session.duration else 0,
        }, status=status.HTTP_200_OK)


# View for Leaderboard - Display Top 10 Users with highest points
class LeaderboardView(APIView):
    def get(self, request):
        # Get top 10 users based on points
        leaderboard = UserPoints.objects.order_by('-points')[:10]
        leaderboard_data = [{'user': user.user.username, 'points': user.points} for user in leaderboard]

        return Response(leaderboard_data, status=status.HTTP_200_OK)



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
            df.columns = df.iloc[0]
            df = df[1:]

            image_map = self.extract_images(wb)

            created_count, skipped_count = 0, 0
            question_col = 'question'
            available_options = ['option1', 'option2', 'option3', 'option4']

            with transaction.atomic():
                for index, row in df.iterrows():
                    excel_row_num = index + 2
                    question_text = str(row.get('question', "")).strip()
                    q_cell = f"{get_column_letter(df.columns.get_loc('question') + 1)}{excel_row_num}"
                    question_image = self.get_image_data_from_map(image_map.get(q_cell))

                    if not question_text and not question_image:
                        skipped_count += 1
                        continue

                    # Get or create question (match on text or image)
                    question, created = PracticeQuestion.objects.get_or_create(
                        text=question_text if not question_image else None,
                        image=None if not question_image else None,
                        defaults={'marks': 1}
                    )

                    if not created:
                        skipped_count += 1  # Skip if question already exists
                        continue

                    # Save image if it's a new question and has image
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

                        is_correct = (correct == opt.lower()) or (correct == opt_text)

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