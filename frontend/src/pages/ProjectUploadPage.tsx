// frontend/src/pages/ProjectUploadPage.tsx
import React from 'react';
import ProjectForm from '../components/project/ProjectForm';
import { observer } from 'mobx-react-lite';
import { authStore } from '../stores';
import { Navigate } from 'react-router-dom';

// Optional: Background component from Aceternity
// import { BackgroundBeams } from "../components/ui/aceternity/BackgroundBeams";

const ProjectUploadPage: React.FC = observer(() => {
  // Require authentication to access this page
  if (!authStore.isAuthenticated) {
    // Store the intended location to redirect back after login
    // TODO: Implement saving location state for redirection after auth
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 relative">
       {/* Optional: <BackgroundBeams className="absolute top-0 left-0 w-full h-full z-0" /> */}
      <div className="relative z-10">
        <ProjectForm />
      </div>
    </div>
  );
});

export default ProjectUploadPage;