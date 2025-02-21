import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Brain, Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
export function Navbar({ darkMode, setDarkMode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // const [loggedUser, setLoggedUser] = useState();
  const { user, loading } = useContext(AuthContext);

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/interview", label: "AI Interview" },
    { path: "/skills", label: "Skills Roadmap" },
    { path: "/jobs", label: "Job Portal" },
    { path: "/pricing", label: "Pricing" },
    { path: "/about", label: "About" },
    {
      path: user ? "/account" : "/signup",
      label: user ? user.name : "Signup",
    },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md fixed w-full z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Employify
            </span>
          </NavLink>

          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-900 dark:text-white focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-md">
          <div className="container mx-auto px-4 py-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <div className="mt-2">
              <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
