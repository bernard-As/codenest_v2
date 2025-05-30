// frontend/src/services/projectService.ts
import apiClient from './apiClient';
import type { Project, ProjectCreateData, ProjectFile,ProjectUpdateData } from '../types/project';
 // Assuming User type is defined here

// Example function to fetch projects (for future list page)
// const fetchProjects = async (): Promise<Project[]> => {
//     const response = await apiClient.get<Project[]>('/projects/'); // Check URL
//     return response.data;
// };
const fetchProjects = async (): Promise<Project[]> => { // Add pagination params later
  // Assuming your backend list endpoint is /api/projects/
  const response = await apiClient.get<Project[]>('/projects/');
  // If backend uses DRF pagination, response.data might be an object like { count, next, previous, results }
  // For now, assuming it returns an array directly. Adapt if paginated.
  // return response.data.results if paginated, and handle response.data.count etc.
  return response.data;
};
// Example function to fetch a single project (for future detail page)
const fetchProject = async (id: number): Promise<Project> => {
    const response = await apiClient.get<Project>(`/projects/${id}/`); // Check URL
    return response.data;
};


const createProject = async (data: ProjectCreateData): Promise<Project> => {
  // Ensure year is sent as null if not provided, not empty string
  const dataToSend = {
      ...data,
      year: data.year === null || data.year === undefined || (typeof data.year === 'string' && data.year === '') ? null : Number(data.year) // Convert year to number or null
  };
  const response = await apiClient.post<Project>('/projects/', dataToSend); // Check URL
  return response.data;
};

// Callback type for upload progress
type UploadProgressCallback = (percentage: number) => void;

const uploadFile = async (
    projectId: number,
    file: File,
    onProgress?: UploadProgressCallback // Optional progress callback
): Promise<ProjectFile> => {
    const formData = new FormData();
    formData.append('file', file); // 'file' should match the name expected by the backend parser/view

    const response = await apiClient.post<ProjectFile>(
        `/projects/${projectId}/upload_file/`, // URL for the custom action
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data', // Important for file uploads
            },
            // Cast to any to allow onUploadProgress property
            onUploadProgress: (progressEvent: ProgressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            },
        } as any
    );
    return response.data;
};

const updateProject = async (id: number, data: ProjectUpdateData): Promise<Project> => {
  // Ensure year is sent as null if not provided, not empty string
  const dataToSend = {
    ...data,
    year: data.year === undefined || (typeof data.year === 'string' && data.year === '') ? null : Number(data.year),
  };
  // Remove undefined fields so PATCH only sends changed values
  Object.keys(dataToSend).forEach(key => {
    const typedKey = key as keyof typeof dataToSend;
    if (dataToSend[typedKey] === undefined) {
      delete dataToSend[typedKey];
    }
  });

  const response = await apiClient.patch<Project>(`/projects/${id}/`, dataToSend);
  return response.data;
};

export const projectService = {
  fetchProjects,
  fetchProject, // Useful after creation to get full project details
  createProject,
  uploadFile,
  updateProject,
};