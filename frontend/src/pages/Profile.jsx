import React from "react";
import ProfileForm from "../components/Profile/AddProfile";
import ProtectedRoute from "../Context/ProtectedRoute";

export default function Profile() {
  return (
    <div className='min-h-screen pt-10 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-700'>
      <div className='container mx-auto px-2 py-4'>
        <div className='max-w-full mx-auto'>
          <h1 className='text-2xl font-bold mb-4 dark:text-white'>Add Your Profile</h1>
          <ProtectedRoute>
            {" "}
            <ProfileForm />
          </ProtectedRoute>
        </div>
      </div>
    </div>
  );
}
