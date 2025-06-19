import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProtectedRoute from "../Context/ProtectedRoute";
import SkillsGraph from "../components/Roadmap/SkillsGraph";
import { SkillsContext } from "../Context/SkillsContext";
export function Roadmap() {
  useEffect(() => {
    document.title = "Roadmap | Employify AI";
  }, []);
  const { hasProfile, careerPath } = useContext(SkillsContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasProfile) {
      navigate("/profile");
    }
  }, [hasProfile, navigate]);

  if (!hasProfile) return null;

  return (
    <div className='min-h-screen pt-10 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-700'>
      <div className='container mx-auto px-2 py-4'>
        <div className='max-w-full mx-auto'>
          <h1 className={`text-2xl font-bold mb-4 dark:text-white ${careerPath ? "fixed left-1 top-14 z-10 shadow-lg" : ""}`}>
            {careerPath || "Personalized Roadmap"}
          </h1>
          <ProtectedRoute>{hasProfile && <SkillsGraph />}</ProtectedRoute>
        </div>
      </div>
    </div>
  );
}
