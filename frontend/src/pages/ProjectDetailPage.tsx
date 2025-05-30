// frontend/src/pages/ProjectDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { projectStore, authStore } from '../stores';
import ProjectDetailSkeleton from '../components/project/ProjectDetailSkeleton';
import FilePreviewer from '../components/project/FilePreviewer';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'; // Example icons
import { BackgroundLines } from '../components/ui/aceternity/background-lines';


// Variants for page sections
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const ProjectDetailPage: React.FC = observer(() => {
  const { projectId } = useParams<{ projectId: string }>();
  // const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);


  useEffect(() => {
    if (projectId) {
      projectStore.fetchProject(Number(projectId));
    }
    // Cleanup when component unmounts or projectId changes
    return () => {
      projectStore.clearCurrentProject(); // Clear the project from store
    };
  }, [projectId]);


  const project = projectStore.currentProject;
  const isLoading = projectStore.isLoadingProject;
  const error = projectStore.projectError;

  // TODO: Implement delete project functionality
  // const handleDeleteProject = async () => {
  //   if (project && window.confirm(`Are you sure you want to delete "${project.title}"? This cannot be undone.`)) {
  //     try {
  //       // await projectStore.deleteProject(project.id);
  //       // navigate('/projects'); // Redirect after deletion
  //       console.log("Delete project action to be implemented");
  //       setShowDeleteConfirm(false);
  //     } catch (e) {
  //       console.error("Failed to delete project", e);
  //       // Error will be set in projectStore.projectError
  //     }
  //   } else {
  //      setShowDeleteConfirm(false);
  //   }
  // };


  if (isLoading && !project) {
    return <ProjectDetailSkeleton />;
  }

  if (error && !project) { // Show error if project couldn't be loaded at all
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl text-red-500"
        >
          Error: {error}
        </motion.p>
        <Link to="/projects" className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline">
          ← Back to Projects
        </Link>
      </div>
    );
  }

  if (!project) {
    // This case might happen briefly or if projectId is invalid and fetchProject doesn't throw an error that gets caught by the above.
    // Or if fetch completes but project is still null.
    return (
      <div className="container mx-auto px-4 py-8 text-center">
         <p className="text-xl text-gray-600 dark:text-gray-400">Project not found.</p>
         <Link to="/projects" className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline">
            ← Back to Projects
         </Link>
      </div>
    );
  }

  // Check if the current authenticated user is the owner of the project
  const isOwner = authStore.isAuthenticated && authStore.user && authStore.user.id === project.owner.id;


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BackgroundLines
              className="fixed inset-0 w-full h-full -z-10" // Takes full space and is behind
              // Example props for darker theme (these are hypothetical, check BoxesCore actual props):
              // backgroundColor="black" // Make it transparent if main div has bg
              // boxColorLight="rgba(59, 130, 246, 0.3)" // Lighter blue for boxes in light mode
              // boxColorDark="rgba(30, 58, 138, 0.4)"   // Darker blue for boxes in dark mode (more subtle)
              // lineColorLight="rgba(156, 163, 175, 0.1)" // Light gray lines
              // lineColorDark="rgba(55, 65, 81, 0.2)"    // Darker gray lines
              children={null}
              // lineColorDark="rgba(55, 65, 81, 0.15)"
            />
                   <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 z-0 relative">

      {/* Back Button */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
        <Link
          to="/projects"
          className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline mb-6 group"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
          Back to Projects
        </Link>
      </motion.div>

      {/* Project Header */}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-0">
                {project.title}
            </h1>
            {isOwner && (
                <div className="flex space-x-2 mt-2 sm:mt-0">
                    <Link
                        to={`/projects/${project.id}/edit`} // TODO: Create edit page
                        className="px-3 py-1.5 text-xs font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600 transition-colors inline-flex items-center"
                        title="Edit Project"
                    >
                        <PencilSquareIcon className="w-4 h-4 mr-1" /> Edit
                    </Link>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors inline-flex items-center"
                        title="Delete Project"
                    >
                        <TrashIcon className="w-4 h-4 mr-1" /> Delete
                    </button>
                </div>
            )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          By: {project.owner.first_name} {project.owner.last_name} ({project.owner.email})
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          Type: <span className="font-medium">{project.type}</span>
          {project.department && <span className="ml-2">| Department: <span className="font-medium">{project.department}</span></span>}
          {project.year && <span className="ml-2">| Year: <span className="font-medium">{project.year}</span></span>}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
          Published: {new Date(project.created_at).toLocaleDateString()}
        </p>
      </motion.div>

      {/* Project Description */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
        className="prose dark:prose-invert max-w-none bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8"
      >
        <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200 border-b pb-2 dark:border-gray-700">Description</h2>
        <p>{project.description || 'No description provided.'}</p>
      </motion.div>
      
      {/* Collaborators Section */}
      {project.collaborators && project.collaborators.length > 0 && (
        <motion.section variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }} className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b pb-2 dark:border-gray-700">
            Collaborators & Advisors ({project.collaborators.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {project.collaborators.map(collaborator => (
              <motion.div
                key={collaborator.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * collaborator.id /* Simple stagger based on ID */ }}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                {/* TODO: Link to user profile page later */}
                <p className="font-medium text-gray-900 dark:text-white">
                  {collaborator.first_name} {collaborator.last_name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{collaborator.email}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{collaborator.role}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Project Files */}
      <motion.section variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }} className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b pb-2 dark:border-gray-700">
          Project Files ({project.files?.length || 0})
        </h2>
        {project.files && project.files.length > 0 ? (
          <div className="space-y-3">
            <AnimatePresence>
              {project.files.map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <FilePreviewer file={file} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No files uploaded for this project yet.</p>
        )}
      </motion.section>

      {/* TODO: Collaborators Section */}
      {/* TODO: Comments Section */}
      {/* TODO: Rating Section */}

      {/* Delete Confirmation Modal (Basic) */}
      {/* TODO: Replace with Aceternity UI Modal */}
      {isOwner && showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to delete the project "{project.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                // onClick={handleDeleteProject} // Wire this up when deleteProject in store is ready
                onClick={() => {console.log("Implement project delete"); setShowDeleteConfirm(false);}}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
</div>
    </div>
  );
});

export default ProjectDetailPage;