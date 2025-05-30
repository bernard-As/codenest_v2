# backend/apps/projects/views.py
from rest_framework import viewsets, permissions, status,generics, filters
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FileUploadParser # For file uploads
from rest_framework.decorators import action # For custom actions on ViewSets
from django.shortcuts import get_object_or_404

from apps.users.serializers import UserSerializer # For upload action

from .models import Project, ProjectFile
from .serializers import ProjectSerializer, ProjectFileSerializer # Import your serializers
from apps.users.models import User # Import User model if needed for permission checks
# from .permissions import IsOwnerOrCollaboratorOrReadOnly # Create this later for permissions

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] # Base permissions

    def perform_create(self, serializer):
        # Set the owner to the currently authenticated user
        serializer.save(owner=self.request.user)

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['update', 'partial_update', 'destroy', 'upload_file']:
            # For these actions, require the user to be the owner
            # Replace with a more robust permission class like IsOwnerOrReadOnly
            self.permission_classes = [permissions.IsAuthenticated, IsProjectOwnerPermission]
        else:
            # For list, retrieve, create (owner set in perform_create)
            self.permission_classes = [permissions.IsAuthenticatedOrReadOnly]
        return super().get_permissions()

    def perform_update(self, serializer):
        project = serializer.instance # Get the project instance being updated
        if project.owner != self.request.user:
            # This part won't be reached if IsProjectOwnerPermission is effective
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to edit this project.")
        serializer.save()
    
    def perform_destroy(self, instance):
        if instance.owner != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to delete this project.")
        # The ProjectFile model's delete method handles deleting files from storage
        super().perform_destroy(instance)
    # Add a custom action for file uploads
    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FileUploadParser])
    def upload_file(self, request, pk=None):
        # Ensure the user has permission to upload files to this project (e.g., is owner or collaborator)
        # TODO: Implement granular permission checks here
        project = get_object_or_404(Project, pk=pk)

        # Basic permission check: Only owner can upload initially
        if project.owner != request.user:
             return Response({'detail': 'You do not have permission to upload files to this project.'}, status=status.HTTP_403_FORBIDDEN)


        # Check if a file was sent in the request
        # MultiPartParser puts files in request.FILES
        if 'file' not in request.FILES:
            return Response({'detail': 'No file was provided in the request.'}, status=status.HTTP_400_BAD_REQUEST)

        uploaded_file = request.FILES['file']

        # Create the ProjectFile instance
        # The serializer's save method will handle the actual file storage
        file_serializer = ProjectFileSerializer(data={'file': uploaded_file, 'project': project.id}, context={'request': request})

        if file_serializer.is_valid():
            project_file = file_serializer.save(project=project, original_filename=uploaded_file.name)
            # You might trigger background processing here
            return Response(ProjectFileSerializer(project_file, context={'request': request}).data, status=status.HTTP_201_CREATED)
        else:
            return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Optional: custom action to list files for a project instance
    @action(detail=True, methods=['get'])
    def list_files(self, request, pk=None):
         project = get_object_or_404(Project, pk=pk)
         # Optional: Add permission checks to view files
         files = project.files.all() # Access related files
         serializer = ProjectFileSerializer(files, many=True, context={'request': request})
         return Response(serializer.data)

    # TODO: Add a custom permission class (e.g., IsOwnerOrCollaborator) for update/destroy/upload actions
    # def get_permissions(self):
    #     if self.action in ['update', 'partial_update', 'destroy', 'upload_file']:
    #          self.permission_classes = [IsOwnerOrCollaboratorOrReadOnly] # Define this class
    #     else:
    #          self.permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    #     return super().get_permissions()

class IsProjectOwnerPermission(permissions.BasePermission):
    """
    Custom permission to only allow owners of a project to edit or delete it.
    """
    def has_object_permission(self, request, view, obj):
        # Write permissions are only allowed to the owner of the project.
        return obj.owner == request.user
    

