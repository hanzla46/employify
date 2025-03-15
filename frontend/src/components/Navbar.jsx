import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Brain, Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import FancyButton from "./Button";

export function Navbar({ darkMode, setDarkMode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useContext(AuthContext);

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/interview", label: "AI Interview" },
    { path: "/skills", label: "Skills Roadmap" },
    { path: "/jobs", label: "Job Portal" },
    { path: "/pricing", label: "Pricing" },
    { path: "/about", label: "About" },
    {
      path: user ? "/account" : "/signup",
      label: user ? user.name : <FancyButton text={"Sign Up"} />,
    },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md fixed w-full z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Employify
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            {/* Theme Toggle for Desktop */}
            <div className="right-6">
              <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-900 dark:text-white focus:outline-none z-50 relative"
            >
              {isMobileMenuOpen ? <X className="fixed right-11 top-5 h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-gray-800 shadow-md z-40 flex flex-col items-center space-y-4 py-4 px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                }`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          {/* Theme Toggle BELOW the Menu Items */}
          <div className="w-full flex justify-center mt-4">
            <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
          </div>
        </div>
      )}
    </nav>
  );
}