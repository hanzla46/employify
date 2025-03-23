import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { handleError, handleSuccess } from "../utils";
axios.defaults.withCredentials = true; // Force cookies to be sent
axios.defaults.headers.common["Accept"] = "application/json";
export const SkillsContext = createContext();
export const SkillsProvider = ({ children }) => {
  const [roadmap, setRoadmap] = useState([]);
  const [profile, setProfile] = useState([]);
  const [hasProfile, setHasProfile] = useState(false);
  const url = import.meta.env.VITE_API_URL;
  console.log(url);
  useEffect(() => {
    const checkProfile = async () => {
      try {
        const response = await axios.get(url + "/profile/check");
        if (response.data.success)  setHasProfile(true);
      } catch (error) {
        console.error("Failed to fetch skills:", error.message);
        handleError(error.message);
      }
    };
    // fetchSkills();
  }, []);
  // const addSkill = async (skill) => {
  //   try {
  //     const response = await axios.post(url + "/skills", skill);
  //     setProfile([...profile, response.data.data]);
  //     handleSuccess(response.data.message);
  //   } catch (error) {
  //     console.error("Failed to add skill:", error.message);
  //     handleError(error.message);
  //   }
  // };
  // const updateSkill = async (id, skill) => {
  //   try {
  //     const response = await axios.put(url + "/skills/" + id, skill);
  //     const updatedProfile = profile.map((s) =>
  //       s.id === id ? response.data.data : s
  //     );
  //     setProfile(updatedProfile);
  //     handleSuccess(response.data.message);
  //   } catch (error) {
  //     console.error("Failed to update skill:", error.message);
  //     handleError(error.message);
  //   }
  // };
  // const deleteSkill = async (id) => {
  //   try {
  //     const response = await axios.delete(url + "/skills/" + id);
  //     const updatedProfile = profile.filter((s) => s.id !== id);
  //     setProfile(updatedProfile);
  //     handleSuccess(response.data.message);
  //   } catch (error) {
  //     console.error("Failed to delete skill:", error.message);
  //     handleError(error.message);
  //   }
  // };
  return (
    <SkillsContext.Provider
    value={{ roadmap,setRoadmap, hasProfile, setHasProfile, profile, setProfile }}
  >
    {children}
  </SkillsContext.Provider>  
  );
};
export default SkillsProvider;
