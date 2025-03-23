import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Brain, Menu, X, UserRoundCog } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import FancyButton from "./Button";

export function Navbar({ darkMode, setDarkMode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useContext(AuthContext);
  let firstName = "";
  if (user) {
    let Name = user.name.split(" ");
    firstName = Name[0].slice(0, 8);
  }
  const navItems = [
    { path: "/", label: "Home" },
    { path: "/interview", label: "AI Interview" },
    { path: "/roadmap", label: "Skills Roadmap" },
    { path: "/jobs", label: "Job Portal" },
    { path: "/pricing", label: "Pricing" },
    { path: "/about", label: "About" },
    {
      path: user ? "/account" : "/signup",
      label: user ? firstName : <FancyButton text={"Sign Up"} />,
    },
  ];

  return (
    <nav className="fixed w-full z-50 bg-opacity-80 backdrop-blur-lg shadow-lg border-b border-gray-300 dark:border-gray-700 transition-all">
      <div className="container mr-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink
            to="/"
            className={`flex items-center space-x-2 ml-1 md:ml-5`}
          >
            <Brain className="h-8 w-8 text-[var(--color-primary-700)] animate-pulse" />
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-wide">
              Employify
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative px-4 py-2 rounded-lg text-lg font-bold transition-all duration-300 ease-in-out
                  ${
                    isActive
                      ? "hover:text-[var(--color-primary-300)] text-[var(--color-primary-600)] underline"
                      : "hover:text-white text-gray-700 dark:text-gray-300"
                  } ${
                    item.path === "/account"
                      ? "bg-[var(--color-primary-700)] dark:bg-[var(--color-primary-400)] text-white hover:text-black dark:hover:text-black rounded-3xl"
                      : ""
                  } ${
                    item.path === "/account" || item.path === "/signup"
                      ? "mr-11"
                      : ""
                  }`
                }
              >
                <div
                  className={`flex flex-row items-center} ${
                    item.path !== "/account"
                      ? "hover:text-[var(--color-primary-300)]"
                      : ""
                  }`}
                >
                  {item.path === "/account" && (
                    <UserRoundCog className="mr-1" />
                  )}{" "}
                  {item.label}
                </div>
              </NavLink>
            ))}
            {/* Theme Toggle */}
            <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-900 dark:text-white focus:outline-none z-50 relative"
            >
              {isMobileMenuOpen ? (
                <X className={`h-6 w-6 mr-9 mt-5`} />
              ) : (
                <Menu className="h-6 w-6" />
              )}
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
                `block px-3 py-2 rounded-md text-sm font-medium transition-colors 
                ${
                  isActive
                    ? "text-blue-500"
                    : "text-gray-700 dark:text-gray-300 hover:text-blue-500"
                }`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex flex-row items-center">
                {item.path === "/account" && <UserRoundCog className="mr-1" />}{" "}
                {item.label}
              </div>
            </NavLink>
          ))}
          {/* Theme Toggle */}
          <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
        </div>
      )}
    </nav>
  );
}
