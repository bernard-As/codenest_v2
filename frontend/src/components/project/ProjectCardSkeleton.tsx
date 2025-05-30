// frontend/src/components/project/ProjectCardSkeleton.tsx
import React from 'react';
import { motion } from 'framer-motion';

const ProjectCardSkeleton: React.FC = () => {
  return (
    <motion.div
      className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="animate-pulse">
        {/* Skeleton for an image/icon placeholder */}
        <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-md mb-4"></div>
        {/* Skeleton for title */}
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 mb-3"></div>
        {/* Skeleton for description lines */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-5/6 mb-4"></div>
        {/* Skeleton for tags/owner info */}
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-8"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCardSkeleton;