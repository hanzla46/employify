import React from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ darkMode, setDarkMode }) {
  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className='fixed -top-2 md:top-2 right-3 md:right-4 lg:right-5 h-9 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors z-50 p-2 rounded-full shadow-lg'
      aria-label='Toggle theme'>
      {darkMode ? <Sun className='h-5 w-5' /> : <Moon className='h-5 w-5' />}
    </button>
  );
}
