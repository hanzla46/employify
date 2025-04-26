import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { handleError, handleSuccess } from "../utils";
import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
axios.defaults.withCredentials = true; // Force cookies to be sent
axios.defaults.headers.common["Accept"] = "application/json";
export const SkillsContext = createContext();
export const SkillsProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [roadmap, setRoadmap] = useState([]);
  const [hasProfile, setHasProfile] = useState(false);
  const [evaluated, setEvaluated] = useState(false);
  const url = import.meta.env.VITE_API_URL;
  console.log(url);
  useEffect(() => {
    const checkProfile = async () => {
      try {
        if (!user) {
          setHasProfile(false);
          setRoadmap([]);
          setEvaluated(false);
          return;
        }
        const profileResponse = await axios.get(url + "/profile/check");
        if (profileResponse.data.profile) {
          setHasProfile(true);          
          console.log("profile found");
          if (profileResponse.data.isEvaluated) {
            const getRoadmap = await axios.get(url + "/roadmap/get");
            if (getRoadmap.data.success) {
              console.log("Roadmap found:", getRoadmap.data.data);
              setEvaluated(true);
              setRoadmap(getRoadmap.data.data.tasks);
              console.log("Roadmap:", roadmap);
            } else {
              console.log("No roadmap found");
              setRoadmap([]);
            }           
          }
          setEvaluated(profileResponse.data.isEvaluated);
        } else {
          setHasProfile(false);
          console.log("profile not found");
        }
      } catch (error) {
        console.error("Failed to check Profile:", error.message);
      }
    };
    checkProfile();
  }, [user]);
  useEffect(() => {
    console.log(roadmap);
    localStorage.setItem("roadmap", JSON.stringify(roadmap));
  }, [roadmap]);

  return (
    <SkillsContext.Provider
      value={{
        roadmap,
        setRoadmap,
        evaluated,
        setEvaluated,
        hasProfile,
        setHasProfile,
      }}
    >
      {children}
    </SkillsContext.Provider>
  );
};
export default SkillsProvider;
