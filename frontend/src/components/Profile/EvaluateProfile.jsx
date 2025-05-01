import { useEffect, useState } from "react";
import { useContext } from "react";
import { SkillsContext } from "../../Context/SkillsContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import FancyButton from "@/components/Button";
import { Atom } from "react-loading-indicators";
import axios from "axios";
axios.defaults.withCredentials = true;
import { Textarea } from "@/components/ui/textarea";
const url = import.meta.env.VITE_API_URL;
export default function EvaluateProfile({ setEvaluated }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
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
        console.error("Failed to fetch questions:", result.message);
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
    const formDataToSend = new FormData();
    formDataToSend.append("file1", formData.taskFile1);
    formDataToSend.append("file2", formData.taskFile2);
    formDataToSend.append("questions", JSON.stringify(questions));
    formDataToSend.append("evaluationForm", JSON.stringify(formData));
    setLoading(true);
    axios
      .post(url + "/profile/evaluate", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        setLoading(false);
        if (response.status === 200) {
          console.log("Evaluation response:", response.data);
          setEvaluated(true);
        } else {
          console.error("Failed to evaluate profile:", response.message);
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error during evaluation:", error);
      });
  };

  return (
    <div className='max-w-4xl mx-auto p-6 grid gap-6'>
      {!loading && (
        <Card className='shadow-2xl rounded-2xl'>
          <CardContent className='space-y-4 p-6'>
            <form onSubmit={handleSubmit}>
              <div>
                {" "}
                <h2 className='text-xl font-bold text-black dark:text-white'>🔥 Hard Skills Task</h2>
                <p className='text-black dark:text-white'>{questions.hardSkillsTask1}</p>
                <Input
                  type='file'
                  onChange={(e) => handleChange("taskFile1", e.target.files[0])}
                  className='text-black dark:text-white mb-3'
                />
              </div>
              <div>
                {" "}
                <h2 className='text-xl font-bold text-black dark:text-white'>🔥 Hard Skills Task</h2>
                <p className='text-black dark:text-white'>{questions.hardSkillsTask2}</p>
                <Input
                  type='file'
                  onChange={(e) => handleChange("taskFile2", e.target.files[0])}
                  className='text-black dark:text-white mb-3'
                />
              </div>
              <label className='font-medium text-black dark:text-white'>Rate Your Skills (1-100)</label>
              <p className='text-black dark:text-white'>{formData.hardSkillRating}</p>
              <Input
                type='range'
                className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
                min={2}
                max={100}
                step={2}
                value={formData.hardSkillRating}
                onChange={(e) => handleChange("hardSkillRating", parseInt(e.target.value))}
              />

              <h2 className='text-xl font-bold pt-6 text-black dark:text-white'>🧠 Soft Skills</h2>
              <div>
                <Textarea
                  placeholder={questions.softSkillsQuestion1}
                  value={formData.softSkillsResponse1}
                  onChange={(e) => handleChange("softSkillsResponse1", e.target.value)}
                />
              </div>
              <div className='mt-3'>
                <Textarea
                  placeholder={questions.softSkillsQuestion2}
                  value={formData.softSkillsResponse2}
                  onChange={(e) => handleChange("softSkillsResponse2", e.target.value)}
                />
              </div>
              <div className='flex gap-3 flex-col'>
                <h2 className='text-xl font-bold pt-6 text-black dark:text-white'>🧪 Project / Research</h2>
                <Input
                  type='url'
                  placeholder={questions.projectLink}
                  value={formData.projectLink}
                  onChange={(e) => handleChange("projectLink", e.target.value)}
                />
                <Textarea
                  placeholder={questions.projectContribution}
                  value={formData.projectContribution}
                  onChange={(e) => handleChange("projectContribution", e.target.value)}
                />
                <Textarea
                  placeholder={questions.projectImprovement}
                  value={formData.projectImprovement}
                  onChange={(e) => handleChange("projectImprovement", e.target.value)}
                />
              </div>
              <h2 className='text-xl font-bold pt-6 text-black dark:text-white'>💼 Job / Internship</h2>
              <Textarea
                placeholder={questions.jobExperience}
                value={formData.jobExperience}
                onChange={(e) => handleChange("jobExperience", e.target.value)}
              />

              <div className='mt-6 flex content-center'>
                <FancyButton
                  type='submit' // This makes the button trigger the form submit
                  text={"🚀 Submit Your Destiny"}></FancyButton>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      {loading && (
        <div className='flex justify-center items-center h-screen'>
          <Atom color='#32cd32' size='large' text='Loading' textColor='#17d83f' />
        </div>
      )}
    </div>
  );
}
