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
  const [suggestedChanges, setSuggestedChanges] = useState(["change1", "change2", "change3"]);
  const [hasProfile, setHasProfile] = useState(false);
  const [profile, setProfile] = useState({});
  const [evaluated, setEvaluated] = useState(false);
  const [isPathSelected, setIsPathSelected] = useState(false);
  const [careerPath, setCareerPath] = useState("");
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
        setContextLoading(false);
      }
    };
    checkProfile();
  }, [user]);
  const updateRoadmap = async () => {
    try {
      console.log("Updating Roadmap...");
      handleSuccess("Updating Roadmap...");
      const response = await axios.post(url + "/roadmap/update");
      if (response.data.success) {
        setRoadmap(response.data.data.tasks);
        handleSuccess("Roadmap updated successfully");
      }
    } catch (error) {
      console.error("Failed to update Roadmap:", error.message);
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
  useEffect(() => {
    console.log(roadmap);
    localStorage.setItem("roadmap", JSON.stringify(roadmap));
  }, [roadmap]);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    let attempts = 0;
    const maxAttempts = 20; // ~10 minutes max

    const interval = setInterval(async () => {
      if (!isMounted || attempts >= maxAttempts) {
        clearInterval(interval);
        return;
      }

      // ❗ check the current roadmap only once per poll
      if (!roadmapHasSubtasksWithoutSources(roadmap)) {
        clearInterval(interval);
        return;
      }

      try {
        const response = await axios.get(`${url}/roadmap/get`);
        if (!isMounted) return;

        if (response.data.success) {
          const updatedRoadmap = response.data.data.tasks;
          setRoadmap(updatedRoadmap);
          attempts++;
        }
      } catch (err) {
        console.error("Roadmap update failed:", err);
        attempts++;
      }
    }, 60000); // every 60 seconds

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]); // 👈 no roadmap here!!!

  function roadmapHasSubtasksWithoutSources(roadmap) {
    return roadmap.some((task) => task.subtasks.some((subtask) => !subtask.sources || subtask.sources.length === 0));
  }
  return (
    <SkillsContext.Provider
      value={{
        contextLoading,
        roadmap,
        setRoadmap,
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
      }}>
      {children}
    </SkillsContext.Provider>
  );
};
export default SkillsProvider;
