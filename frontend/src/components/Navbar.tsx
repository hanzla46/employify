import { NavLink } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
}

export function Navbar({ darkMode, setDarkMode }: NavbarProps) {
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/interview', label: 'AI Interview' },
    { path: '/skills', label: 'Skills Roadmap' },
    { path: '/jobs', label: 'Job Portal' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/about', label: 'About' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md fixed w-full z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Employify</span>
          </NavLink>
          
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
          </div>
        </div>
      </div>
    </nav>
  );
}