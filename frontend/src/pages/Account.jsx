import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import axios from "axios";
import { handleSuccess } from "../utils";
export function Account() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      const res = await logout();
      if (res.success) {
        handleSuccess("Logged out successfully");
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (error) {
      console.error("Logout failed", error);
    }
  };
  return (
    <div className="flex flex-col justify-center items-center pt-20 pb-20">
      {" "}
      {user ? (
        <>
          <span className="block text-4xl md:text-6xl font-bold mb-6 pt-10 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            Manage Account
          </span>
          <button
            onClick={handleLogout}
            className="block text-lg md:text-xl font-bold mb-6 pt-10 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400"
          >
            Logout
          </button>
        </>
      ) : (
        <Link
          to={"/signup"}
          className="block text-4xl md:text-6xl font-bold mb-6 pt-10 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400"
        >
          Signup Here
        </Link>
      )}
    </div>
  );
}
