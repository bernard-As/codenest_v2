// frontend/src/components/project/ProjectDetailSkeleton.tsx
import React from 'react';
import { motion } from 'framer-motion';

const ProjectDetailSkeleton: React.FC = () => {
  return (
    <motion.div
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="animate-pulse">
        {/* Title Skeleton */}
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 mb-4"></div>
        {/* Sub-info Skeleton (Owner, Date) */}
        <div className="flex space-x-4 mb-6">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-1/4"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-1/5"></div>
        </div>

        {/* Description Skeleton */}
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-full mb-3"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-full mb-3"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-5/6 mb-8"></div>

        {/* Files Section Title Skeleton */}
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3 mb-6"></div>
        {/* File Item Skeletons (repeat a few times) */}
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3">
            <div className="flex justify-between items-center">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-1/6"></div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProjectDetailSkeleton;