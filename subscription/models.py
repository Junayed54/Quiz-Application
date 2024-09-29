from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

# Subscription Package Model
class SubscriptionPackage(models.Model):
    PACKAGE_CHOICES = [
        ('basic', 'Basic'),
        ('standard', 'Standard'),
        ('premium', 'Premium')
    ]
    
    name = models.CharField(max_length=200, choices=PACKAGE_CHOICES)
    # package_type = models.CharField(max_length=50, choices=PACKAGE_CHOICES, null=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    duration_in_days = models.IntegerField(default=30)
    max_exams = models.IntegerField(default=100)
    very_easy_percentage = models.IntegerField(default=10)
    easy_percentage = models.IntegerField(default=50)
    medium_percentage = models.IntegerField(default=10)
    hard_percentage = models.IntegerField(default=10)
    very_hard_percentage = models.IntegerField(default=10)
    expert_percentage = models.IntegerField(default=10)

    def get_total_percentage(self):
        return sum([
            self.very_easy_percentage,
            self.easy_percentage,
            self.medium_percentage,
            self.hard_percentage,
            self.very_hard_percentage,
            self.expert_percentage,
        ])
    
    def validate_percentages(self):
        if self.get_total_percentage() != 100:
            raise ValueError("The total percentage of difficulty levels must be equal to 100%.")

    def __str__(self):
        return f"{self.get_name_display()} Package - ${self.price}"

# User Subscription Model
class UserSubscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    package = models.ForeignKey(SubscriptionPackage, on_delete=models.SET_NULL, null=True)
    start_date = models.DateField(auto_now_add=True)
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=[('active', 'Active'), ('expired', 'Expired'), ('cancelled', 'Cancelled')], default='active')
    auto_renew = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username}'s Subscription to {self.package.name}"

# Payment Model
class Payment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    package = models.ForeignKey(SubscriptionPackage, on_delete=models.SET_NULL, null=True)
    payment_date = models.DateTimeField(auto_now_add=True)
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    payment_method = models.CharField(max_length=50)
    transaction_id = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('completed', 'Completed'), ('failed', 'Failed')], default='completed')

    def __str__(self):
        return f"Payment of ${self.amount} by {self.user.username} for {self.package.name}"

# Usage Tracking Model
class UsageTracking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    package = models.ForeignKey(SubscriptionPackage, on_delete=models.SET_NULL, null=True)
    total_exams_taken = models.IntegerField(default=0)
    total_allowed_exams = models.IntegerField()

    def __str__(self):
        return f"{self.user.username}'s Usage for {self.package.name}"

# Subscription History Model
class SubscriptionHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    package = models.ForeignKey(SubscriptionPackage, on_delete=models.SET_NULL, null=True)
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return f"{self.user.username}'s Subscription History for {self.package.name}"

# Coupon Model
class Coupon(models.Model):
    code = models.CharField(max_length=50, unique=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    valid_from = models.DateField()
    valid_until = models.DateField()
    usage_limit = models.IntegerField(default=None, null=True)
    used_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Coupon: {self.code} - {self.discount_percentage}% off"

# Payment Plan Model
class PaymentPlan(models.Model):
    name = models.CharField(max_length=50)
    total_amount = models.DecimalField(max_digits=8, decimal_places=2)
    num_installments = models.IntegerField()
    installment_amount = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return self.name

# Notification Model
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message}"

# Refund Model
class Refund(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    payment = models.ForeignKey(Payment, on_delete=models.SET_NULL, null=True)
    refund_amount = models.DecimalField(max_digits=8, decimal_places=2)
    refund_reason = models.TextField()
    refund_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')], default='pending')

    def __str__(self):
        return f"Refund of ${self.refund_amount} for {self.user.username}"

# Subscription Analytics Model
class SubscriptionAnalytics(models.Model):
    package = models.ForeignKey(SubscriptionPackage, on_delete=models.CASCADE)
    total_users = models.IntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=10, decimal_places=2)
    subscription_start_date = models.DateField()
    subscription_end_date = models.DateField()
    churn_rate = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"Analytics for {self.package.name}"
