// frontend/src/components/home/FeaturesSection.tsx
import React from 'react';
import { AcademicCapIcon, CodeBracketSquareIcon, UsersIcon, DocumentTextIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// Import Aceternity UI Components
import { BentoGrid, BentoGridItem } from '../ui/aceternity/BentoGrid'; // Adjust path
import { cn } from '../../lib/utils'; // Adjust path

interface Feature {
  title: string; // BentoGridItem often uses `title`
  description: string;
  header?: React.ReactNode; // For visual element in BentoGridItem
  icon?: React.ReactNode;   // Can be part of header or description
  className?: string; // For BentoGridItem styling (e.g., column span)
  color?: string; // For icon color, if not handled by header
}

const features: Feature[] = [
  {
    title: 'Diverse Project Uploads',
    description: 'Share code, AutoCAD files, research papers, and books.',
    header: <div className="flex justify-center items-center h-full w-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-xl"><CodeBracketSquareIcon className="h-12 w-12 text-blue-600 dark:text-blue-400" /></div>,
    className: 'md:col-span-2', // Example: make this feature wider
    color: 'text-blue-500',
  },
  {
    title: 'Seamless Collaboration',
    description: 'Connect with peers, lecturers, and advisors. Comment, rate, and discuss.',
    header: <div className="flex justify-center items-center h-full w-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-xl"><UsersIcon className="h-12 w-12 text-green-600 dark:text-green-400" /></div>,
    className: 'md:col-span-1',
    color: 'text-green-500',
  },
  {
    title: 'University Focused',
    description: 'Tailored for academics with university email verification and roles.',
    header: <div className="flex justify-center items-center h-full w-full bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-xl"><AcademicCapIcon className="h-12 w-12 text-purple-600 dark:text-purple-400" /></div>,
    className: 'md:col-span-1',
    color: 'text-purple-500',
  },
  {
    title: 'Advanced Search & Filter',
    description: 'Find projects by type, department, year, or contributor.',
    header: <div className="flex justify-center items-center h-full w-full bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 rounded-xl"><MagnifyingGlassIcon className="h-12 w-12 text-yellow-600 dark:text-yellow-400" /></div>,
    className: 'md:col-span-1',
    color: 'text-yellow-500',
  },
  {
    title: 'Rich Content Previews',
    description: 'View PDFs, syntax-highlighted code, and (soon) AutoCAD previews.',
    header: <div className="flex justify-center items-center h-full w-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 rounded-xl"><DocumentTextIcon className="h-12 w-12 text-red-600 dark:text-red-400" /></div>,
    className: 'md:col-span-2',
    color: 'text-red-500',
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-base font-semibold text-blue-600 dark:text-blue-400 tracking-wide uppercase">Why CodeNest?</h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            A Better Way to Collaborate and Publish
          </p>
        </div>

        <BentoGrid className="max-w-4xl mx-auto md:auto-rows-[20rem]">
          {features.map((feature, i) => (
            <BentoGridItem
              key={i}
              title={feature.title}
              description={feature.description}
              header={feature.header}
              // icon={feature.icon} // icon prop might be used differently by BentoGridItem
              className={cn(feature.className, "group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-white border border-transparent justify-between flex flex-col space-y-4")}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
};

export default FeaturesSection;