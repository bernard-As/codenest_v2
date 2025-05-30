// frontend/src/stores/ProjectStore.ts
import { makeAutoObservable, runInAction } from 'mobx';
import type { Project, ProjectCreateData,ProjectUpdateData } from '../types/project'; // Import your types
import { projectService } from '../services/projectService'; // We'll create this next

class ProjectStore {
  projects: Project[] = [];
  currentProject: Project | null = null;
  isLoadingProjects: boolean = false;
  isLoadingProject: boolean = false;
  isCreatingProject: boolean = false;
  isUploadingFiles: boolean = false;
  uploadProgress: number = 0; // 0-100
  projectError: string | null = null;
  isUpdatingProject: boolean = false; // New state for update operation

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // --- Fetching Projects (Basic, for later list page) ---
  async fetchProjects() { // Add params for pagination later (page, pageSize)
    this.isLoadingProjects = true;
    this.projectError = null;
    try {
      const fetchedProjects = await projectService.fetchProjects(); // Update service
      runInAction(() => {
        this.projects = fetchedProjects;
        this.isLoadingProjects = false;
        // Set pagination data here if implementing
        // this.totalProjects = response.count;
        // this.currentPage = response.currentPage; // Assuming API returns this
      });
    } catch (error: any) {
      console.error("Fetch projects error:", error.response?.data || error.message);
      runInAction(() => {
        this.projectError = error.response?.data?.detail || 'Failed to load projects.';
        this.isLoadingProjects = false;
      });
    }
  }

  async fetchProject(id: number) {
    this.isLoadingProject = true;
    this.projectError = null; // Clear previous errors
    this.currentProject = null; // Clear previous project while loading
    try {
        const fetchedProject = await projectService.fetchProject(id);
        runInAction(() => {
            this.currentProject = fetchedProject;
            this.isLoadingProject = false;
        });
        return fetchedProject;
    } catch (error: any) {
        console.error(`Fetch project ${id} error:`, error.response?.data || error.message);
        runInAction(() => {
            this.projectError = error.response?.data?.detail || `Failed to load project (ID: ${id}).`;
            this.isLoadingProject = false;
        });
        throw error; // Re-throw for component to handle if needed
    }
  }


  // --- Create Project ---
  async createProject(projectData: ProjectCreateData, files: File[]) {
    this.isCreatingProject = true;
    this.projectError = null;
    this.isUploadingFiles = false; // Reset file upload state
    this.uploadProgress = 0;
    let createdProject: Project | null = null;

    try {
      // Step 1: Create the Project instance
      createdProject = await projectService.createProject(projectData);
      runInAction(() => {
        // Optionally add the new project to the list if you have one loaded
        // this.projects.push(createdProject!);
        this.isCreatingProject = false; // Project instance created
      });

      // Step 2: Upload files sequentially
      if (files.length > 0 && createdProject) {
        runInAction(() => { this.isUploadingFiles = true; });
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          try {
            await projectService.uploadFile(createdProject.id, file, (progress) => {
               runInAction(() => {
                   // Basic progress: percentage for the current file
                   // For overall progress, calculate weighted average
                   this.uploadProgress = Math.round(((i + progress / 100) / files.length) * 100);
               });
            });
            console.log(`Uploaded file ${i + 1}/${files.length}: ${file.name}`);
             runInAction(() => {
                // Optional: Refetch project or update files list manually
                // if (createdProject && !createdProject.files.some(f => f.original_filename === file.name)) {
                //     // Simple assumption: if file is not listed, it's newly added. Not robust.
                //     // Better: fetch the file details from the upload response if backend returns it, or refetch the project.
                //     // Let's assume backend uploadFile response includes the created ProjectFile details.
                //     // The service needs to return the created ProjectFile
                //     // Update: ProjectFileSerializer is set to readonly for fields used in create,
                //     // so upload_file action should return serialized ProjectFile data.
                //     // The service needs to be updated to return this data.
                // }
             });

          } catch (uploadError: any) {
            console.error(`Error uploading file ${file.name}:`, uploadError);
            // Decide how to handle partial failures: stop, skip, log?
            // For now, log and continue, set an overall error
            runInAction(() => {
              this.projectError = this.projectError || `Failed to upload file(s). Some files may be missing.`;
            });
          }
        }
        runInAction(() => { this.isUploadingFiles = false; this.uploadProgress = 100; });
         // After all uploads, maybe fetch the full project details to update the store state
         if (createdProject) {
             const finalProjectDetails = await projectService.fetchProject(createdProject.id); // Needs fetchProject service method
              runInAction(() => {
                 this.currentProject = finalProjectDetails; // Set the new project as current
             });
         }
      }

      // Return the final project object (potentially with file list updated)
      return createdProject;

    } catch (error: any) {
      console.error("Create project failed:", error);
      runInAction(() => {
        this.projectError = error.response?.data?.detail || error.response?.data?.title?.[0] || error.response?.data?.non_field_errors?.[0] || 'Failed to create project. Please check your inputs.';
        this.isCreatingProject = false;
        this.isUploadingFiles = false;
        this.uploadProgress = 0;
        createdProject = null; // Ensure createdProject is null on error
      });
      throw error; // Re-throw to allow component to catch
    }
  }

  async updateProject(projectId: number, projectData: ProjectUpdateData) {
    this.isUpdatingProject = true;
    this.projectError = null; // Clear previous errors
    try {
      const updatedProject = await projectService.updateProject(projectId, projectData);
      runInAction(() => {
        this.currentProject = updatedProject; // Update current project if it's the one being edited
        // Also update the project in the main projects list if it exists
        const index = this.projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
          this.projects[index] = updatedProject;
        }
        this.isUpdatingProject = false;
      });
      return updatedProject; // Return updated project
    } catch (error: any) {
      console.error(`Update project ${projectId} error:`, error.response?.data || error.message);
      runInAction(() => {
        this.projectError = error.response?.data?.detail || error.response?.data?.title?.[0] || 'Failed to update project.';
        this.isUpdatingProject = false;
      });
      throw error; // Re-throw for component to handle
    }
  }


clearCurrentProject = () => {
    runInAction(() => {
      this.currentProject = null;
      this.isLoadingProject = false;
      this.projectError = null;
    });
  }
    // Action to reset state after success or dismissal
    resetProjectState = () => {
        runInAction(() => {
            this.isCreatingProject = false;
            this.isUploadingFiles = false;
            this.uploadProgress = 0;
            this.projectError = null;
            // Keep currentProject if navigate happens, maybe reset after leaving the page
            // this.currentProject = null;
        });
    }
}

export default ProjectStore; // Export the class itself