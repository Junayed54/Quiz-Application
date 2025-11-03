from rest_framework import serializers
from django.utils.timesince import timesince
from .models import *


class PracticeOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PracticeOption
        fields = ['id', 'text', 'image', 'is_correct']

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name']

class PracticeQuestionSerializer(serializers.ModelSerializer):
    subject = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(),
        allow_null=True,  # allow explicitly passing null
        required=False     # allow omitting subject
    )
    options = PracticeOptionSerializer(many=True, read_only=True)

    class Meta:
        model = PracticeQuestion
        fields = ['id', 'subject', 'text', 'image', 'marks', 'options']



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



class DailyTopScorerSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    total_score = serializers.IntegerField()
    
    
    
    
# class UserRewardSerializer(serializers.ModelSerializer):
#     """
#     Serializer for individual user reward entries.
#     Shows username, phone number, total score, reward amount, and distribution details.
#     """
#     distribution_type = serializers.CharField(source='distribution.distribution_type', read_only=True)
#     period = serializers.SerializerMethodField()

#     class Meta:
#         model = UserReward
#         fields = [
#             'id',
#             'username',
#             'phone_number',
#             'total_score',
#             'reward_amount',
#             'distribution_type',
#             'period',
#         ]

#     def get_period(self, obj):
#         """Returns readable date range like '2025-11-01 → 2025-11-07'."""
#         return f"{obj.distribution.start_date} → {obj.distribution.end_date}"


# class RewardDistributionSerializer(serializers.ModelSerializer):
#     """
#     Serializer for the reward distribution record.
#     Includes all metadata and nested user rewards.
#     """
#     user_rewards = UserRewardSerializer(many=True, read_only=True)
#     total_user_rewards = serializers.SerializerMethodField()

#     class Meta:
#         model = RewardDistribution
#         fields = [
#             'id',
#             'distribution_type',
#             'start_date',
#             'end_date',
#             'distributed_at',
#             'total_users',
#             'total_amount',
#             'note',
#             'user_rewards',
#             'total_user_rewards',
#         ]
#         read_only_fields = ['distributed_at', 'total_users', 'total_amount']

#     def get_total_user_rewards(self, obj):
#         """Show total number of user rewards for this distribution."""
#         return obj.user_rewards.count()