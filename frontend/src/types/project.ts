// frontend/src/types/project.ts
// You'll also need the User type from types/auth.ts
import { type User } from './auth';

export type ProjectType = 'CODE' | 'AUTOCAD' | 'BOOK' | 'PAPER' | 'OTHER';
export type FileType = 'CODE' | 'AUTOCAD' | 'PDF' | 'IMAGE' | 'OTHER'; // Match backend choices

export interface ProjectFile {
  id: number;
  // file: File; // Not included in read, only sent in write
  file_url: string; // URL to access the file
  file_type: FileType;
  original_filename: string;
  extracted_metadata: any; // Adjust type if metadata structure is known
  uploaded_at: string; // ISO string
}

export interface Project {
  id: number;
  owner: User; // Nested user data
  collaborators: User[]; // Array of nested user data (when implemented)
  title: string;
  description: string;
  type: ProjectType;
  department: string;
  year: number | null;
  created_at: string; // ISO string
  updated_at: string; // ISO string
  files: ProjectFile[]; // Array of nested files
}

// Type for data sent when creating a project (doesn't include files)
export interface ProjectCreateData {
  title: string;
  description: string;
  type: ProjectType;
  department: string;
  year: number | null;
  // Add any other fields required for initial creation
  // role is part of User, not Project
}

export const ProjectTypeEnum = {
  CODE: 'Code Project',
  AUTOCAD: 'AutoCAD Drawing',
  BOOK: 'Book / Ebook',
  PAPER: 'Research Paper',
  OTHER: 'Other',
} as const;

export interface ProjectUpdateData {
  title?: string;
  description?: string;
  type?: ProjectType;
  department?: string;
  year?: number | null;
  collaborator_ids?: number[]; // Add this
}

export type ProjectTypeEnum = typeof ProjectTypeEnum[keyof typeof ProjectTypeEnum];