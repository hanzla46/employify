import React, { useContext, useState, useEffect } from "react";
import { BookOpen, Code, Database, Cloud, Globe, Terminal } from "lucide-react";
import ProtectedRoute from "../Context/ProtectedRoute";
import ProfileForm from "../components/Profile/AddProfile";
import EvaluateProfile from "../components/Profile/EvaluateProfile";
import SkillsGraph from "../components/Roadmap/SkillsGraph";
import { SkillsContext } from "../Context/SkillsContext";
export function Roadmap() {
  useEffect(() => {
    document.title = "Roadmap | Employify AI";
  }, []);
  const { hasProfile, setHasProfile, careerPath } = useContext(SkillsContext);

  return (
    <div className='min-h-screen pt-10 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-700'>
      <div className='container mx-auto px-2 py-4'>
        <div className='max-w-full mx-auto'>
          <h1 className='fixed left-1 top-14 z-10 text-2xl font-bold mb-4 dark:text-white'>{careerPath || "Personalized Roadmap"}</h1>
          <ProtectedRoute>{!hasProfile ? <ProfileForm setHasProfile={setHasProfile} /> : <SkillsGraph />}</ProtectedRoute>
        </div>
      </div>
    </div>
  );
}
