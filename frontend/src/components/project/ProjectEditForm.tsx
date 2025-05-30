// frontend/src/components/project/ProjectEditForm.tsx
import React, { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { observer } from 'mobx-react-lite';
import type { Project, ProjectUpdateData, ProjectType as ProjectTypeType } from '../../types/project'; // Use ProjectTypeType alias
 // Use ProjectTypeType alias
import { projectStore } from '../../stores';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

import { AceternityInput } from '../ui/aceternity/Input';
import { MovingBorderButton } from '../ui/aceternity/buttons';
import Select, { type MultiValue } from 'react-select';
import { userService } from '../../services/userService'; // For fetching users

interface UserOption { // For react-select
  value: number;
  label: string;
}
const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string; }) => (
  <div className={cn("flex flex-col space-y-2 w-full", className)}>{children}</div>
);
const FormLabel = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{children}</label>
);
const BottomGradient = () => ( /* ... (same as before) ... */ <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>);


interface ProjectEditFormProps {
  project: Project; // Existing project data to pre-fill the form
}

// Re-use or import from ProjectForm
const projectTypeOptions: { value: ProjectTypeType; label: string }[] = [
  { value: 'CODE', label: 'Code Project' },
  { value: 'AUTOCAD', label: 'AutoCAD Drawing' },
  { value: 'BOOK', label: 'Book / Ebook' },
  { value: 'PAPER', label: 'Research Paper' },
  { value: 'OTHER', label: 'Other' },
];

const ProjectEditForm: React.FC<ProjectEditFormProps> = observer(({ project }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProjectUpdateData>({
    title: project.title || '',
    description: project.description || '',
    type: project.type || 'OTHER',
    department: project.department || '',
    year: project.year === undefined ? null : project.year, // Handle null for year
  });
  const [allUsers, setAllUsers] = useState<UserOption[]>([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState<MultiValue<UserOption>>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  // Update form data if the project prop changes (e.g., after a fetch)
  useEffect(() => {
    // Pre-fill form data
    setFormData({
      title: project.title || '',
      description: project.description || '',
      type: project.type || 'OTHER',
      department: project.department || '',
      year: project.year === undefined ? null : project.year,
      // collaborator_ids not directly set here, handled by selectedCollaborators
    });
    // Pre-select existing collaborators
    const currentCollaboratorOptions = project.collaborators?.map(collab => ({
        value: collab.id,
        label: `${collab.first_name} ${collab.last_name} (${collab.email})`
    })) || [];
    setSelectedCollaborators(currentCollaboratorOptions);

  }, [project]);
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const users = await userService.searchUsers(); // No search term, gets all
        const userOptions = users
          .filter((u:any) => u.id !== project.owner.id) // Exclude project owner from selectable collaborators
          .map((user:any) => ({
            value: user.id,
            label: `${user.first_name} ${user.last_name} (${user.email})`,
          }));
        setAllUsers(userOptions);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        // Handle error display if needed
      }
      setIsLoadingUsers(false);
    };
    fetchUsers();
  }, [project.owner.id]); // Refetch if owner changes (though unlikely for an edit form)

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const targetType = e.target.type;

    setFormData(prev => ({
      ...prev,
      [name]: targetType === 'number' ? (value === '' ? null : Number(value)) : value,
    }));
  };
  const handleCollaboratorChange = (selectedOptions: MultiValue<UserOption>) => {
    setSelectedCollaborators(selectedOptions);
  };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const finalFormData: ProjectUpdateData = {
      ...formData,
      collaborator_ids: selectedCollaborators.map(opt => opt.value),
    };

    try {
      projectStore.resetProjectState();
      const updatedProject = await projectStore.updateProject(project.id, finalFormData);
      if (updatedProject) {
        navigate(`/projects/${updatedProject.id}`);
      }
    } catch (error) {
      console.error("Project update failed:", error);
    }
  };

  return (
    <div className="max-w-lg w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
        Edit Project: {project.title}
      </h2>

      {projectStore.projectError && (
        <div className="my-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {projectStore.projectError}
        </div>
      )}

      <form className="my-8" onSubmit={handleSubmit}>
        <LabelInputContainer className="mb-4">
          <FormLabel htmlFor="title">Project Title</FormLabel>
          <AceternityInput id="title" name="title" type="text" value={formData.title} onChange={handleChange} required />
        </LabelInputContainer>

        <LabelInputContainer className="mb-4">
          <FormLabel htmlFor="description">Description</FormLabel>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="flex h-auto w-full border-none bg-gray-50 dark:bg-zinc-800 text-black dark:text-white shadow-input rounded-md px-3 py-2 text-sm placeholder:text-neutral-400 dark:placeholder-text-neutral-600 focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600"
          ></textarea>
        </LabelInputContainer>

        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
          <LabelInputContainer className="flex-1">
            <FormLabel htmlFor="type">Project Type</FormLabel>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="block w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:text-white"
            >
              {projectTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </LabelInputContainer>
          <LabelInputContainer className="flex-1">
            <FormLabel htmlFor="department">Department/Field</FormLabel>
            <AceternityInput id="department" name="department" type="text" value={formData.department} onChange={handleChange} />
          </LabelInputContainer>
        </div>

        <LabelInputContainer className="mb-8">
          <FormLabel htmlFor="year">Academic Year</FormLabel>
          <AceternityInput id="year" name="year" type="number" value={formData.year === null ? '' : String(formData.year)} onChange={handleChange} />
        </LabelInputContainer>

        {/* File management (viewing only for now) */}
        {project.files && project.files.length > 0 && (
          <div className="mb-8">
            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Existing Files:</h3>
            <ul className="list-disc list-inside space-y-1 pl-2">
              {project.files.map(file => (
                <li key={file.id} className="text-sm text-gray-600 dark:text-gray-400">
                  <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {file.original_filename} ({file.file_type})
                  </a>
                  {/* TODO: Add delete button per file later */}
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-500 mt-2">File additions/deletions will be handled in a future update.</p>
          </div>
        )}
        {/* Collaborators Section */}
      <LabelInputContainer className="mb-8">
        <FormLabel htmlFor="collaborators">Collaborators & Advisors</FormLabel>
        <Select
          id="collaborators"
          isMulti
          options={allUsers}
          value={selectedCollaborators}
          onChange={handleCollaboratorChange}
          isLoading={isLoadingUsers}
          placeholder="Search and add users..."
          className="react-select-container" // For custom styling via CSS
          classNamePrefix="react-select"   // For custom styling via CSS
          // TODO: Style react-select to match Tailwind/Aceternity theme
          // You might need a custom styles object for react-select
          // styles={{
          //   control: (baseStyles) => ({ ...baseStyles, backgroundColor: 'var(--your-bg-color)', borderColor: 'var(--your-border-color)'}),
          //   menu: (baseStyles) => ({ ...baseStyles, backgroundColor: 'var(--your-menu-bg-color)'}),
          //   // ... other parts
          // }}
        />
        <p className="text-xs text-gray-500 mt-1">Select users to collaborate on this project. The project owner cannot be added as a collaborator.</p>
      </LabelInputContainer>

        <MovingBorderButton
          type="submit"
          // borderRadius="0.5rem"
          className="bg-gradient-to-br from-green-500 to-green-700 block w-full text-white h-10 font-medium" // Changed color for Save
          disabled={projectStore.isUpdatingProject}
        >
          {projectStore.isUpdatingProject ? 'Saving Changes...' : 'Save Changes'}
          <BottomGradient />
        </MovingBorderButton>
      </form>
    </div>
  );
});

export default ProjectEditForm;