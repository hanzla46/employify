import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { SkillsContext } from "../Context/SkillsContext";
import { Spinner } from "../lib/Spinner";
import InterviewScoreChart from "../components/InterviewScoreChart";
import axios from "axios";

axios.defaults.withCredentials = true;
const url = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { roadmap } = useContext(SkillsContext);
  const [interviewScores, setInterviewScores] = useState([]);
  const [suggestedInterview, setSuggestedInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch interviews
        const interviewsRes = await axios.get(`${url}/interview/get-all-interviews`);
        const scores = interviewsRes.data.interviews?.map((i) => Number(i.overallScore)).filter((score) => !isNaN(score)) || [];
        setInterviewScores(scores);

        // Fetch suggested interview
        const suggestionRes = await axios.get(`${url}/interview/suggested-interview`);
        if (suggestionRes.data.success) {
          setSuggestedInterview({
            id: suggestionRes.data.interviewId,
            title: suggestionRes.data.title,
          });
        }
      } catch (err) {
        console.error("Dashboard data error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Calculate roadmap completion
  const roadmapCompletion = React.useMemo(() => {
    if (!roadmap) return { percent: 0 };

    const { completed, total } = roadmap.reduce(
      (acc, task) => {
        if (task.subtasks) {
          acc.total += task.subtasks.length;
          acc.completed += task.subtasks.filter((sub) => sub.completed).length;
        }
        return acc;
      },
      { completed: 0, total: 0 }
    );

    return {
      completed,
      total,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [roadmap]);

  if (loading) return <Spinner />;

  return (
    <div className='container mx-auto p-4 max-w-6xl'>
      <h1 className='text-2xl font-bold mb-6'>Dashboard</h1>

      <div className='grid gap-6 md:grid-cols-2'>
        {/* Interview Performance */}
        <div className='bg-white p-4 border rounded'>
          <h2 className='font-semibold mb-3'>Interview Performance</h2>
          <div className='h-64'>
            <InterviewScoreChart scores={interviewScores} />
          </div>
          {interviewScores.length === 0 && <p className='text-gray-500 text-center py-4'>No interview data available</p>}
        </div>

        {/* Roadmap Progress */}
        <div className='bg-white p-4 border rounded'>
          <h2 className='font-semibold mb-3'>Roadmap Progress</h2>
          {roadmapCompletion.total > 0 ? (
            <>
              <div className='h-8 bg-gray-100 rounded-full mb-2'>
                <div className='h-full bg-blue-500 rounded-full' style={{ width: `${roadmapCompletion.percent}%` }} />
              </div>
              <p className='text-center'>
                {roadmapCompletion.completed} of {roadmapCompletion.total} tasks completed ({roadmapCompletion.percent}%)
              </p>
              <Link to='/roadmap' className='block mt-4 text-center text-blue-600 hover:underline'>
                View Roadmap
              </Link>
            </>
          ) : (
            <>
              <p className='text-gray-500 mb-4'>No roadmap data available</p>
              <Link to='/roadmap' className='block text-center text-blue-600 hover:underline'>
                Create Roadmap
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Suggested Interview */}
      {suggestedInterview && (
        <div className='mt-6 bg-white p-4 border rounded'>
          <h2 className='font-semibold mb-2'>Recommended Interview</h2>
          <p className='mb-3'>{suggestedInterview.title}</p>
          <Link
            to={suggestedInterview.id ? `/interview?session=${suggestedInterview.id}` : `/interview?position=${suggestedInterview.title}`}
            className='inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'>
            Start Interview
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
