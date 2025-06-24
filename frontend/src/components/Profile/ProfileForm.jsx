import React, { useContext, useEffect, useState } from "react";
import { handleError, handleSuccess } from "../../utils";
import axios from "axios";
axios.defaults.withCredentials = true;
axios.defaults.headers.common["Accept"] = "application/json";
import { countryCityMap } from "./CountryCityData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SkillsContext } from "../../Context/SkillsContext";
import { useNavigate } from "react-router-dom";

const ProfileForm = ({ isEdit }) => {
  const url = import.meta.env.VITE_API_URL;
  const { hasProfile, setHasProfile, profile, setProfile } = useContext(SkillsContext);
  const navigate = useNavigate();
  useEffect(() => {
    if (isEdit && !hasProfile) {
      navigate("/profile/add");
    }
  }, []);
  useEffect(() => {
    if (isEdit) document.title = "Edit Profile | Employify";
    else document.title = "Add Profile | Employify";
  }, []);
  // State declarations
  const [loading, setLoading] = useState(false);
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
      description: "", // Added description field
    },
  ]);
  const [education, setEducation] = useState([
    {
      id: Math.random(),
      degree: "",
      institute: "", // Added institute field
      startYear: "",
      endYear: "",
    },
  ]);
  const [careerGoal, setCareerGoal] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [phone, setPhone] = useState("");
  const [profileJustCreated, setProfileJustCreated] = useState(false);

  useEffect(() => {
    if (profileJustCreated) {
      navigate("/roadmap");
    }
  }, [profileJustCreated, navigate]);

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

  useEffect(() => {
    const fetchProfileData = async () => {
      if (isEdit) {
        try {
          const p = profile;
          console.log("Existing profile data loaded:", p);
          setHardSkills(
            p.hardSkills?.map((s) => ({
              ...s,
              id: Math.random(),
              subskills: s.subskills || [],
              selectedSubskills: s.subskills || [],
            })) || []
          );
          setSoftSkills(p.softSkills?.map((s) => ({ ...s, id: Math.random() })) || []);
          setJobs(p.jobs?.map((j) => ({ ...j, id: Math.random() })) || []);
          setProjects(p.projects?.map((pr) => ({ ...pr, id: Math.random(), description: pr.description || "" })) || []);
          setEducation(p.education?.map((e) => ({ ...e, id: Math.random(), institute: e.institute || "" })) || []);
          setCareerGoal(p.careerGoal || "");
          setSelectedCountry(p.location?.country || "");
          setSelectedCity(p.location?.city || "");
          setLinkedin(p.linkedin || "");
          setGithub(p.github || "");
          setPhone(p.phone || "");
        } catch (error) {
          console.error("Failed to fetch profile data:", error);
          handleError("Failed to load profile data. Please refresh the page.");
        }
      }
    };
    fetchProfileData();
  }, [isEdit, url, profile]);

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
        description: "",
      };
      setProjects([...projects, newProject]);
    } else if (type === "education") {
      const newEducation = {
        id: Math.random(),
        degree: "",
        institute: "",
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

    const processedHardSkills = hardSkills.map((skill) => ({
      name: skill.name,
      experience: skill.experience.toString(),
      subskills: skill.selectedSubskills || [],
    }));

    const processedSoftSkills = softSkills.map((skill) => ({
      name: skill.name,
      proficiency: skill.proficiency,
    }));

    const processedJobs = jobs.map((job) => ({
      title: job.title,
      company: job.company,
      startDate: job.startDate,
      endDate: job.endDate,
    }));

    const processedProjects = projects.map((project) => ({
      name: project.name,
      description: project.description,
    }));

    let payload = {
      hardSkills: processedHardSkills,
      softSkills: processedSoftSkills,
      jobs: processedJobs,
      projects: processedProjects,
      careerGoal,
      location: {
        country: selectedCountry,
        city: selectedCity,
      },
    };

    if (isEdit && education.length > 0) {
      payload.education = education.map((edu) => ({
        degree: edu.degree,
        institute: edu.institute,
        startYear: edu.startYear.toString(),
        endYear: edu.endYear.toString(),
      }));
    }

    if (isEdit) {
      payload.linkedin = linkedin;
      payload.github = github;
      payload.phone = phone;
    }
    setLoading(true);
    try {
      const result = await axios.post(url + "/profile/add", payload, {
        withCredentials: true,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (result.data.success) {
        setProfile(payload);
        setHasProfile(true);
        handleSuccess(result.data.message);
        if (!isEdit) setProfileJustCreated(true);
      } else {
        handleError(result.data.message);
      }
    } catch (error) {
      console.error("Submit error:", error);
      handleError(error.response?.data?.message || "Failed to submit profile");
    }
    setLoading(false);
  };

  const renderHardSkills = () => {
    return hardSkills.map((skill, idx) => (
      <div
        key={`hard-${skill.id}`}
        className='mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 shadow-sm'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200'>Technical Skill #{idx + 1}</h3>
          {hardSkills.length > 1 && (
            <button
              type='button'
              onClick={() => removeItem("hard", skill.id)}
              className='text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors'>
              Remove Skill
            </button>
          )}
        </div>

        <div className='grid grid-cols-1 gap-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label htmlFor={`hard-skill-name-${skill.id}`} className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Skill Name *
              </label>
              <input
                type='text'
                id={`hard-skill-name-${skill.id}`}
                value={skill.name}
                onChange={(e) => handleChange("hard", skill.id, "name", e.target.value)}
                onBlur={() => fetchSubskills(skill.name, skill.id)}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors'
                placeholder='e.g. JavaScript, Python, Photoshop'
                required
              />
            </div>

            <div>
              <label htmlFor={`hard-skill-exp-${skill.id}`} className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Experience (years) *
              </label>
              <input
                type='number'
                id={`hard-skill-exp-${skill.id}`}
                value={skill.experience}
                onChange={(e) => handleChange("hard", skill.id, "experience", e.target.value)}
                min='0'
                max='50'
                step='0.5'
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors'
                placeholder='e.g. 2.5'
                required
              />
            </div>
          </div>

          {skill.subskills.length > 0 && (
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Related Subskills (Select all that apply)
              </label>
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
    return softSkills.map((skill, idx) => (
      <div
        key={`soft-${skill.id}`}
        className='mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 shadow-sm'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200'>Soft Skill #{idx + 1}</h3>
          {softSkills.length > 1 && (
            <button
              type='button'
              onClick={() => removeItem("soft", skill.id)}
              className='text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors'>
              Remove Skill
            </button>
          )}
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label htmlFor={`soft-skill-name-${skill.id}`} className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              Skill Name *
            </label>
            <input
              type='text'
              id={`soft-skill-name-${skill.id}`}
              value={skill.name}
              onChange={(e) => handleChange("soft", skill.id, "name", e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors'
              placeholder='e.g. Communication, Leadership, Teamwork'
              required
            />
          </div>

          <div>
            <label
              htmlFor={`soft-skill-proficiency-${skill.id}`}
              className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              Proficiency Level *
            </label>
            <select
              id={`soft-skill-proficiency-${skill.id}`}
              value={skill.proficiency}
              onChange={(e) => handleChange("soft", skill.id, "proficiency", e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors'
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
    return jobs.map((job, idx) => (
      <div
        key={`job-${job.id}`}
        className='mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 shadow-sm'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200'>Work Experience #{idx + 1}</h3>
          {jobs.length > 1 && (
            <button
              type='button'
              onClick={() => removeItem("job", job.id)}
              className='text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors'>
              Remove Experience
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
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors'
              placeholder='e.g. Software Engineer'
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
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors'
              placeholder='e.g. Google'
            />
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label htmlFor={`job-start-${job.id}`} className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              Start Date
            </label>
            <input
              type='date'
              id={`job-start-${job.id}`}
              value={job.startDate}
              onChange={(e) => handleChange("job", job.id, "startDate", e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors'
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
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors'
            />
          </div>
        </div>
      </div>
    ));
  };

  const renderProjects = () => {
    return projects.map((project, idx) => (
      <div
        key={`project-${project.id}`}
        className='mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 shadow-sm'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200'>Project #{idx + 1}</h3>
          {projects.length > 1 && (
            <button
              type='button'
              onClick={() => removeItem("project", project.id)}
              className='text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors'>
              Remove Project
            </button>
          )}
        </div>

        <div className='grid grid-cols-1 gap-4'>
          <div>
            <label htmlFor={`project-name-${project.id}`} className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              Project Name *
            </label>
            <input
              type='text'
              id={`project-name-${project.id}`}
              value={project.name}
              onChange={(e) => handleChange("project", project.id, "name", e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors'
              placeholder='e.g. E-commerce Website'
              required
            />
          </div>

          <div>
            <label htmlFor={`project-desc-${project.id}`} className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              Description (Optional)
            </label>
            <textarea
              id={`project-desc-${project.id}`}
              value={project.description}
              onChange={(e) => handleChange("project", project.id, "description", e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors min-h-[100px]'
              placeholder='Brief description of the project...'
            />
          </div>
        </div>
      </div>
    ));
  };

  const renderEducation = () => {
    return education.map((edu, idx) => (
      <div
        key={`edu-${edu.id}`}
        className='mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 shadow-sm'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200'>Education #{idx + 1}</h3>
          {education.length > 1 && (
            <button
              type='button'
              onClick={() => removeItem("education", edu.id)}
              className='text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors'>
              Remove Education
            </button>
          )}
        </div>

        <div className='grid grid-cols-1 gap-4 mb-4'>
          <div>
            <label htmlFor={`edu-degree-${edu.id}`} className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              Degree/Certificate *
            </label>
            <input
              type='text'
              id={`edu-degree-${edu.id}`}
              value={edu.degree}
              onChange={(e) => handleChange("education", edu.id, "degree", e.target.value)}
              placeholder='e.g. Bachelor of Science in Computer Science'
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors'
              required
            />
          </div>

          <div>
            <label htmlFor={`edu-institute-${edu.id}`} className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              Institute/University *
            </label>
            <input
              type='text'
              id={`edu-institute-${edu.id}`}
              value={edu.institute}
              onChange={(e) => handleChange("education", edu.id, "institute", e.target.value)}
              placeholder='e.g. Massachusetts Institute of Technology'
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors'
              required
            />
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label htmlFor={`edu-start-${edu.id}`} className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              Start Year *
            </label>
            <input
              type='number'
              id={`edu-start-${edu.id}`}
              value={edu.startYear}
              onChange={(e) => handleChange("education", edu.id, "startYear", e.target.value)}
              placeholder='2018'
              min='1900'
              max={new Date().getFullYear()}
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors'
              required
            />
          </div>
          <div>
            <label htmlFor={`edu-end-${edu.id}`} className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              End Year (or expected) *
            </label>
            <input
              type='number'
              id={`edu-end-${edu.id}`}
              value={edu.endYear}
              onChange={(e) => handleChange("education", edu.id, "endYear", e.target.value)}
              placeholder='2022'
              min='1900'
              max={new Date().getFullYear() + 5}
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors'
              required
            />
          </div>
        </div>
      </div>
    ));
  };

  const renderCareerTab = () => {
    return (
      <div className='space-y-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
            Career Goal *<span className='ml-1 text-xs text-gray-500 dark:text-gray-400'>Where do you see yourself in upcoming years</span>
          </label>
          <textarea
            onChange={(e) => setCareerGoal(e.target.value)}
            value={careerGoal}
            placeholder='Describe your career aspirations and goals...'
            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors min-h-[120px]'
            required
          />
        </div>

        <div>
          <h3 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>Location Information</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Country *</label>
              <Select
                onValueChange={(val) => {
                  setSelectedCountry(val);
                  setSelectedCity("");
                }}>
                <SelectTrigger className='w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:border-primary-500 focus:ring-primary-500'>
                  <SelectValue placeholder='Select Country' />
                </SelectTrigger>
                <SelectContent className='bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'>
                  {Object.keys(countryCityMap).map((c) => (
                    <SelectItem key={c} value={c} className='hover:bg-gray-100 dark:hover:bg-gray-700'>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>City *</label>
              <Select onValueChange={(val) => setSelectedCity(val)} disabled={!selectedCountry} value={selectedCity || undefined}>
                <SelectTrigger className='w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:border-primary-500 focus:ring-primary-500'>
                  <SelectValue placeholder={selectedCountry ? "Select City" : "Select country first"} />
                </SelectTrigger>
                <SelectContent className='bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'>
                  {selectedCountry &&
                    countryCityMap[selectedCountry].map((city) => (
                      <SelectItem key={city} value={city} className='hover:bg-gray-100 dark:hover:bg-gray-700'>
                        {city}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {isEdit && (
          <div className='space-y-4'>
            <h3 className='text-sm font-medium text-gray-700 dark:text-gray-300'>Contact Information (Optional)</h3>

            <div>
              <label htmlFor='linkedin-url' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                LinkedIn URL
              </label>
              <input
                type='url'
                id='linkedin-url'
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors'
                placeholder='https://linkedin.com/in/yourprofile'
              />
            </div>

            <div>
              <label htmlFor='github-url' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                GitHub URL
              </label>
              <input
                type='url'
                id='github-url'
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors'
                placeholder='https://github.com/yourusername'
              />
            </div>

            <div>
              <label htmlFor='phone-number' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Phone Number
              </label>
              <input
                type='tel'
                id='phone-number'
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors'
                placeholder='+1 (123) 456-7890'
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg'>
      <h2 className='text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6'>
        {isEdit ? "Edit Your Profile" : "Create Your Professional Profile"}
      </h2>

      {/* Tabs */}
      <div className='flex flex-wrap border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto'>
        <button
          className={`py-2 px-4 font-medium text-sm focus:outline-none whitespace-nowrap transition-colors ${
            activeTab === "hard"
              ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("hard")}>
          Hard Skills
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm focus:outline-none whitespace-nowrap transition-colors ${
            activeTab === "soft"
              ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("soft")}>
          Soft Skills
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm focus:outline-none whitespace-nowrap transition-colors ${
            activeTab === "job"
              ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("job")}>
          Experience
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm focus:outline-none whitespace-nowrap transition-colors ${
            activeTab === "project"
              ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("project")}>
          Projects
        </button>
        {isEdit && (
          <button
            className={`py-2 px-4 font-medium text-sm focus:outline-none whitespace-nowrap transition-colors ${
              activeTab === "education"
                ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("education")}>
            Education
          </button>
        )}
        <button
          className={`py-2 px-4 font-medium text-sm focus:outline-none whitespace-nowrap transition-colors ${
            activeTab === "career"
              ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("career")}>
          Career & Location
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Tab Contents */}
        <div className={activeTab === "hard" ? "block" : "hidden"}>
          <div className='mb-6'>
            <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2'>Technical Skills</h3>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Add your technical skills like programming languages, tools, or frameworks. Include your experience level and any related
              subskills.
            </p>
          </div>
          {renderHardSkills()}
          <button
            type='button'
            onClick={() => addSkill("hard")}
            className='flex items-center justify-center px-4 py-2 bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-md hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors mt-4 w-full sm:w-auto'>
            <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 mr-2' viewBox='0 0 20 20' fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z'
                clipRule='evenodd'
              />
            </svg>
            Add Another Hard Skill
          </button>
        </div>

        <div className={activeTab === "soft" ? "block" : "hidden"}>
          <div className='mb-6'>
            <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2'>Soft Skills</h3>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Add your interpersonal and communication skills that demonstrate your ability to work with others.
            </p>
          </div>
          {renderSoftSkills()}
          <button
            type='button'
            onClick={() => addSkill("soft")}
            className='flex items-center justify-center px-4 py-2 bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-md hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors mt-4 w-full sm:w-auto'>
            <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 mr-2' viewBox='0 0 20 20' fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z'
                clipRule='evenodd'
              />
            </svg>
            Add Another Soft Skill
          </button>
        </div>

        <div className={activeTab === "job" ? "block" : "hidden"}>
          <div className='mb-6'>
            <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2'>Work Experience</h3>
            <p className='text-sm text-gray-600 dark:text-gray-400'>Add your professional work history to showcase your career journey.</p>
          </div>
          {jobs.length > 0 ? (
            <>
              {renderJobs()}
              <div className='flex flex-col sm:flex-row gap-2 mt-4'>
                <button
                  type='button'
                  onClick={() => addSkill("job")}
                  className='flex items-center justify-center px-4 py-2 bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-md hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors'>
                  <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 mr-2' viewBox='0 0 20 20' fill='currentColor'>
                    <path
                      fillRule='evenodd'
                      d='M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z'
                      clipRule='evenodd'
                    />
                  </svg>
                  Add Another Job
                </button>
                <button
                  type='button'
                  onClick={() => setJobs([])}
                  className='px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'>
                  I have no work experience
                </button>
              </div>
            </>
          ) : (
            <div className='text-center py-6'>
              <p className='text-gray-500 dark:text-gray-400 mb-4'>No work experience added</p>
              <button
                type='button'
                onClick={() => addSkill("job")}
                className='flex items-center justify-center mx-auto px-4 py-2 bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-md hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors'>
                <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 mr-2' viewBox='0 0 20 20' fill='currentColor'>
                  <path
                    fillRule='evenodd'
                    d='M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z'
                    clipRule='evenodd'
                  />
                </svg>
                Add Work Experience
              </button>
            </div>
          )}
        </div>

        <div className={activeTab === "project" ? "block" : "hidden"}>
          <div className='mb-6'>
            <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2'>Projects</h3>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Showcase your notable projects, including personal, academic, or professional work.
            </p>
          </div>
          {renderProjects()}
          <button
            type='button'
            onClick={() => addSkill("project")}
            className='flex items-center justify-center px-4 py-2 bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-md hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors mt-4 w-full sm:w-auto'>
            <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 mr-2' viewBox='0 0 20 20' fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z'
                clipRule='evenodd'
              />
            </svg>
            Add Another Project
          </button>
        </div>

        <div className={activeTab === "education" && isEdit ? "block" : "hidden"}>
          <div className='mb-6'>
            <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2'>Education</h3>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Add your academic background including degrees, certifications, and training programs.
            </p>
          </div>
          {renderEducation()}
          <button
            type='button'
            onClick={() => addSkill("education")}
            className='flex items-center justify-center px-4 py-2 bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-md hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors mt-4 w-full sm:w-auto'>
            <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 mr-2' viewBox='0 0 20 20' fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z'
                clipRule='evenodd'
              />
            </svg>
            Add Another Education
          </button>
        </div>

        <div className={activeTab === "career" ? "block" : "hidden"}>
          <div className='mb-6'>
            <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2'>Career Goals & Location</h3>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Share your career aspirations and location information to help personalize your experience.
            </p>
          </div>
          {renderCareerTab()}
        </div>

        <div className='mt-8 pt-6 border-t border-gray-200 dark:border-gray-700'>
          <button
            disabled={loading}
            type='submit'
            className={`w-full px-6 py-3 bg-primary-600 dark:bg-primary-400 text-white rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors font-medium shadow-md disabled:opacity-55`}>
            {isEdit ? "Update Profile" : "Submit Profile"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
