// frontend/src/pages/ProjectEditPage.tsx
import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { projectStore, authStore } from '../stores';
import ProjectEditForm from '../components/project/ProjectEditForm';
import ProjectDetailSkeleton from '../components/project/ProjectDetailSkeleton'; // Re-use skeleton
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const ProjectEditPage: React.FC = observer(() => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (projectId) {
      projectStore.fetchProject(Number(projectId));
    }
    return () => {
      projectStore.clearCurrentProject(); // Clear on unmount
    };
  }, [projectId]);

  const project = projectStore.currentProject;
  const isLoading = projectStore.isLoadingProject;
  const error = projectStore.projectError;

  // Authorization check: must be logged in and be the owner
  if (!isLoading && project && authStore.user?.id !== project.owner.id) {
    // Or if (!authStore.isAuthenticated) navigate('/login');
    console.warn("User is not the owner or not authenticated.");
    // Redirect to project detail page or show an unauthorized message
    navigate(`/projects/${projectId}`, { replace: true }); // Redirect back to detail page
    // Or show an explicit "Not Authorized" message here
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <p className="text-xl text-red-500">You are not authorized to edit this project.</p>
            <Link to={`/projects/${projectId}`} className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline">
                ← Back to Project
            </Link>
        </div>
    );
  }
   // If not authenticated at all
  if (!authStore.isAuthenticated) {
    // Redirect to login, potentially saving the intended destination
    navigate('/login', { state: { from: `/projects/${projectId}/edit` }, replace: true });
    return null; // Or a loading spinner while redirecting
  }


  if (isLoading && !project) {
    return <ProjectDetailSkeleton />;
  }

  if (error && !project) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-red-500">Error loading project: {error}</p>
        <Link to="/projects" className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline">
          ← Back to Projects
        </Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-gray-500">Project not found or you don't have access.</p>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl" // Adjust max-width as needed
        >
            <Link
                to={`/projects/${project.id}`}
                className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline mb-6 group"
            >
                <ArrowLeftIcon className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
                Back to Project Details
            </Link>
            <ProjectEditForm project={project} />
        </motion.div>
    </div>
  );
});

export default ProjectEditPage;