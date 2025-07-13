import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProtectedRoute from "../Context/ProtectedRoute";
import SkillsGraph from "../components/Roadmap/SkillsGraph";
import { SkillsContext } from "../Context/SkillsContext";
import { RefreshCcw } from "lucide-react";
export function Roadmap() {
  useEffect(() => {
    document.title = "Roadmap | Employify AI";
  }, []);
  const { hasProfile, careerPath, fetchUpdatedRoadmap, roadmap, contextLoading } = useContext(SkillsContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (contextLoading) return;
    //still wait for 1 second to ensure the context is fully loaded
    const timer = setTimeout(() => {
      // Check if the user has a profile
      if (!hasProfile) {
        navigate("/profile");
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [hasProfile, navigate, contextLoading]);

  if (!hasProfile) return null;

  return (
    <div className='min-h-screen pt-10 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-700'>
      <div className='container mx-auto px-2 py-4'>
        <div className='max-w-full mx-auto'>
          <div
            className={`${
              careerPath ? "fixed left-1 top-14 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-lg px-4 py-2 rounded-xl" : ""
            } flex items-center gap-2`}>
            <h1 className='text-xl font-bold mb-0 dark:text-white'>{careerPath ? `Roadmap for ${careerPath}` : "Roadmap"}</h1>

            {roadmap.length > 0 && (
              <button onClick={fetchUpdatedRoadmap} className='text-gray-400 hover:text-green-500 transition-colors'>
                <RefreshCcw size={22} />
              </button>
            )}
          </div>

          <ProtectedRoute>{hasProfile && <SkillsGraph />}</ProtectedRoute>
        </div>
      </div>
    </div>
  );
}
