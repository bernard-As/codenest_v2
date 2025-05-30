# backend/apps/users/serializers.py
from rest_framework import serializers
from .models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError # Alias to avoid clash
import re


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True, label="Confirm Password")

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'password', 'password2', 'role')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'role': {'required': True} # Make role selectable during registration
        }

    def validate_email(self, value):
        # University email validation (example: ends with .edu or .ac.xx)
        # Ensure this matches the model manager's validation
        if not re.match(r"^[a-zA-Z0-9._%+-]+@rdu\.edu\.tr$", value, re.IGNORECASE): # Added re.IGNORECASE
            raise serializers.ValidationError('Please use a valid university email address.')
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email address is already registered.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password2": "Password fields didn't match."})
        # You can add more cross-field validation here if needed
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password'],
            role=validated_data.get('role', User.Role.STUDENT) # Use provided role or default
        )
        # user.is_active = False # Optional: if email verification is implemented later
        # user.save()
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'date_joined', 'last_login')
        read_only_fields = ('date_joined', 'last_login')