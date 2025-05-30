// frontend/src/pages/RegisterPage.tsx
import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';
import { observer } from 'mobx-react-lite';
import { authStore } from '../stores';
import { Navigate } from 'react-router-dom';

// Optional: Background component from Aceternity for visual flair
// import { BackgroundBeams } from "../components/ui/aceternity/BackgroundBeams";


const RegisterPage: React.FC = observer(() => {
  if (authStore.isAuthenticated) {
    return <Navigate to="/" replace />; // Or to a dashboard page
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 relative">
      {/* Optional: <BackgroundBeams className="absolute top-0 left-0 w-full h-full z-0" /> */}
      <div className="relative z-10"> {/* Ensure form is above beams */}
        <RegisterForm />
      </div>
    </div>
  );
});

export default RegisterPage;