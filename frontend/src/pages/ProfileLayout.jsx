import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SkillsContext } from "../Context/SkillsContext";

export default function ProfileLayout() {
  const { hasProfile } = useContext(SkillsContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (hasProfile && location.pathname === "/profile/add") {
      navigate("/profile/edit", { replace: true });
    }
  }, [hasProfile, location.pathname, navigate]);

  return (
    <div className='min-h-screen pt-10 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-700'>
      <div className='container mx-auto px-2 py-4'>
        <div className='max-w-full mx-auto'>
          <div className='flex gap-4 mb-6'>
            <NavLink
              to='/profile/add'
              className={({ isActive }) =>
                `px-4 py-2 rounded font-medium transition-colors ${
                  isActive
                    ? "bg-primary-600 text-white dark:bg-primary-400 dark:text-black"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`
              }>
              Add Profile
            </NavLink>
            <NavLink
              to='/profile/edit'
              className={({ isActive }) =>
                `px-4 py-2 rounded font-medium transition-colors ${
                  isActive
                    ? "bg-primary-600 text-white dark:bg-primary-400 dark:text-black"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`
              }>
              Edit Profile
            </NavLink>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
