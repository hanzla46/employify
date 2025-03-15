import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { handleError, handleSuccess } from "../utils";
axios.defaults.withCredentials = true; // Force cookies to be sent
axios.defaults.headers.common["Accept"] = "application/json";
export const SkillsContext = createContext();
export const SkillsProvider = ({ children }) => {
  const [skills, setSkills] = useState([]);
  const [hasUploadedSkills, setHasUploadedSkills] = useState(false);
  const [loading, setLoading] = useState(true);
  const url = import.meta.env.VITE_API_URL;
  console.log(url);
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await axios.get(url + "/skills");
        setSkills(response.data.data);
      } catch (error) {
        console.error("Failed to fetch skills:", error.message);
        handleError(error.message);
      } finally {
        setLoading(false);
      }
    };
    // fetchSkills();
  }, []);
  const addSkill = async (skill) => {
    try {
      const response = await axios.post(url + "/skills", skill);
      setSkills([...skills, response.data.data]);
      handleSuccess(response.data.message);
    } catch (error) {
      console.error("Failed to add skill:", error.message);
      handleError(error.message);
    }
  };
  const updateSkill = async (id, skill) => {
    try {
      const response = await axios.put(url + "/skills/" + id, skill);
      const updatedSkills = skills.map((s) =>
        s.id === id ? response.data.data : s
      );
      setSkills(updatedSkills);
      handleSuccess(response.data.message);
    } catch (error) {
      console.error("Failed to update skill:", error.message);
      handleError(error.message);
    }
  };
  const deleteSkill = async (id) => {
    try {
      const response = await axios.delete(url + "/skills/" + id);
      const updatedSkills = skills.filter((s) => s.id !== id);
      setSkills(updatedSkills);
      handleSuccess(response.data.message);
    } catch (error) {
      console.error("Failed to delete skill:", error.message);
      handleError(error.message);
    }
  };
  return (
    <SkillsContext.Provider
    value={{ skills, addSkill, updateSkill, deleteSkill, loading, hasUploadedSkills, setHasUploadedSkills }}
  >
    {children}
  </SkillsContext.Provider>  
  );
};
export default SkillsProvider;
