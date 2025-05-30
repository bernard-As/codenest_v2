// frontend/src/components/project/ProjectForm.tsx
import React, { useState, type FormEvent, type ChangeEvent } from 'react';
import { observer } from 'mobx-react-lite';
import type { ProjectCreateData,ProjectType as ProjectTypeType } from '../../types/project';
// import { ProjectType } from '../../types/project';
import { authStore, projectStore } from '../../stores';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

// Assuming you have Aceternity UI Input and a Button component
import { AceternityInput } from '../ui/aceternity/Input'; // Adjust path
import { MovingBorderButton } from '../ui/aceternity/buttons'; // Your Aceternity style button

// Reusing these helper components

const projectTypeOptions: { value: ProjectTypeType; label: string }[] = [
  { value: 'CODE', label: 'Code Project' },
  { value: 'AUTOCAD', label: 'AutoCAD Drawing' },
  { value: 'BOOK', label: 'Book / Ebook' },
  { value: 'PAPER', label: 'Research Paper' },
  { value: 'OTHER', label: 'Other' },
];

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};

const FormLabel = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
    {children}
  </label>
);

const ProjectForm: React.FC = observer(() => {
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState<ProjectCreateData>({
    title: '',
    description: '',
    type: 'OTHER', // Default type
    department: '',
    year: null,
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleProjectDataChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Ensure 'type' for ProjectType is correctly cast if needed, though string values from select should be fine
    const typedValue = name === 'type' ? (value as ProjectTypeType) : value;

    setProjectData({
      ...projectData,
      [name]: type === 'number' ? (value === '' ? null : Number(value)) : typedValue,
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Convert FileList to Array
      setSelectedFiles(Array.from(e.target.files));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      // Clear previous errors before trying again
      projectStore.resetProjectState();

      const createdProject = await projectStore.createProject(projectData, selectedFiles);

      if (createdProject) {
        console.log("Project created:", createdProject);
        // Files upload is handled inside the store action after project creation

        // Navigate to the new project's detail page after successful upload
        // You might want a small delay or indicate 'finalizing' while files upload
        // Or navigate immediately and show upload status on the detail page
        // Let's navigate immediately for now.
        navigate(`/projects/${createdProject.id}`); // Replace with your actual project detail route
      }

    } catch (error) {
      // Error handled by MobX store and displayed via observer
      console.error("Form submission failed:", error);
    }
  };

  // Reusing the BottomGradient component from auth forms if desired
  const BottomGradient = () => (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );


  return (
    <div className="max-w-lg w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
        Create a New Project
      </h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
        Share your academic and technical work with the community.
      </p>

      {(projectStore.projectError || authStore.error) && ( // Also check authStore for potential issues
        <div className="my-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {projectStore.projectError || authStore.error} {/* Display errors */}
        </div>
      )}

      <form className="my-8" onSubmit={handleSubmit}>
        <LabelInputContainer className="mb-4">
          <FormLabel htmlFor="title">Project Title</FormLabel>
          <AceternityInput id="title" name="title" placeholder="e.g., AI-Powered Sentiment Analysis" type="text" value={projectData.title} onChange={handleProjectDataChange} required />
        </LabelInputContainer>

        <LabelInputContainer className="mb-4">
          <FormLabel htmlFor="description">Description</FormLabel>
          {/* TODO: Replace with Aceternity UI Textarea if available, or style basic textarea */}
          <textarea
            id="description"
            name="description"
            placeholder="Describe your project..."
            value={projectData.description}
            onChange={handleProjectDataChange}
            rows={4}
            className="flex h-auto w-full border-none bg-gray-50 dark:bg-zinc-800 text-black dark:text-white shadow-input rounded-md px-3 py-2 text-sm placeholder:text-neutral-400 dark:placeholder-text-neutral-600 focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600 disabled:cursor-not-allowed disabled:opacity-50 group-hover/input:shadow-none transition duration-400"
          ></textarea>
        </LabelInputContainer>

        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
           <LabelInputContainer className="flex-1">
              <FormLabel htmlFor="type">Project Type</FormLabel>
               {/* TODO: Replace with Aceternity UI Select if available */}
              <select
              id="type"
              name="type"
              value={projectData.type} // This value should match one of the `value` properties in projectTypeOptions
              onChange={handleProjectDataChange}
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
              <AceternityInput id="department" name="department" placeholder="e.g., Computer Science" type="text" value={projectData.department} onChange={handleProjectDataChange} required />
           </LabelInputContainer>
        </div>

        <LabelInputContainer className="mb-8">
            <FormLabel htmlFor="year">Academic Year</FormLabel>
            <AceternityInput id="year" name="year" placeholder="e.g., 2023" type="number" value={projectData.year === null ? '' : projectData.year} onChange={handleProjectDataChange} /> {/* Handle null/empty for number input */}
        </LabelInputContainer>


         {/* File Upload Input */}
         <LabelInputContainer className="mb-8">
            <FormLabel htmlFor="files">Attach Files</FormLabel>
             {/* TODO: Style this file input or replace with a custom component */}
            <input
              id="files"
              name="files"
              type="file"
              onChange={handleFileChange}
              multiple // Allow multiple file selection
              className="block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
            />
             {selectedFiles.length > 0 && (
                 <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                     Selected {selectedFiles.length} file(s).
                 </p>
             )}
         </LabelInputContainer>


        <MovingBorderButton
          type="submit"
          // borderRadius="0.5rem"
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_var(--zinc-800)_inset,0px_1px_0px_0px_var(--zinc-800)_inset]"
          disabled={projectStore.isCreatingProject || projectStore.isUploadingFiles} // Disable button while creating or uploading
        >
          {projectStore.isCreatingProject ? 'Creating Project...' :
           projectStore.isUploadingFiles ? `Uploading Files (${projectStore.uploadProgress}%)` :
           'Create Project'}
          <BottomGradient />
        </MovingBorderButton>

      </form>
    </div>
  );
});


export default ProjectForm;