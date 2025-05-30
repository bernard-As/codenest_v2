// frontend/src/components/ui/ThemeSwitcher.tsx
import React from 'react';
import { observer } from 'mobx-react-lite';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { uiStore } from '../../stores';

const ThemeSwitcher: React.FC = observer(() => { // This is correctly an observer
  return (
    <button
      onClick={() => uiStore.toggleTheme()} // This is where the call happens
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
    >
      {/* This read of uiStore.theme is within a reactive context (the observer component) */}
      {uiStore.theme === 'light' ? (
        <MoonIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      ) : (
        <SunIcon className="w-6 h-6 text-yellow-500" />
      )}
    </button>
  );
});

export default ThemeSwitcher;