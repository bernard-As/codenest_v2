// frontend/src/components/home/HeroSection.tsx
import React from 'react';
// Removed: import { Link } from 'react-router-dom'; // MovingBorderButton will handle Link
import { ArrowRightIcon } from '@heroicons/react/24/solid';

// Import Aceternity UI Components (adjust paths as needed)
import { AuroraBackground } from '../ui/aceternity/AuroraBackground';
import { TypewriterEffectSmooth } from '../ui/aceternity/TypewriterEffectSmooth';
import { MovingBorderButton } from '../ui/aceternity/buttons'; // Assuming you created/copied this

const HeroSection: React.FC = () => {
  const words = [
    { text: "Welcome" },
    { text: "to" },
    { text: "CodeNest", className: "text-blue-500 dark:text-blue-400" },
  ];

  return (
    // Wrap with AuroraBackground
    <AuroraBackground>
      {/* motion.div is often part of AuroraBackground's children, ensure it's handled correctly */}
      {/* The content below might need to be a child of motion.div if AuroraBackground expects it */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] md:min-h-[90vh] px-4"> {/* Ensure content is above background */}
        <TypewriterEffectSmooth words={words} className="mb-6 md:mb-8" />
        <p className="mt-2 md:mt-4 max-w-xl mx-auto text-base sm:text-lg text-neutral-600 dark:text-neutral-300 text-center">
          Collaborate, publish, and discover academic and technical projects.
          Connect with students, lecturers, and advisors in a unified platform.
        </p>
        <div className="mt-8 md:mt-10 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <MovingBorderButton
            as="link" // Use react-router-dom Link
            to="/register"
            duration={3000}
            // borderRadius="0.5rem" // Equivalent to rounded-md
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white border-neutral-200 dark:border-slate-800 text-sm sm:text-base"
            containerClassName="w-full sm:w-auto"
          >
            Get Started <ArrowRightIcon className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </MovingBorderButton>
          <MovingBorderButton
            as="link" // Use react-router-dom Link
            to="/projects"
            duration={3000}
            // borderRadius="0.5rem" // Equivalent to rounded-md
            className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-blue-500 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 text-sm sm:text-base"
            containerClassName="w-full sm:w-auto"
          >
            Explore Projects
          </MovingBorderButton>
        </div>
      </div>
    </AuroraBackground>
  );
};

export default HeroSection;