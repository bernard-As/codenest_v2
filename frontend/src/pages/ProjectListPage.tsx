// frontend/src/pages/ProjectListPage.tsx
import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { authStore, projectStore } from '../stores';
import ProjectCard from '../components/project/ProjectCard';
import ProjectCardSkeleton from '../components/project/ProjectCardSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom'; // For "Create Project" button
import { BackgroundLines } from '../components/ui/aceternity/background-lines';
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Stagger animation for children
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
  exit: { // For AnimatePresence when items are removed (e.g., due to filtering)
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 }
  }
};

const ProjectListPage: React.FC = observer(() => {
  useEffect(() => {
    projectStore.fetchProjects();
  }, []); // Fetch projects on component mount

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
       {/* BoxesCore as full background */}
      {/*
        The key is to make BoxesCore fixed or absolute to cover the viewport
        and ensure its z-index is behind the content.
        You might need to adjust props of BoxesCore for color scheme.
        Example: If BackgroundLines takes color props or uses CSS variables.
      */}
      <BackgroundLines
        className="absolute inset-0 w-full h-full -z-10" // Takes full space and is behind
        // Example props for darker theme (these are hypothetical, check BoxesCore actual props):
        // backgroundColor="black" // Make it transparent if main div has bg
        // boxColorLight="rgba(59, 130, 246, 0.3)" // Lighter blue for boxes in light mode
        // boxColorDark="rgba(30, 58, 138, 0.4)"   // Darker blue for boxes in dark mode (more subtle)
        // lineColorLight="rgba(156, 163, 175, 0.1)" // Light gray lines
        // lineColorDark="rgba(55, 65, 81, 0.2)"    // Darker gray lines
        children={null}
      />
       <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-0 relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Explore Projects
        </h1>
        {authStore.isAuthenticated && ( // Show create button if authenticated
          <Link
            to="/projects/create"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            // TODO: Use Aceternity UI Button
          >
            Create New Project
          </Link>
        )}
      </div>

      {projectStore.projectError && (
        <div className="my-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {projectStore.projectError}
        </div>
      )}

      {projectStore.isLoadingProjects && projectStore.projects.length === 0 && (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {Array.from({ length: 8 }).map((_, index) => ( // Show 8 skeletons
            <motion.div key={`skeleton-${index}`} variants={itemVariants}>
              <ProjectCardSkeleton />
            </motion.div>
          ))}
        </motion.div>
      )}

      {!projectStore.isLoadingProjects && projectStore.projects.length === 0 && !projectStore.projectError && (
        <div className="text-center py-12">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl text-gray-600 dark:text-gray-400"
          >
            No projects found. Be the first to create one!
          </motion.p>
        </div>
      )}

      {projectStore.projects.length > 0 && (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          // AnimatePresence is useful if you filter/remove items dynamically later
          // If just loading, the initial stagger from containerVariants is enough
        >
           <AnimatePresence> {/* Useful if items can be removed by filtering */}
            {projectStore.projects.map((project) => (
              <motion.div
                key={project.id}
                variants={itemVariants}
                // layout // Enable this if you have filtering that reorders items
                exit="exit" // Requires AnimatePresence
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* TODO: Add Pagination controls here when implemented */}
      </div>
    </div>
  );
});

export default ProjectListPage;