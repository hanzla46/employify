import React, { useContext, useState } from "react";
import { BookOpen, Code, Database, Cloud, Globe, Terminal } from "lucide-react";
import ProtectedRoute from "../components/ProtectedRoute";
import SkillsForm from "../components/AddProfile";
import SkillsGraph from "../components/Roadmap/SkillsGraph";
import { SkillsContext } from "../Context/SkillsContext";
export function Roadmap() {
  const { hasProfile, setHasProfile, roadmap, setRoadmap, profile, setProfile} =
    useContext(SkillsContext);
  const skillPaths = [
    {
      title: "Frontend Development",
      icon: Globe,
      skills: ["HTML/CSS", "JavaScript", "React"],
      level: "Beginner",
      duration: "6 months",
    },
    {
      title: "Backend Development",
      icon: Terminal,
      skills: ["Node.js", "Python", "Databases", "APIs"],
      level: "Intermediate",
      duration: "8 months",
    },
    {
      title: "Cloud Computing",
      icon: Cloud,
      skills: ["AWS", "Docker", "Kubernetes", "DevOps"],
      level: "Advanced",
      duration: "12 months",
    },
  ];
 
  return (
    <div className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 dark:text-white">
            Skills Roadmap
          </h1>
          <ProtectedRoute>
            {!hasProfile ? (
              <SkillsForm setProfile={setProfile} setHasProfile={setHasProfile} />
            ) : (
              <SkillsGraph />
            )}
          </ProtectedRoute>
        </div>
      </div>
    </div>
  );
}
