import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
axios.defaults.withCredentials = true;
axios.defaults.headers.common["Accept"] = "application/json";
export const DashboardContext = createContext();
export const DashboardProvider = ({ children }) => {
  const url = import.meta.env.VITE_API_URL;
  const { user } = useContext(AuthContext);
  const [interviewScores, setInterviewScores] = useState([]);
  const [weaknesses, setWeaknesses] = useState([]);
  const [suggestedInterview, setSuggestedInterview] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        // Fetch interviews
        const interviewsRes = await axios.get(`${url}/interview/get-all-interviews`);
        const scores = interviewsRes.data.interviews?.map((i) => Number(i.overallScore)).filter((score) => !isNaN(score)) || [];
        setInterviewScores(scores);
        setWeaknesses(
          interviewsRes.data.interviews?.map((i) => {
            if (!i?.weaknesses) return "";
            return i.weaknesses;
          })
        );

        // Fetch suggested interview
        const suggestionRes = await axios.get(`${url}/interview/suggested-interview`);
        if (suggestionRes.data.success) {
          setSuggestedInterview({
            id: suggestionRes.data.interviewId,
            title: suggestionRes.data.title,
          });
        }
      } catch (err) {
        handleError("Dashboard data error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return (
    <DashboardContext.Provider value={{ interviewScores, suggestedInterview, weaknesses, loading }}>{children}</DashboardContext.Provider>
  );
};
export default DashboardProvider;
