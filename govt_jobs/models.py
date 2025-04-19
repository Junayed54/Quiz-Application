from django.db import models
from quiz.models import *

class GovernmentJob(models.Model):
    title = models.CharField(max_length=255)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='government_jobs', null=True, blank=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='government_jobs')
    position = models.ForeignKey(Position, on_delete=models.SET_NULL, null=True, blank=True, related_name='government_jobs')
    location = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    deadline = models.DateField(blank=True, null=True)
    posted_on = models.DateTimeField(auto_now_add=True)
    official_link = models.URLField(blank=True, null=True)
    pdf = models.FileField(upload_to='govt_job_pdfs/', blank=True, null=True)

    def __str__(self):
        return self.title
