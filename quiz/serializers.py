from rest_framework import serializers
from .models import *
# from users.models import User
from collections import Counter
from django.contrib.auth import get_user_model
User = get_user_model()
class QuestionOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionOption
        fields = ['id', 'text', 'is_correct', 'question']

    def create(self, validated_data):
        # Here we ensure that the question is set properly from the validated_data
        return QuestionOption.objects.create(**validated_data)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']


class QuestionUsageSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.text', read_only=True)

    class Meta:
        model = QuestionUsage
        fields = ['id', 'question', 'question_text', 'exam', 'year']
        read_only_fields = ['question_text']



class QuestionSerializer(serializers.ModelSerializer):
    options = QuestionOptionSerializer(many=True, read_only=True)
    exam = serializers.PrimaryKeyRelatedField(queryset=Exam.objects.all(), write_only=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), write_only=True)
    category_name = serializers.SerializerMethodField()
    question_usage_years = serializers.SerializerMethodField()
    created_by = serializers.StringRelatedField(read_only=True)  # Use username or any identifier as per your requirement
    reviewed_by = serializers.StringRelatedField(read_only=True) 
    class Meta:
        model = Question
        fields = ['id', 'text', 'explanation', 'marks', 'exam', 'options', 'status', 'remarks', 'category', 'created_by', 'category_name', 'difficulty_level',  'time_limit', 'reviewed_by', 'updated_at', 'created_at', 'subject', 'question_usage_years']
        
    # def get_created_by_name(self, obj):
    #     return obj.created_by if obj.exam and obj.created_by else None
       
    def get_category_name(self, obj):
        return obj.category.name if obj.category and obj.category.name else None
    
    # def get_created_at(self, obj):
    #     return obj.exam.created_at if obj.exam and obj.exam.created_at else None
    
    def get_question_usage_years(self, obj):
        # Get the years from the related QuestionUsage entries
        years = obj.usages.values_list('year', flat=True).distinct()
        return ", ".join(map(str, years)) if years else "No uses"


    def create(self, validated_data):
        options_data = validated_data.pop('options', [])
        question = Question.objects.create(**validated_data)
        for option_data in options_data:
            QuestionOption.objects.create(question=question, **option_data)
        return question





class ExamAttemptSerializer(serializers.ModelSerializer):
    score = serializers.ReadOnlyField()
    is_passed = serializers.ReadOnlyField()
    user_name = serializers.CharField(source='user.username', read_only=True)  # User's name
    total_questions = serializers.IntegerField(source='exam.total_questions', read_only=True)  # Total questions in the exam
    pass_mark = serializers.IntegerField(source='exam.pass_mark', read_only=True)  # Total questions in the exam
    exam_title = serializers.StringRelatedField(source='exam.title', read_only=True) #

    class Meta:
        model = ExamAttempt
        fields = [
            'id', 'user', 'user_name', 'exam', 'total_questions', 'answered', 'pass_mark',
            'wrong_answers', 'total_correct_answers', 'score', 'is_passed', 'attempt_time', 'score', 'exam_title'
        ]
        read_only_fields = ['attempt_time', 'score', 'is_passed']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['user_name'] = instance.user.username
        representation['total_questions'] = instance.exam.total_questions
        representation['pass_mark'] = instance.exam.pass_mark
        representation['exam_title'] = instance.exam.title
        
        
        return representation



class ExamCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamCategory
        fields = '__all__'


   
class ExamSerializer(serializers.ModelSerializer):
    status_id = serializers.IntegerField(source='exam.id', read_only=True)
    status = serializers.ReadOnlyField()  # Read-only field to display exam status
    category_name = serializers.CharField(source='category.name', read_only=True)  # Category name for convenience
    questions = QuestionSerializer(many=True, read_only=True)
    subjects = serializers.SerializerMethodField()  # Custom field for subjects with question count
    creater_name = serializers.CharField(source='created_by.username', read_only=True) 
    class Meta:
        model = Exam
        fields = [
            'exam_id', 'title', 'total_questions', 'created_by', 'creater_name', 'total_mark',
            'pass_mark', 'negative_mark', 'created_at', 'updated_at',
            'starting_time', 'last_date', 'category', 'category_name', 
            'duration', 'status', 'questions', 'status_id', 'subjects'
        ]
        read_only_fields = ['created_at', 'updated_at', 'status', 'category_name']
    
    def get_subjects(self, obj):
        # Assuming each question has a subject attribute (e.g., question.subject.name)
        question_subjects = [question.subject.name for question in obj.questions.all()]
        subject_count = Counter(question_subjects)
        # Convert to a list of dictionaries for serialization
        return [{'subject': subject, 'question_count': count} for subject, count in subject_count.items()]

class StatusSerializer(serializers.ModelSerializer):
    exam_details = serializers.SerializerMethodField()

    class Meta:
        model = Status
        fields = '__all__'

    def get_exam_details(self, obj):
        return obj.get_exam_details()

class ExamDifficultySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamDifficulty
        fields = [
            'exam',
            'difficulty1_percentage',
            'difficulty2_percentage',
            'difficulty3_percentage',
            'difficulty4_percentage',
            'difficulty5_percentage',
            'difficulty6_percentage',
        ]
    
    def validate(self, data):
        """
        Ensure that the sum of the difficulty percentages is equal to 100%.
        """
        total_percentage = (data['difficulty1_percentage'] +
                            data['difficulty2_percentage'] +
                            data['difficulty3_percentage'] +
                            data['difficulty4_percentage'] +
                            data['difficulty5_percentage'] +
                            data['difficulty6_percentage'])
        if total_percentage != 100:
            raise serializers.ValidationError("The total percentage of difficulty questions must equal 100%.")
        return data



    
class LeaderboardSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    exam = serializers.ReadOnlyField(source='exam.title')
    user_id = serializers.ReadOnlyField(source='user.id')
    position = serializers.SerializerMethodField()
    class Meta:
        model = Leaderboard
        fields = '__all__'
        
    
    def get_position(self, obj):
        # Calculate position dynamically
        ordered_leaderboard = Leaderboard.objects.filter(exam=obj.exam).order_by('-score')
        position = 1
        for entry in ordered_leaderboard:
            if entry.user == obj.user:
                return position
            position += 1
        return None





class SubjectQuestionCountSerializer(serializers.Serializer):
    subject_name = serializers.CharField()
    question_count = serializers.IntegerField()





class ResultSerializer(serializers.Serializer):
    username = serializers.CharField(source='user__username')
    cumulative_questions = serializers.IntegerField()
    cumulative_score = serializers.IntegerField()
    total_correct = serializers.IntegerField()



class QuestionUsageSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.text', read_only=True)

    class Meta:
        model = QuestionUsage
        fields = ['id', 'question', 'question_text', 'exam', 'year']
        read_only_fields = ['id', 'question_text']
        
        
class UserAnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.text', read_only=True)
    selected_option_text = serializers.CharField(source='selected_option.text', read_only=True)
    question = QuestionSerializer()
    selected_option = QuestionOptionSerializer()  

    class Meta:
        model = UserAnswer
        fields = ['id', 'exam_attempt', 'question', 'question_text', 'selected_option', 'selected_option_text', 'is_correct']




class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ["id", "name", "address"]
        
        
class DepartmentSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())

    class Meta:
        model = Department
        fields = ["id", "name", "organization"]
    
    def create(self, validated_data):
        organization = validated_data.pop('organization')  # This pops out the organization related data
        department = Department.objects.create(organization=organization, **validated_data)
        return department
        
class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = ["id", "name"]


class PastExamSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source="organization.name", read_only=True)
    department_name = serializers.CharField(source="department.name", read_only=True, allow_null=True)
    position_name = serializers.CharField(source="position.name", read_only=True)
    questions_count = serializers.SerializerMethodField()
    questions = QuestionSerializer(many=True, read_only=True)  # Detailed questions list

    class Meta:
        model = PastExam
        fields = [
            "id", "title", "organization_name", "department_name", "position_name",
            "duration", "pass_mark", "negative_mark",
            "exam_date", "is_published", "questions_count", "questions"
        ]

    def get_questions_count(self, obj):
        # Count the number of questions related to the past exam
        return obj.questions.count()

    def get_questions(self, obj):
        # This method allows detailed fetching of questions using the QuestionSerializer
        questions = obj.questions.all()  # Get all the questions related to this past exam
        return QuestionSerializer(questions, many=True).data  # Serialize questions





class PastExamCreateSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.all(), write_only=True
    )
    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), write_only=True, required=False, allow_null=True
    )
    position = serializers.PrimaryKeyRelatedField(
        queryset=Position.objects.all(), write_only=True
    )
    file = serializers.FileField(required=False, write_only=True)  # For file upload; not stored on model

    class Meta:
        model = PastExam
        fields = [
            "id",
            "title",
            "organization",
            "department",
            "position",
            "exam_date",
            "duration",
            "pass_mark",
            "negative_mark",
            "is_published",
            "file",
        ]

    def create(self, validated_data):
        # Remove file key (model doesn't have it)
        validated_data.pop("file", None)
        # Create the PastExam instance using the validated data
        instance = PastExam.objects.create(**validated_data)
        return instance



class PastExamAttemptSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)  # User's name
    past_exam_title = serializers.StringRelatedField(source='past_exam.title', read_only=True)  # Past exam title
    score = serializers.ReadOnlyField()
    attempt_time = serializers.ReadOnlyField()

    class Meta:
        model = PastExamAttempt
        fields = [
            'id', 'user', 'user_name', 'past_exam', 'past_exam_title', 'total_questions', 
            'answered_questions', 'correct_answers', 'wrong_answers', 'score', 'attempt_time'
        ]
        read_only_fields = ['attempt_time', 'score']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['user_name'] = instance.user.username
        representation['past_exam_title'] = instance.past_exam.title
        return representation
