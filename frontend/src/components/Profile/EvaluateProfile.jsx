import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import FancyButton from "@/components/Button";
// import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

export default function EvaluateProfile({ setEvaluated, profile, formData, setFormData }) {
  // State for the questions
  const [questions, setQuestions] = useState({
    hardSkillsTask: "Build a simple CRUD application using React and Node.js",
    softSkillsQuestion: "How do you handle conflict in a team?",
    projectLinkPlaceholder: "Link to recent project/research",
    projectContributionPlaceholder: "What was YOUR contribution?",
    projectImprovementPlaceholder: "What would you improve in it now?",
    jobExperiencePlaceholder:
      "Describe your most recent experience & the impact you made",
  });


  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    setEvaluated(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 grid gap-6">
      <Card className="shadow-2xl rounded-2xl">
        <CardContent className="space-y-4 p-6">
          <form onSubmit={handleSubmit}>
            <h2 className="text-xl font-bold text-black dark:text-white">
              🔥 Hard Skills Task
            </h2>
            <p className="text-black dark:text-white">
              {questions.hardSkillsTask}
            </p>
            <Input
              type="file"
              onChange={(e) => handleChange("taskFile", e.target.files[0])}
              className="text-black dark:text-white mb-3"
            />
            <label className="font-medium text-black dark:text-white">
              Rate Your Skills (1-5)
            </label>
            <Input
              type="range"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              min={1}
              max={5}
              step={1}
              value={formData.hardSkillRating}
              onChange={(e) =>
                handleChange("hardSkillRating", parseInt(e.target.value))
              }
            />

            <h2 className="text-xl font-bold pt-6 text-black dark:text-white">
              🧠 Soft Skills
            </h2>
            <Textarea
              placeholder={questions.softSkillsQuestion}
              value={formData.softSkillsResponse}
              onChange={(e) =>
                handleChange("softSkillsResponse", e.target.value)
              }
            />
            <div className="flex gap-3 flex-col">
              <h2 className="text-xl font-bold pt-6 text-black dark:text-white">
                🧪 Project / Research
              </h2>
              <Input
                type="url"
                placeholder={questions.projectLinkPlaceholder}
                value={formData.projectLink}
                onChange={(e) => handleChange("projectLink", e.target.value)}
              />
              <Textarea
                placeholder={questions.projectContributionPlaceholder}
                value={formData.projectContribution}
                onChange={(e) =>
                  handleChange("projectContribution", e.target.value)
                }
              />
              <Textarea
                placeholder={questions.projectImprovementPlaceholder}
                value={formData.projectImprovement}
                onChange={(e) =>
                  handleChange("projectImprovement", e.target.value)
                }
              />
            </div>
            <h2 className="text-xl font-bold pt-6 text-black dark:text-white">
              💼 Job / Internship
            </h2>
            <Textarea
              placeholder={questions.jobExperiencePlaceholder}
              value={formData.jobExperience}
              onChange={(e) => handleChange("jobExperience", e.target.value)}
            />

            <div className="mt-6 flex content-center">
              <FancyButton
                type="submit" // This makes the button trigger the form submit
                text={"🚀 Submit Your Destiny"}
              ></FancyButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
