// frontend/src/pages/HomePage.tsx
import React from 'react';
import HeroSection from '../components/home/HeroSection';
import FeaturesSection from '../components/home/FeaturesSection';

const HomePage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <section className="py-16 bg-blue-600 dark:bg-blue-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to Dive In?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Join CodeNest today and start your journey of academic collaboration.
          </p>
          <div className="mt-8">
            <a
              href="/register" // Link component from react-router-dom would be better for internal navigation
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
            >
              Create Your Account
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;