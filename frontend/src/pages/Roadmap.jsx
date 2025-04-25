import React, { useContext, useState , useEffect} from "react";
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
  const {
    hasProfile,
    setHasProfile,
    evaluated,
    setEvaluated,
  } = useContext(SkillsContext);

  const [evaluationForm, setEvaluationForm] = useState({
    taskFile1: null,
    taskFile2: null,
    hardSkillRating: 40,
    softSkillsResponse1: "",
    softSkillsResponse2: "",
    projectLink: "",
    projectContribution: "",
    projectImprovement: "",
    jobExperience: "",
  });
  const [questions, setQuestions] = useState({
    hardSkillsTask1: "",
    hardSkillsTask2: "",
    softSkillsQuestion1: "",
    softSkillsQuestion2: "",
    projectLink: "",
    projectContribution: "",
    projectImprovement: "",
    jobExperience: "",
  });
  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-full mx-auto">
          <h1 className="text-3xl font-bold mb-8 dark:text-white">
            Personalized Roadmap
          </h1>
          <ProtectedRoute>
            {!hasProfile && !evaluated ? (
              <ProfileForm
                setHasProfile={setHasProfile}
              />
            ) : (
              ""
            )}

            {hasProfile && !evaluated ? (
              <EvaluateProfile
                setEvaluated={setEvaluated}
                formData={evaluationForm}
                setFormData={setEvaluationForm}
                questions={questions}
                setQuestions={setQuestions}
              />
            ) : (
              ""
            )}
            {evaluated ? <SkillsGraph evaluationForm={evaluationForm} setEvaluationForm={setEvaluationForm} questions={questions} /> : ""}
          </ProtectedRoute>
        </div>
      </div>
    </div>
  );
}
