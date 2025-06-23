import React, { createContext, useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import { SkillsContext } from "./SkillsContext";
const url = import.meta.env.VITE_API_URL;

export const JobsContext = createContext();

export const JobsProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState(jobs);
  const [contextLoading, setContextLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const { profile, contextLoading: skillsContextLoading } = useContext(SkillsContext);
  useEffect(() => {
    if (!user) return;
    async function fetchJobs() {
      if (skillsContextLoading) return;
      try {
        setContextLoading(true);
        const response = await axios.get(url + "/jobs/getJobs", {
          withCredentials: true,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
        const data = response.data;
        setJobs(data.jobs);
        setFilteredJobs(data.jobs);
        console.log(jobs);
      } catch (err) {
        console.error("Failed to fetch jobs 😵", err);
      }
      setContextLoading(false);
    }
    fetchJobs();
  }, [user, profile, skillsContextLoading]);
  return (
    <JobsContext.Provider value={{ contextLoading, jobs, setJobs, savedJobs, setSavedJobs, filteredJobs, setFilteredJobs }}>
      {children}
    </JobsContext.Provider>
  );
};
