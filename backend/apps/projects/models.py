# backend/apps/projects/models.py
from django.db import models
from django.conf import settings # To refer to the custom User model
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify
import os # For file path handling
import json # For JSONField
# Add any necessary imports for file processing (later)

def project_file_upload_to(instance, filename):
    # Files will be uploaded to MEDIA_ROOT/projects/user_id/project_slug/filename
    project_slug = slugify(instance.project.title)
    return os.path.join('projects', str(instance.project.owner.id), project_slug, filename)

class Project(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_projects',
        help_text=_("The user who initiated this project.")
    )
    collaborators = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='collaborating_projects',
        blank=True,
        help_text=_("Users collaborating on this project.")
    ) # TODO: Refine with team roles later

    title = models.CharField(_("Project Title"), max_length=255)
    description = models.TextField(_("Project Description"), blank=True)

    class ProjectType(models.TextChoices):
        CODE = 'CODE', _('Code Project')
        AUTOCAD = 'AUTOCAD', _('AutoCAD Drawing')
        BOOK = 'BOOK', _('Book / Ebook')
        PAPER = 'PAPER', _('Research Paper')
        OTHER = 'OTHER', _('Other') # Default or fallback

    type = models.CharField(
        _("Project Type"),
        max_length=50,
        choices=ProjectType.choices,
        default=ProjectType.OTHER,
    )

    department = models.CharField(_("Department/Field"), max_length=100, blank=True)
    year = models.IntegerField(_("Academic Year"), null=True, blank=True) # e.g., 2023

    # TODO: Add fields for Tags/Keywords

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Project")
        verbose_name_plural = _("Projects")
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    # Add methods for future features like citation, versioning, etc.


class ProjectFile(models.Model):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='files',
        help_text=_("The project this file belongs to.")
    )
    file = models.FileField(_("File"), upload_to=project_file_upload_to)

    class FileType(models.TextChoices):
        # Inherit or mirror ProjectType, or be more specific if needed
        CODE = 'CODE', _('Code File')
        AUTOCAD = 'AUTOCAD', _('AutoCAD File')
        PDF = 'PDF', _('PDF Document') # Books and Papers might be PDFs
        IMAGE = 'IMAGE', _('Image File')
        OTHER = 'OTHER', _('Other File')

    file_type = models.CharField(
        _("File Type"),
        max_length=50,
        choices=FileType.choices,
        default=FileType.OTHER,
        blank=True # Can be determined after upload
    )

    original_filename = models.CharField(_("Original Filename"), max_length=255)
    # JSONField for storing extracted metadata (e.g., PDF title, author, code language)
    extracted_metadata = models.JSONField(_("Extracted Metadata"), default=dict, blank=True, null=True)

    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Project File")
        verbose_name_plural = _("Project Files")
        ordering = ['uploaded_at']

    def __str__(self):
        return self.original_filename

    def save(self, *args, **kwargs):
        # Set original_filename if not set
        if not self.original_filename and self.file:
            self.original_filename = self.file.name # Django FielField stores the filename here

        # Attempt to determine file_type if not set (basic based on extension)
        if not self.file_type or self.file_type == self.FileType.OTHER:
            name, ext = os.path.splitext(self.original_filename.lower())
            if ext in ['.py', '.js', '.c', '.cpp', '.java', '.cs', '.html', '.css']:
                self.file_type = self.FileType.CODE
            elif ext in ['.dwg', '.dxf']:
                 self.file_type = self.FileType.AUTOCAD
            elif ext == '.pdf':
                 self.file_type = self.FileType.PDF
            elif ext in ['.jpg', '.jpeg', '.png', '.gif', '.svg']:
                 self.file_type = self.FileType.IMAGE
            # TODO: More specific mapping and actual file content type checking later

        # TODO: Trigger metadata extraction and thumbnail generation here or via signal/Celery task
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Delete the file from the filesystem when the model is deleted
        if self.file:
            storage, path = self.file.storage, self.file.path
            super().delete(*args, **kwargs) # Delete model instance
            storage.delete(path) # Delete file
        else:
            super().delete(*args, **kwargs)

# TODO: Add Signals for file processing (e.g., post_save for ProjectFile)
# This would trigger metadata extraction, preview generation in the background
# Example:
# from django.db.models.signals import post_save
# from django.dispatch import receiver
# @receiver(post_save, sender=ProjectFile)
# def process_project_file(sender, instance, created, **kwargs):
#     if created:
#         # Trigger Celery task or direct function call for processing
#         print(f"File uploaded: {instance.original_filename}. Processing...")
#         # process_file_metadata.delay(instance.id) # If using Celery
#         # or: from .file_processors import process_file_metadata
#         # process_file_metadata(instance) # Simple direct call