import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-all hover:bg-brand-lightest dark:hover:bg-slate-700 hover:scale-105"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 text-brand-700 dark:text-brand-300 transition-colors" />
      ) : (
        <Sun className="h-5 w-5 text-brand-700 dark:text-brand-300 transition-colors" />
      )}
    </button>
  );
};

export default ThemeToggle;