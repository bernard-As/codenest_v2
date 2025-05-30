# backend/apps/projects/serializers.py
from rest_framework import serializers
from .models import Project, ProjectFile # Import your models
# Import UserSerializer if needed for owner/collaborators field representation
from apps.users.serializers import UserSerializer # Assuming UserSerializer is in apps.users.serializers
from apps.users.models import User # Import User model

class ProjectFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = ProjectFile
        fields = ['id', 'file', 'file_type', 'original_filename', 'extracted_metadata', 'uploaded_at', 'file_url']
        read_only_fields = ['file_type', 'original_filename', 'extracted_metadata', 'uploaded_at', 'file_url']
        extra_kwargs = {
             'file': {'write_only': True} # Prevent file data from being sent in read requests
        }

    def get_file_url(self, obj):
        # Generate absolute URL for the file
        if obj.file:
             # Access the request context from the serializer context
             request = self.context.get('request')
             if request:
                 return request.build_absolute_uri(obj.file.url)
             return obj.file.url # Fallback to relative URL if no request context
        return None

    # We'll handle file creation via a separate view/action, not this serializer's create

class ProjectSerializer(serializers.ModelSerializer):
    # Read-only fields for owner and collaborators if you want nested representation
    owner = UserSerializer(read_only=True)
    # collaborators = UserSerializer(many=True, read_only=True) # Uncomment when handling collaborators
    files = ProjectFileSerializer(many=True, read_only=True,context={'request': None}) # Nested serializer for viewing files
    collaborators = UserSerializer(many=True, read_only=True)
    collaborator_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all(), # Queryset of users to choose from
        write_only=True,
        source='collaborators', # This links it to the 'collaborators' model field for writing
        required=False # Make it optional for updates
    )
    files = ProjectFileSerializer(many=True, read_only=True, context={'request': None})

    class Meta:
        model = Project
        fields = [
            'id', 'owner', 'collaborators', 'collaborator_ids', # Add collaborator_ids
            'title', 'description', 'type', 'department', 'year',
            'created_at', 'updated_at', 'files'
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at', 'files']
        # 'collaborators' is read-only here; modify via a separate endpoint or M2M field on User

    def create(self, validated_data):
        # collaborator_ids will be handled by DRF's M2M handling if passed
        # Owner is set in the view
        collaborators_data = validated_data.pop('collaborators', None) # Pop from validated_data if using source
        project = Project.objects.create(**validated_data)
        if collaborators_data:
            project.collaborators.set(collaborators_data)
        return project

    def update(self, instance, validated_data):
        # Handle collaborators update. `PrimaryKeyRelatedField` with `source` handles this.
        # If 'collaborator_ids' is in validated_data, DRF will attempt to set them.
        # If 'collaborator_ids' is not present, collaborators are not changed.
        # To clear collaborators, an empty list should be passed for 'collaborator_ids'.

        # Pop 'collaborators' from validated_data if you are using source='collaborators' for collaborator_ids
        # because the M2M field itself 'collaborators' is read_only in the serializer.
        # DRF handles the 'source' mapping for write operations.
        if 'collaborators' in validated_data: # Check if 'collaborator_ids' (via source) was provided
            collaborators_data = validated_data.pop('collaborators')
            instance.collaborators.set(collaborators_data)


        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.type = validated_data.get('type', instance.type)
        instance.department = validated_data.get('department', instance.department)
        instance.year = validated_data.get('year', instance.year)
        instance.save()
        return instance

    def get_files(self, obj):
        request = self.context.get('request')
        files = obj.files.all()
        return ProjectFileSerializer(files, many=True, context={'request': request}).data
    # Optional: Update method if needed
    # def update(self, instance, validated_data):
    #     # Handle updating project fields, but not files or owner
    #     instance.title = validated_data.get('title', instance.title)
    #     instance.description = validated_data.get('description', instance.description)
    #     instance.type = validated_data.get('type', instance.type)
    #     instance.department = validated_data.get('department', instance.department)
    #     instance.year = validated_data.get('year', instance.year)
    #     instance.save()
    #     return instance