from rest_framework import serializers
from .models import GovernmentJob
from quiz.serializers import *

class GovernmentJobSerializer(serializers.ModelSerializer):
    # Read-only fields to show related objects as nested
    organization = OrganizationSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    position = PositionSerializer(read_only=True)

    # Writable fields for create and update
    organization_id = serializers.IntegerField(write_only=True, required=True)
    department_id = serializers.IntegerField(write_only=True, required=False)  # Optional for update
    position_id = serializers.IntegerField(write_only=True, required=False)  # Optional for update

    # Override PDF field to return absolute URL
    pdf = serializers.SerializerMethodField()
    
    
    class Meta:
        model = GovernmentJob
        fields = '__all__'

    def create(self, validated_data):
        # Extract the IDs from the validated data
        organization_id = validated_data.pop('organization_id')
        department_id = validated_data.pop('department_id', None)
        position_id = validated_data.pop('position_id', None)

        # Get the actual objects using the IDs
        organization = Organization.objects.get(id=organization_id)
        department = Department.objects.get(id=department_id) if department_id else None
        position = Position.objects.get(id=position_id) if position_id else None

        # Create the GovernmentJob instance
        government_job = GovernmentJob.objects.create(
            organization=organization,
            department=department,
            position=position,
            **validated_data
        )
        return government_job

    def update(self, instance, validated_data):
        # Extract the IDs from the validated data
        organization_id = validated_data.pop('organization_id', None)
        department_id = validated_data.pop('department_id', None)
        position_id = validated_data.pop('position_id', None)

        # Update related fields if provided
        if organization_id:
            instance.organization = Organization.objects.get(id=organization_id)
        if department_id:
            instance.department = Department.objects.get(id=department_id)
        if position_id:
            instance.position = Position.objects.get(id=position_id)

        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance
    
    def get_pdf(self, obj):
        request = self.context.get('request')
        if obj.pdf:
            if request:
                return request.build_absolute_uri(obj.pdf.url)  # full URL with domain
            return obj.pdf.url  # fallback relative URL
        return None

