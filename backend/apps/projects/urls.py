# backend/apps/projects/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet)

urlpatterns = [
    # This includes all standard CRUD routes for projects, plus the custom actions
    # e.g., /projects/, /projects/{id}/, /projects/{id}/upload_file/
    path('', include(router.urls)),
]