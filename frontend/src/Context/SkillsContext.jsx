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
  const [contextLoading, setContextLoading] = useState(true);
  const [roadmap, setRoadmap] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [suggestedChanges, setSuggestedChanges] = useState(["change1", "change2", "change3"]);
  const [hasProfile, setHasProfile] = useState(false);
  const [profile, setProfile] = useState({});
  const [evaluated, setEvaluated] = useState(false);
  const [isPathSelected, setIsPathSelected] = useState(false);
  const [careerPath, setCareerPath] = useState("");
  const [updationLoading, setUpdationLoading] = useState(false);
  const url = import.meta.env.VITE_API_URL;
  console.log(url);
  useEffect(() => {
    const checkProfile = async () => {
      try {
        if (!user) {
          setHasProfile(false);
          setRoadmap([]);
          setEvaluated(false);
          setCareerPath("");
          setIsPathSelected(false);
          return;
        }
        const profileResponse = await axios.get(url + "/profile/check");
        if (profileResponse.data.profile) {
          setHasProfile(true);
          setProfile(profileResponse.data.profileData);
          console.log("profile found");
          setEvaluated(profileResponse.data.isEvaluated);
          setCareerPath(profileResponse.data.careerPath);
          const getRoadmap = await axios.get(url + "/roadmap/get");
          if (getRoadmap.data.success) {
            console.log("Roadmap found:", getRoadmap.data.data);
            setEvaluated(true);
            await setRoadmap(getRoadmap.data.data.tasks);
            setMissingSkills(getRoadmap.data.data.missingSkills);
            setSuggestedChanges(getRoadmap.data.data.changes);
            setIsPathSelected(true);
            console.log("Roadmap:", roadmap);
          } else {
            console.log("No roadmap found");
            setRoadmap([]);
          }
        } else {
          setHasProfile(false);
          console.log("profile not found");
        }
      } catch (error) {
        console.error("Failed to check Profile:", error.message);
      } finally {
        //wait for 1 second to ensure the context is fully loaded
        setTimeout(() => {
          setContextLoading(false);
        }, 1000);
      }
    };
    checkProfile();
  }, [user]);
  const updateRoadmap = async () => {
    try {
      setUpdationLoading(true);
      handleSuccess("Updating Roadmap...");
      const response = await axios.post(url + "/roadmap/update");
      if (response.data.success) {
        setRoadmap(response.data.data.tasks);
        setMissingSkills([]);
        handleSuccess("Roadmap updated successfully");
      }
    } catch (error) {
      console.error("Failed to update Roadmap:", error.message);
      handleError("Failed to update Roadmap: " + error.message);
    } finally {
      setUpdationLoading(false);
    }
  };
  const fetchUpdatedRoadmap = async () => {
    try {
      const response = await axios.get(url + "/roadmap/get");
      if (response.data.success) {
        setRoadmap(response.data.data.tasks);
        setMissingSkills(response.data.data.missingSkills);
        setSuggestedChanges(response.data.data.changes);
        handleSuccess("Roadmap fetched successfully");
      } else {
        handleError("No roadmap found");
        setRoadmap([]);
      }
    } catch (error) {
      console.error("Failed to fetch Roadmap:", error.message);
      handleError("Failed to fetch Roadmap: " + error.message);
    }
  };
  const fetchUpdatedProfile = async () => {
    try {
      const response = await axios.get(url + "/profile/check");
      if (response.data.profile) {
        setProfile(response.data.profileData);
        handleSuccess("Profile updated successfully");
      }
    } catch (error) {
      console.error("Failed to fetch updated Profile:", error.message);
    }
  };

  return (
    <SkillsContext.Provider
      value={{
        contextLoading,
        roadmap,
        setRoadmap,
        missingSkills,
        setMissingSkills,
        updateRoadmap,
        evaluated,
        setEvaluated,
        hasProfile,
        setHasProfile,
        profile,
        setProfile,
        setIsPathSelected,
        isPathSelected,
        careerPath,
        setCareerPath,
        suggestedChanges,
        setSuggestedChanges,
        fetchUpdatedProfile,
        fetchUpdatedRoadmap,
        updationLoading,
      }}>
      {children}
    </SkillsContext.Provider>
  );
};
export default SkillsProvider;
