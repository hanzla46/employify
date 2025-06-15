import React, { useState } from "react";
import { handleError, handleSuccess } from "../../utils";
import axios from "axios";
axios.defaults.withCredentials = true;
axios.defaults.headers.common["Accept"] = "application/json";
import { countryCityMap } from "./CountryCityData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const ProfileForm = ({ setHasProfile }) => {
  const url = import.meta.env.VITE_API_URL;

  const fetchSubskills = async (skillName, skillId) => {
    if (skillName === "") return;
    try {
      const response = await axios.get(`${url}/profile/subskills/${encodeURIComponent(skillName)}`);
      if (response.data.success) {
        setHardSkills(hardSkills.map((skill) => (skill.id === skillId ? { ...skill, subskills: response.data.subskills } : skill)));
      }
    } catch (error) {
      handleError("Failed to fetch subskills");
      console.error(error);
    }
  };

  const handleSubskillToggle = (skillId, subskill) => {
    setHardSkills(
      hardSkills.map((skill) => {
        if (skill.id === skillId) {
          const selectedSubskills = skill.selectedSubskills.includes(subskill)
            ? skill.selectedSubskills.filter((s) => s !== subskill)
            : [...skill.selectedSubskills, subskill];
          return { ...skill, selectedSubskills };
        }
        return skill;
      })
    );
  };

  const [activeTab, setActiveTab] = useState("hard");
  const [hardSkills, setHardSkills] = useState([{ id: Math.random(), name: "", experience: "", subskills: [], selectedSubskills: [] }]);
  const [softSkills, setSoftSkills] = useState([{ id: Math.random(), name: "", proficiency: "" }]);
  const [jobs, setJobs] = useState([
    {
      id: Math.random(),
      title: "",
      company: "",
      startDate: "",
      endDate: new Date().toISOString().split("T")[0],
    },
  ]);
  const [projects, setProjects] = useState([
    {
      id: Math.random(),
      name: "",
    },
  ]);
  const [education, setEducation] = useState([
    {
      id: Math.random(),
      degree: "",
      startYear: "",
      endYear: "",
    },
  ]);
  const [careerGoal, setCareerGoal] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const addSkill = (type) => {
    if (type === "hard") {
      const newSkill = {
        id: Math.random(),
        name: "",
        experience: "",
        subskills: [],
        selectedSubskills: [],
      };
      setHardSkills([...hardSkills, newSkill]);
    } else if (type === "soft") {
      const newSkill = {
        id: Math.random(),
        name: "",
        proficiency: "",
      };
      setSoftSkills([...softSkills, newSkill]);
    } else if (type === "job") {
      const newJob = {
        id: Math.random(),
        title: "",
        company: "",
        startDate: "",
        endDate: new Date().toISOString().split("T")[0],
      };
      setJobs([...jobs, newJob]);
    } else if (type === "project") {
      const newProject = {
        id: Math.random(),
        name: "",
      };
      setProjects([...projects, newProject]);
    } else if (type === "education") {
      const newEducation = {
        id: Math.random(),
        degree: "",
        startYear: "",
        endYear: "",
      };
      setEducation([...education, newEducation]);
    }
  };

  const handleChange = (type, id, field, value) => {
    if (type === "hard") {
      setHardSkills(hardSkills.map((skill) => (skill.id === id ? { ...skill, [field]: value } : skill)));
    } else if (type === "soft") {
      setSoftSkills(softSkills.map((skill) => (skill.id === id ? { ...skill, [field]: value } : skill)));
    } else if (type === "job") {
      setJobs(jobs.map((job) => (job.id === id ? { ...job, [field]: value } : job)));
    } else if (type === "project") {
      setProjects(projects.map((project) => (project.id === id ? { ...project, [field]: value } : project)));
    } else if (type === "education") {
      setEducation(education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)));
    }
  };

  const removeItem = (type, id) => {
    if (type === "hard" && hardSkills.length > 1) {
      setHardSkills(hardSkills.filter((skill) => skill.id !== id));
    } else if (type === "soft" && softSkills.length > 1) {
      setSoftSkills(softSkills.filter((skill) => skill.id !== id));
    } else if (type === "job" && jobs.length > 1) {
      setJobs(jobs.filter((job) => job.id !== id));
    } else if (type === "project" && projects.length > 1) {
      setProjects(projects.filter((project) => project.id !== id));
    } else if (type === "education" && education.length > 1) {
      setEducation(education.filter((edu) => edu.id !== id));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Process hard skills
    const processedHardSkills = hardSkills.map((skill) => ({
      name: skill.name,
      experience: skill.experience.toString(),
      subskills: skill.selectedSubskills || [],
    }));

    // Process soft skills
    const processedSoftSkills = softSkills.map((skill) => ({
      name: skill.name,
      proficiency: skill.proficiency,
    }));

    // Process jobs
    const processedJobs = jobs.map((job) => ({
      title: job.title,
      company: job.company,
      startDate: job.startDate,
      endDate: job.endDate,
    }));

    // Process projects
    const processedProjects = projects.map((project) => ({
      name: project.name,
    }));

    // Process education
    const processedEducation = education.map((edu) => ({
      degree: edu.degree,
      field: edu.field,
      startYear: edu.startYear.toString(),
      endYear: edu.endYear.toString(),
    }));

    try {
      const result = await axios.post(
        url + "/profile/add",
        {
          hardSkills: processedHardSkills,
          softSkills: processedSoftSkills,
          jobs: processedJobs,
          projects: processedProjects,
          careerGoal,
          education: processedEducation,
          location: {
            country: selectedCountry,
            city: selectedCity,
          },
        },
        {
          withCredentials: true,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (result.data.success) {
        setHasProfile(true);
        handleSuccess("Information submitted successfully!");
      } else {
        handleError(result.data.message);
      }
    } catch (error) {
      console.error("Submit error:", error);
      handleError(error.response?.data?.message || "Failed to submit profile");
    }
  };

  const renderHardSkills = () => {
    return hardSkills.map((skill, id) => (
      <div key={`hard-${skill.id}`} className='mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800'>
        <div className='flex justify-between items-center mb-3'>
          <h3 className='text-lg font-medium text-gray-700 dark:text-gray-300'>Skill #{id + 1}</h3>
          {hardSkills.length > 1 && (
            <button
              type='button'
              onClick={() => removeItem("hard", skill.id)}
              className='text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'>
              Remove
            </button>
          )}
        </div>

        <div className='grid grid-cols-1 gap-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label htmlFor={`hard-skill-name-${skill.id}`} className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Skill Name
              </label>
              <input
                type='text'
                id={`hard-skill-name-${skill.id}`}
                value={skill.name}
                onChange={(e) => handleChange("hard", skill.id, "name", e.target.value)}
                onBlur={() => fetchSubskills(skill.name, skill.id)}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                placeholder='e.g. JavaScript, Python, Photoshop'
                required
              />
            </div>

            <div>
              <label htmlFor={`hard-skill-exp-${skill.id}`} className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Experience (years)
              </label>
              <input
                type='number'
                id={`hard-skill-exp-${skill.id}`}
                value={skill.experience}
                onChange={(e) => handleChange("hard", skill.id, "experience", e.target.value)}
                min='0'
                step='0.5'
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                placeholder='e.g. 2.5'
                required
              />
            </div>
          </div>

          {skill.subskills.length > 0 && (
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Select Related Skills</label>
              <div className='flex flex-wrap gap-2'>
                {skill.subskills.map((subskill, index) => (
                  <button
                    key={index}
                    type='button'
                    onClick={() => handleSubskillToggle(skill.id, subskill)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      skill.selectedSubskills.includes(subskill)
                        ? "bg-primary-500 text-white hover:bg-primary-600"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}>
                    {subskill}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    ));
  };

  const renderSoftSkills = () => {
    return softSkills.map((skill, id) => (
      <div key={`soft-${skill.id}`} className='mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800'>
        <div className='flex justify-between items-center mb-3'>
          <h3 className='text-lg font-medium text-gray-700 dark:text-gray-300'>Skill #{id + 1}</h3>
          {softSkills.length > 1 && (
            <button
              type='button'
              onClick={() => removeItem("soft", skill.id)}
              className='text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'>
              Remove
            </button>
          )}
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label htmlFor={`soft-skill-name-${skill.id}`} className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              Skill Name
            </label>
            <input
              type='text'
              id={`soft-skill-name-${skill.id}`}
              value={skill.name}
              onChange={(e) => handleChange("soft", skill.id, "name", e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              placeholder='e.g. Communication, Leadership, Teamwork'
              required
            />
          </div>

          <div>
            <label
              htmlFor={`soft-skill-proficiency-${skill.id}`}
              className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              Proficiency
            </label>
            <select
              id={`soft-skill-proficiency-${skill.id}`}
              value={skill.proficiency}
              onChange={(e) => handleChange("soft", skill.id, "proficiency", e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              required>
              <option value=''>Select proficiency</option>
              <option value='Basic'>Basic</option>
              <option value='Good'>Good</option>
              <option value='Strong'>Strong</option>
              <option value='Excellent'>Excellent</option>
            </select>
          </div>
        </div>
      </div>
    ));
  };

  const renderJobs = () => {
    return jobs.map((job, id) => (
      <div key={`job-${job.id}`} className='mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800'>
        <div className='flex justify-between items-center mb-3'>
          <h3 className='text-lg font-medium text-gray-700 dark:text-gray-300'>Job #{id + 1}</h3>
          {jobs.length > 1 && (
            <button
              type='button'
              onClick={() => removeItem("job", job.id)}
              className='text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'>
              Remove
            </button>
          )}
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
          <div>
            <label htmlFor={`job-title-${job.id}`} className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              Job Title
            </label>
            <input
              type='text'
              id={`job-title-${job.id}`}
              value={job.title}
              onChange={(e) => handleChange("job", job.id, "title", e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              placeholder='e.g. Software Engineer'
              required
            />
          </div>

          <div>
            <label htmlFor={`job-company-${job.id}`} className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              Company
            </label>
            <input
              type='text'
              id={`job-company-${job.id}`}
              value={job.company}
              onChange={(e) => handleChange("job", job.id, "company", e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              placeholder='e.g. Google'
              required
            />
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
          <div>
            <label htmlFor={`job-start-${job.id}`} className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              Start Date
            </label>
            <input
              type='date'
              id={`job-start-${job.id}`}
              value={job.startDate}
              onChange={(e) => handleChange("job", job.id, "startDate", e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              required
            />
          </div>

          <div>
            <label htmlFor={`job-end-${job.id}`} className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              End Date (leave empty if current)
            </label>
            <input
              type='date'
              id={`job-end-${job.id}`}
              value={job.endDate}
              onChange={(e) => handleChange("job", job.id, "endDate", e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
            />
          </div>
        </div>
      </div>
    ));
  };

  const renderEducation = () => {
    return education.map((edu, id) => (
      <div key={`edu-${edu.id}`} className='mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800'>
        <div className='flex justify-between items-center mb-3'>
          <h3 className='text-lg font-medium text-gray-700 dark:text-gray-300'>Education #{id + 1}</h3>
          {education.length > 1 && (
            <button
              type='button'
              onClick={() => removeItem("education", edu.id)}
              className='text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'>
              Remove
            </button>
          )}
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label htmlFor={`edu-degree-${edu.id}`} className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              Degree/Certificate
            </label>
            <input
              type='text'
              id={`edu-degree-${edu.id}`}
              value={edu.degree}
              onChange={(e) => handleChange("education", edu.id, "degree", e.target.value)}
              placeholder='Bachelor of Science'
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              required
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label htmlFor={`edu-start-${edu.id}`} className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Start Year
              </label>
              <input
                type='number'
                id={`edu-start-${edu.id}`}
                value={edu.startYear}
                onChange={(e) => handleChange("education", edu.id, "startYear", e.target.value)}
                placeholder='2018'
                min='1900'
                max={new Date().getFullYear()}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              />
            </div>
            <div>
              <label htmlFor={`edu-end-${edu.id}`} className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                End Year
              </label>
              <input
                type='number'
                id={`edu-end-${edu.id}`}
                value={edu.endYear}
                onChange={(e) => handleChange("education", edu.id, "endYear", e.target.value)}
                placeholder='2022'
                min='1900'
                max={new Date().getFullYear() + 5}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              />
            </div>
          </div>
        </div>
      </div>
    ));
  };

  const renderProjects = () => {
    return projects.map((project, id) => (
      <div
        key={`project-${project.id}`}
        className='mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800'>
        <div className='flex justify-between items-center mb-3'>
          <h3 className='text-lg font-medium text-gray-700 dark:text-gray-300'>Project #{id + 1}</h3>
          {projects.length > 1 && (
            <button
              type='button'
              onClick={() => removeItem("project", project.id)}
              className='text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'>
              Remove
            </button>
          )}
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
          <div>
            <label htmlFor={`project-name-${project.id}`} className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              Project Name
            </label>
            <input
              type='text'
              id={`project-name-${project.id}`}
              value={project.name}
              onChange={(e) => handleChange("project", project.id, "name", e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              placeholder='e.g. E-commerce Website'
              required
            />
          </div>
        </div>
      </div>
    ));
  };
  const renderCareerTab = () => {
    return (
      <>
        <div className='mb-3'>
          <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Where do you see yourself in upcoming years</p>
          <input
            onChange={(e) => setCareerGoal(e.target.value)}
            value={careerGoal}
            placeholder='Career Goal'
            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
            required
          />
        </div>
        <div className='space-y-2 space-x-2'>
          <p className='text-sm text-gray-600 dark:text-gray-400'>Location</p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
            <Select
              onValueChange={(val) => {
                setSelectedCountry(val);
                setSelectedCity("");
              }}>
              <SelectTrigger className='border-primary-200 dark:border-primary-800 bg-white dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300'>
                <SelectValue placeholder='Select Country' />
              </SelectTrigger>
              <SelectContent className='bg-white dark:bg-gray-800 border-primary-200 dark:border-primary-800'>
                {Object.keys(countryCityMap).map((c) => (
                  <SelectItem className='text-gray-700 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-slate-600' key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* City Dropdown */}
            <Select onValueChange={(val) => setSelectedCity(val)} disabled={!selectedCountry} value={selectedCity || undefined}>
              <SelectTrigger className='border-primary-200 dark:border-primary-800 bg-white dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300'>
                <SelectValue placeholder={selectedCountry ? "Select City" : "Select country first"} />
              </SelectTrigger>
              <SelectContent className='bg-white dark:bg-gray-800 border-primary-200 dark:border-primary-800'>
                {selectedCountry &&
                  countryCityMap[selectedCountry].map((city) => (
                    <SelectItem
                      className='text-gray-700 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                      key={city}
                      value={city}>
                      {city}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className='max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg'>
      <h2 className='text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6'>Professional Profile</h2>

      {/* Tabs */}
      <div className='flex flex-wrap border-b border-gray-200 dark:border-gray-700 mb-6'>
        <button
          className={`py-2 px-4 font-medium text-sm focus:outline-none ${
            activeTab === "hard"
              ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("hard")}>
          Hard Skills
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm focus:outline-none ${
            activeTab === "soft"
              ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("soft")}>
          Soft Skills
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm focus:outline-none ${
            activeTab === "job"
              ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("job")}>
          Experience
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm focus:outline-none ${
            activeTab === "project"
              ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("project")}>
          Projects
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm focus:outline-none ${
            activeTab === "education"
              ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("education")}>
          Education
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm focus:outline-none ${
            activeTab === "career"
              ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("career")}>
          Career
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Hard Skills Tab Content */}
        <div className={activeTab === "hard" ? "block" : "hidden"}>
          <div className='mb-4'>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Add your technical skills like programming languages, tools, or software.
            </p>
          </div>
          {renderHardSkills()}
          <button
            type='button'
            onClick={() => addSkill("hard")}
            className='flex items-center px-4 py-2 bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-md hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors mt-2'>
            <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 mr-1' viewBox='0 0 20 20' fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z'
                clipRule='evenodd'
              />
            </svg>
            Add Another Hard Skill
          </button>
        </div>

        {/* Soft Skills Tab Content */}
        <div className={activeTab === "soft" ? "block" : "hidden"}>
          <div className='mb-4'>
            <p className='text-sm text-gray-600 dark:text-gray-400'>Add your interpersonal and communication skills.</p>
          </div>
          {renderSoftSkills()}
          <button
            type='button'
            onClick={() => addSkill("soft")}
            className='flex items-center px-4 py-2 bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-md hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors mt-2'>
            <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 mr-1' viewBox='0 0 20 20' fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z'
                clipRule='evenodd'
              />
            </svg>
            Add Another Soft Skill
          </button>
        </div>

        {/* Job Experience Tab Content */}
        <div className={activeTab === "job" ? "block" : "hidden"}>
          <div className='mb-4'>
            <p className='text-sm text-gray-600 dark:text-gray-400'>Add your work experience and employment history.</p>
          </div>
          {renderJobs()}
          <button
            type='button'
            onClick={() => addSkill("job")}
            className='flex items-center px-4 py-2 bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-md hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors mt-2'>
            <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 mr-1' viewBox='0 0 20 20' fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z'
                clipRule='evenodd'
              />
            </svg>
            Add Another Job
          </button>
        </div>

        {/* Projects Tab Content */}
        <div className={activeTab === "project" ? "block" : "hidden"}>
          <div className='mb-4'>
            <p className='text-sm text-gray-600 dark:text-gray-400'>Add notable projects you've worked on.</p>
          </div>
          {renderProjects()}
          <button
            type='button'
            onClick={() => addSkill("project")}
            className='flex items-center px-4 py-2 bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-md hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors mt-2'>
            <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 mr-1' viewBox='0 0 20 20' fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z'
                clipRule='evenodd'
              />
            </svg>
            Add Another Project
          </button>
        </div>
        {/* education tab */}
        <div className={activeTab === "education" ? "block" : "hidden"}>
          <div className='mb-4'>
            <p className='text-sm text-gray-600 dark:text-gray-400'>Add your educational background.</p>
          </div>
          {renderEducation()}
          <button
            type='button'
            onClick={() => addSkill("education")}
            className='flex items-center px-4 py-2 bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-md hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors mt-2'>
            <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 mr-1' viewBox='0 0 20 20' fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z'
                clipRule='evenodd'
              />
            </svg>
            Add Another Education
          </button>
        </div>

        {/* Career Goal Tab Content */}
        <div className={activeTab === "career" ? "block" : "hidden"}>{renderCareerTab()}</div>

        <div className='mt-8'>
          <button
            type='submit'
            className='w-full px-6 py-3 bg-primary-600 dark:bg-primary-700 dark:text-black text-white rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors font-medium'>
            Submit Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
