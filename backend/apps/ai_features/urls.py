# backend/apps/ai_features/urls.py
from django.urls import path
from .views import GeminiChatView

urlpatterns = [
    path('chat/gemini/', GeminiChatView.as_view(), name='gemini_chat'),
]