from rest_framework import serializers
from django.utils.timesince import timesince
from .models import *


class PracticeOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PracticeOption
        fields = ['id', 'text', 'image', 'is_correct']

class PracticeQuestionSerializer(serializers.ModelSerializer):
    options = PracticeOptionSerializer(many=True, read_only=True)

    class Meta:
        model = PracticeQuestion
        fields = ['id', 'text', 'image','marks', 'options']


class PracticeSessionSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)  # Display the username
    duration = serializers.DurationField(read_only=True)

    class Meta:
        model = PracticeSession
        fields = ['id', 'user', 'duration', 'score']
    
    def create(self, validated_data):
        # Optionally, you can customize the create method if you want to initialize certain fields.
        return PracticeSession.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.end_time = validated_data.get('end_time', instance.end_time)
        instance.calculate_duration()  # Calculate duration
        instance.update_score(validated_data.get('score', instance.score))  # Update score
        instance.save()
        return instance


    def get_total_time_taken(self, obj):
        if obj.end_time:
            duration = obj.end_time - obj.start_time
        else:
            from django.utils.timezone import now
            duration = now() - obj.start_time
        return str(duration)





class UserPointsSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)  # Display the username

    class Meta:
        model = UserPoints
        fields = ['id', 'user', 'points']

    def update(self, instance, validated_data):
        points = validated_data.get('points', instance.points)
        if points < 0:
            instance.subtract_points(abs(points))
        else:
            instance.add_points(points)
        return instance



class PracticeLeaderboardSerializer(serializers.ModelSerializer):
    points = serializers.SerializerMethodField()
    attempts = serializers.SerializerMethodField()
    profile_image = serializers.ImageField(source='profile_picture', allow_null=True, required=False)

    class Meta:
        model = get_user_model()
        fields = ['id', 'username', 'points', 'attempts', 'profile_image']

    def get_points(self, obj):
        # Get points from UserPoints model
        user_points = getattr(obj, 'userpoints', None)
        return user_points.points if user_points else 0

    def get_attempts(self, obj):
        return PracticeSession.objects.filter(user=obj).count()
