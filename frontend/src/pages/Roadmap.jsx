import React, { useContext, useState } from "react";
import { BookOpen, Code, Database, Cloud, Globe, Terminal } from "lucide-react";
import ProtectedRoute from "../components/ProtectedRoute";
import SkillsForm from "../components/AddProfile";
import { SkillsContext } from "../Context/SkillsContext";
export function Roadmap() {
  const { hasProfile, setHasProfile, setRoadmap, profile, setProfile} =
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
              <UsersSkills skillPaths={skillPaths} />
            )}
          </ProtectedRoute>
        </div>
      </div>
    </div>
  );
}

function UsersSkills({ skillPaths }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {skillPaths.map((path, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                <path.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold dark:text-white">
                  {path.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {path.duration}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  Skills Covered
                </h3>
                <div className="flex flex-wrap gap-2">
                  {path.skills.map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="px-3 py-1 bg-primary-100 dark:bg-indigo-900/50 text-primary-600 dark:text-primary-400 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  Level
                </h3>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full text-sm">
                  {path.level}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 dark:bg-gray-700/50">
            <button className="w-full bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors">
              Start Learning
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
