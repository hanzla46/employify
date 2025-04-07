import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import FancyButton from "@/components/Button";
import axios from "axios";
axios.defaults.withCredentials = true;
import { Textarea } from "@/components/ui/textarea";
const url = import.meta.env.VITE_API_URL;
export default function EvaluateProfile({
  setEvaluated,
  formData,
  setFormData,
  questions,
  setQuestions,
}) {
  
  useEffect(() => {
    if(localStorage.getItem("roadmap")) {
      setEvaluated(true);
      return;
    }
  },[])
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchQuetions = async () => {
      setLoading(true);
      console.log("Fetching questions...");
      const result = await axios.get(url + "/profile/getQuestions");
      setLoading(false);
      if (result.status === 200) {
        setQuestions(result.data);
        console.log("Fetched questions:", result.data);
      } else {
        console.error("Failed to fetch questions:", result.statusText);
      }
    };
    fetchQuetions();
  }, []);
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
      {!loading && (
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
                Rate Your Skills (1-100)
              </label>
              <p className="text-black dark:text-white">
                {formData.hardSkillRating}
              </p>
              <Input
                type="range"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                min={2}
                max={100}
                step={2}
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
                  placeholder={questions.projectLink}
                  value={formData.projectLink}
                  onChange={(e) => handleChange("projectLink", e.target.value)}
                />
                <Textarea
                  placeholder={questions.projectContribution}
                  value={formData.projectContribution}
                  onChange={(e) =>
                    handleChange("projectContribution", e.target.value)
                  }
                />
                <Textarea
                  placeholder={questions.projectImprovement}
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
                placeholder={questions.jobExperience}
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
      )}
      {loading && (
        <div className="flex justify-center items-center h-screen">
          <p className="text-xl font-bold text-black dark:text-white">
            Loading...
          </p>
        </div>
      )}
    </div>
  );
}
