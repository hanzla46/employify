import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Brain, Menu, X, UserRoundCog } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import FancyButton from "./Button";
import logo from "@/assets/logo.png";
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
    { path: "/roadmap", label: "Career Roadmap" },
    { path: "/jobs", label: "Job Portal" },
    { path: "/pricing", label: "Pricing" },
    { path: "/about", label: "About" },
    {
      path: user ? "/account" : "/signup",
      label: user ? firstName : <FancyButton text={"Sign Up"} />,
    },
  ];

  return (
    <nav
      className='fixed bg-transparent w-full z-50 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 bg-opacity-30 opacity-80 backdrop-blur-3xl shadow-2xl border-b border-gray-700 dark:border-gray-600 
      transition-all duration-300'>
      <div className='container max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-12'>
          {/* Logo */}
          <NavLink
            to='/'
            className={`flex items-center space-x-2 ml-1 md:ml-5 
              transform hover:scale-105 transition-transform duration-300`}>
            <img className='w-40 h-9' src={logo} alt='logo' />
          </NavLink>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center gap-4 flex-1 justify-end'>
            <div className='flex items-center gap-4 flex-wrap justify-end'>
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `relative px-2 py-1 rounded-xl text-base font-bold transition-all duration-300 ease-in-out
                  group overflow-hidden
                  ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg px-3 py-1.5"
                      : "hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-800 text-gray-300 hover:text-white"
                  } ${
                      item.path === "/account"
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
                        : ""
                    } ${item.path === "/account" || item.path === "/signup" ? "mr-11" : ""} ${
                      item.path === "/signup" ? "shadow-none hover:shadow-none selection:shadow-none bg-none" : ""
                    }`
                  }>
                  <div
                    className={`flex flex-row items-center h-3/5 relative z-10 
                    ${item.path !== "/account" ? "group-hover:text-cyan-200" : ""}`}>
                    {item.path === "/account" && <UserRoundCog className='mr-1 text-white' />} {item.label}
                  </div>
                  {/* Hover effect overlay */}
                  <span className='absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity duration-300'></span>
                </NavLink>
              ))}
              {/* Theme Toggle */}
              <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className='md:hidden flex items-center'>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className='text-cyan-300 focus:outline-none z-50 relative 
                hover:text-cyan-200 transform hover:scale-110 transition-all duration-300'>
              {isMobileMenuOpen ? <X className={`h-6 w-6 mr-9 mt-5`} /> : <Menu className='h-6 w-6' />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className='md:hidden absolute top-16 left-0 w-full 
          bg-gradient-to-br from-gray-900 to-black 
          shadow-2xl z-40 flex flex-col items-center space-y-4 py-4 px-4 
          border-b border-gray-700'>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 
                group overflow-hidden
                ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`
              }
              onClick={() => setIsMobileMenuOpen(false)}>
              <div className='flex flex-row items-center relative z-10'>
                {item.path === "/account" && <UserRoundCog className='mr-1' />} {item.label}
                <span className='absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity duration-300'></span>
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
