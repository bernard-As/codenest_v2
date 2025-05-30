// frontend/src/components/project/ProjectCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { Project } from '../../types/project';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { AcademicCapIcon, CodeBracketIcon, DocumentTextIcon } from '@heroicons/react/24/outline'; // Example icons

interface ProjectCardProps {
  project: Project;
}

const getProjectIcon = (type: Project['type']) => {
  switch (type) {
    case 'CODE': return <CodeBracketIcon className="w-8 h-8 text-blue-500" />;
    case 'AUTOCAD': return <AcademicCapIcon className="w-8 h-8 text-purple-500" />; // Placeholder
    case 'BOOK':
    case 'PAPER': return <DocumentTextIcon className="w-8 h-8 text-green-500" />;
    default: return <div className="w-8 h-8 bg-gray-300 rounded-md"></div>; // Generic placeholder
  }
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Link to={`/projects/${project.id}`} className="block group">
      <motion.div
        className={cn(
          "p-4 md:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden",
          "hover:shadow-2xl transition-shadow duration-300 ease-in-out",
          "dark:border dark:border-gray-700 dark:hover:border-blue-500"
        )}
        whileHover={{ y: -5, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="flex items-center mb-3">
          {getProjectIcon(project.type)}
          <span className="ml-3 px-2 py-0.5 text-xs font-semibold text-indigo-800 bg-indigo-100 dark:bg-indigo-700 dark:text-indigo-100 rounded-full">
            {project.type}
          </span>
        </div>

        <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {project.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 h-16 overflow-hidden line-clamp-3">
          {project.description || 'No description available.'}
        </p>
        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-500">
          <span>By: {project.owner.first_name} {project.owner.last_name}</span>
          <span>{project.department || 'N/A'} {project.year && `(${project.year})`}</span>
        </div>
        {/* Optionally show number of files or other summary info */}
        {project.files && project.files.length > 0 && (
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-600">
                {project.files.length} file(s)
            </p>
        )}
      </motion.div>
    </Link>
  );
};

export default ProjectCard;