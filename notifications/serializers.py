# serializers.py
from rest_framework import serializers
from .models import DeviceToken

class DeviceTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceToken
        fields = ['token', 'device_type', 'device_id', 'ip_address']

    def update(self, instance, validated_data):
        user = self.context.get('user')  # ✅ Extract user from context

        instance.device_type = validated_data.get('device_type', instance.device_type)
        instance.device_id = validated_data.get('device_id', instance.device_id)
        instance.ip_address = validated_data.get('ip_address', instance.ip_address)

        # ✅ Only update user if it's present and different
        if user and user != instance.user:
            print(f"Updating user from {instance.user} to {user}")
            instance.user = user

        instance.save()
        return instance

