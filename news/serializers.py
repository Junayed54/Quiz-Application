from rest_framework import serializers
from .models import *
from rest_framework import serializers

class NewsImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = NewsImage
        fields = ["id", "image_url"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if request and obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None

class NewsCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsCategory
        fields = ["id", "name"]



class NewsSerializer(serializers.ModelSerializer):
    images = NewsImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )

    class Meta:
        model = News
        fields = [
            "id", "category", "title", "content", "author",
            "created_at", "updated_at", "published_date",
            "images", "uploaded_images"
        ]
        read_only_fields = ["author"]

    def create(self, validated_data):
        uploaded_images = validated_data.pop("uploaded_images", [])
        news = News.objects.create(**validated_data)
        for image in uploaded_images:
            NewsImage.objects.create(news=news, image=image)
        return news

    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop("uploaded_images", [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # If new images are uploaded, add them
        for image in uploaded_images:
            NewsImage.objects.create(news=instance, image=image)

        return instance
