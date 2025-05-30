// frontend/src/components/layout/Header.tsx
import React from 'react'; // Removed useState as Aceternity Menu is not the focus now
import { Link, useNavigate } from 'react-router-dom';
import ThemeSwitcher from '../ui/ThemeSwitcher';
import { authStore } from '../../stores'; // Import authStore
import { observer } from 'mobx-react-lite'; // Import observer
// No need for AceternityMenuComponent specific imports if we're using simple links for now

const logoUrl = '/logo.png'; // Vite serves from public folder directly

const Header: React.FC = observer(() => { // Make the component an observer
  const navigate = useNavigate(); // For logout navigation

  const handleLogout = async () => {
    await authStore.logout();
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img className="h-8 w-auto" src={logoUrl} alt="CodeNest Logo" />
              <span className="ml-2 text-xl font-semibold text-gray-800 dark:text-white">CodeNest</span>
            </Link>
          </div>

          {/* Simple Navigation Links */}
          <nav className="hidden md:flex space-x-6 items-center">
            <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
            <Link to="/projects" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Projects</Link>
            {/* Add Create Project Link if authenticated */}
            {authStore.isAuthenticated && (
                <Link to="/projects/create" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                  Create Project
                </Link>
            )}
            <Link to="/about" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <ThemeSwitcher />
            {authStore.isAuthenticated && authStore.user ? (
              <>
                <span className="hidden sm:inline text-sm text-gray-700 dark:text-gray-300">
                  Hi, {authStore.user.first_name || 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-block px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-gray-800 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
            {/* Placeholder for Mobile Menu Button - implement if needed */}
            <div className="md:hidden">
              <button
                aria-label="Open menu"
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-3.75 5.25h12.75" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

export default Header;