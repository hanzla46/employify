import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { SkillsContext } from "../Context/SkillsContext";
import { JobsContext } from "../Context/JobsContext";
import { Spinner } from "../lib/Spinner";
import InterviewScoreChart from "../components/InterviewScoreChart";
import axios from "axios";
import { TrendingUp, Target, BookOpen, Briefcase, ChevronRight, Star, Calendar, Award, AlertCircle, Play } from "lucide-react";
axios.defaults.withCredentials = true;
const url = import.meta.env.VITE_API_URL;
const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue", trend, onClick }) => (
  <div
    className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 ${
      onClick ? "cursor-pointer" : ""
    }`}
    onClick={onClick}>
    <div className='flex items-center justify-between'>
      <div className={`p-3 rounded-lg bg-${color}-50`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
      {trend && (
        <div className={`flex items-center text-sm ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
          <TrendingUp className='w-4 h-4 mr-1' />
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div className='mt-4'>
      <h3 className='text-2xl font-bold text-gray-900'>{value}</h3>
      <p className='text-sm text-gray-600 mt-1'>{title}</p>
      {subtitle && <p className='text-xs text-gray-500 mt-1'>{subtitle}</p>}
    </div>
  </div>
);
const Dashboard = () => {
  useEffect(() => {
    document.title = "Dashboard | Employify AI";
  }, []);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { roadmap } = useContext(SkillsContext);
  const { savedJobs } = useContext(JobsContext);
  const [interviewScores, setInterviewScores] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [weaknesses, setWeaknesses] = useState([]);
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
  const averageScore = interviewScores.length > 0 ? Math.round(interviewScores.reduce((a, b) => a + b, 0) / interviewScores.length) : 0;
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

  if (loading)
    return (
      <div className='min-h-svh'>
        <Spinner />
      </div>
    );

  return (
    <div className='min-h-screen bg-gray-100 dark:bg-gray-800 pt-10'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-200'>Welcome back, {user?.name || "there"}! 👋</h1>
          <p className='text-gray-600 dark:text-gray-300 mt-2'>Here's your career development progress and insights.</p>
        </div>

        {/* Stats Overview */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <StatCard
            icon={TrendingUp}
            title='Average Interview Score'
            value={`${averageScore}%`}
            subtitle={`Based on ${interviewScores.length} interviews`}
            color='blue'
            trend={5}
          />
          <StatCard
            icon={Target}
            title='Roadmap Progress'
            value={`${roadmapCompletion.percent}%`}
            subtitle={`${roadmapCompletion.completed}/${roadmapCompletion.total} tasks completed`}
            color='green'
          />
          <StatCard
            icon={Briefcase}
            title='Saved Jobs'
            value={savedJobs.length}
            subtitle='Jobs in your pipeline'
            color='purple'
            onClick={() => navigate("/jobs?savedJobs=true")}
          />
          <StatCard icon={Star} title='Skills Mastered' value='12' subtitle='This month' color='yellow' />
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Column - Main Content */}
          <div className='lg:col-span-2 space-y-8'>
            {/* Interview Performance Chart */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-semibold text-gray-900'>Interview Performance</h2>
              </div>

              {interviewScores.length > 0 ? (
                <div className='h-80'>
                  <InterviewScoreChart scores={interviewScores} />
                </div>
              ) : (
                <div className='h-80 flex items-center justify-center text-gray-500'>
                  <div className='text-center'>
                    <Award className='w-12 h-12 mx-auto mb-4 text-gray-300' />
                    <p className='text-lg font-medium'>No interviews yet</p>
                    <p className='text-sm mt-2'>Start practicing to see your progress!</p>
                  </div>
                </div>
              )}
            </div>

            {/* Roadmap Progress */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-semibold text-gray-900'>Learning Roadmap</h2>
                <Link to='/roadmap' className='text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center'>
                  View roadmap <ChevronRight className='w-4 h-4 ml-1' />
                </Link>
              </div>

              {roadmapCompletion.total > 0 ? (
                <div>
                  <div className='flex items-center justify-between mb-3'>
                    <span className='text-sm font-medium text-gray-700'>Overall Progress</span>
                    <span className='text-sm font-medium text-gray-900'>{roadmapCompletion.percent}%</span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-3 mb-4'>
                    <div
                      className='bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500'
                      style={{ width: `${roadmapCompletion.percent}%` }}
                    />
                  </div>
                  <div className='grid grid-cols-3 gap-4 text-center'>
                    <div>
                      <div className='text-2xl font-bold text-green-600'>{roadmapCompletion.completed}</div>
                      <div className='text-xs text-gray-500'>Completed</div>
                    </div>
                    <div>
                      <div className='text-2xl font-bold text-blue-600'>{roadmapCompletion.total - roadmapCompletion.completed}</div>
                      <div className='text-xs text-gray-500'>Remaining</div>
                    </div>
                    <div>
                      <div className='text-2xl font-bold text-gray-900'>{roadmapCompletion.total}</div>
                      <div className='text-xs text-gray-500'>Total Tasks</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='text-center py-8'>
                  <BookOpen className='w-12 h-12 mx-auto mb-4 text-gray-300' />
                  <p className='text-lg font-medium text-gray-600 mb-2'>No roadmap created yet</p>
                  <p className='text-sm text-gray-500 mb-4'>Create a personalized learning path to achieve your career goals</p>
                  <Link
                    to='/roadmap'
                    className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                    Create Roadmap
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className='space-y-6'>
            {/* Suggested Interview */}
            {suggestedInterview && (
              <div className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200'>
                <div className='flex items-center mb-4'>
                  <Play className='w-5 h-5 text-blue-600 mr-2' />
                  <h3 className='font-semibold text-blue-900'>Recommended Interview</h3>
                </div>
                <p className='text-blue-800 mb-4 font-medium'>{suggestedInterview.title}</p>
                <p className='text-blue-700 text-sm mb-4'>
                  Based on your profile and recent activity, this interview will help you practice key skills.
                </p>
                <Link
                  to={
                    suggestedInterview.id
                      ? `/interview?sessionId=${suggestedInterview.id}`
                      : `/interview?position=${suggestedInterview.title}`
                  }
                  className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full justify-center'>
                  <Play className='w-4 h-4 mr-2' />
                  Start Interview
                </Link>
              </div>
            )}

            {/* Areas for Improvement */}
            {weaknesses && weaknesses.length > 0 && (
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                <div className='flex items-center mb-4'>
                  <AlertCircle className='w-5 h-5 text-orange-500 mr-2' />
                  <h3 className='font-semibold text-gray-900'>Areas for Improvement</h3>
                </div>
                <div className='space-y-3'>
                  {weaknesses
                    .filter((w) => w.trim() !== "")
                    .map((weakness, idx) => (
                      <div key={idx} className='flex items-start space-x-3'>
                        <div className='w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0'></div>
                        <p className='text-sm text-gray-700'>{weakness}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            {/* <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <h3 className='font-semibold text-gray-900 mb-4'>Recent Activity</h3>
              <div className='space-y-1'>
                {recentActivity.map((activity, idx) => (
                  <ActivityItem key={idx} activity={activity} />
                ))}
              </div>
              <Link to='/activity' className='block text-center text-blue-600 hover:text-blue-700 text-sm font-medium mt-4'>
                View all activity
              </Link>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
