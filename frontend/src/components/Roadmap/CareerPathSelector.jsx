import React, { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import FancyButton from "../Button";
import { Spinner } from "../../lib/Spinner";
import { SkillsContext } from "../../Context/SkillsContext";
import { handleError, handleSuccess } from "../../utils";

const url = import.meta.env.VITE_API_URL;

function CareerPathSelector({ onPathSelect, setIsPathSelected }) {
  // State for loading indicator while fetching career paths
  const [loading, setLoading] = useState(true);
  // State to hold fetched career paths data
  const [pathsData, setPathsData] = useState({ paths: [] });
  // State for the currently selected career path name
  const [selectedPathName, setSelectedPathName] = useState(null);
  // State for user learning preferences (difficulty, timeframe, focus)
  const [preferences, setPreferences] = useState({
    difficulty: "intermediate",
    timeframe: "6months",
    focus: "balanced",
  });
  // Access roadmap and loading state from SkillsContext
  const { roadmap, contextLoading } = useContext(SkillsContext);

  // Effect: Fetches available career paths from the backend API unless roadmap data is already present in context
  useEffect(() => {
    const fetchPaths = async () => {
      try {
        // If context is still loading, show error and skip fetch
        if (contextLoading) {
          handleError("Context is still loading, please wait.");
          return;
        }
        // If roadmap data exists, skip fetching and use context data
        if (roadmap && roadmap.length > 0) {
          handleSuccess("Using existing roadmap data, skipping career paths fetch");
          setLoading(false);
          return;
        }

        // Fetch career paths from API
        const result = await axios.get(url + "/roadmap/career-paths", {
          withCredentials: true,
          headers: {
            Accept: "application/json",
          },
        });
        if (result.data.success) {
          setPathsData(result.data.data);
        } else {
          handleError("something went wrong! try again by refreshing the page");
        }
      } catch (error) {
        handleError("Failed to fetch career paths");
        console.error("Error fetching paths:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPaths();
  }, [contextLoading, roadmap]);

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[300px]'>
        <Spinner className='w-20 h-20 text-blue-600' />
        <p className='mt-4 text-lg font-medium text-gray-600 dark:text-gray-300'>Loading career paths...</p>
      </div>
    );
  }

  // Handler: When a radio input is changed, update selected path and notify parent
  const handleSelectionChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedPathName(selectedValue);
    // Find the full path object and pass it with preferences to parent
    const fullSelectedPath = pathsData.paths.find((p) => p.Path_name === selectedValue);
    onPathSelect({ ...fullSelectedPath, preferences } || null);
  };

  // Handler: When a card is clicked, update selected path and notify parent
  const handleDivClick = (pathName) => {
    setSelectedPathName(pathName);
    const fullSelectedPath = pathsData.paths.find((p) => p.Path_name === pathName);
    onPathSelect({ ...fullSelectedPath, preferences } || null);
  };

  return (
    <div className='max-w-6xl mx-auto px-4 py-8'>
      {/* Header section */}
      <div className='text-center mb-10'>
        <h2 className='text-3xl font-bold text-gray-800 dark:text-white mb-3'>Choose Your Career Path</h2>
        <p className='text-gray-600 dark:text-gray-300 max-w-2xl mx-auto'>
          Select a path that aligns with your goals and customize your learning experience
        </p>
      </div>

      {/* Preference controls for customizing learning experience */}
      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-10'>
        <h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-4'>Learning Preferences</h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* Difficulty selector */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Difficulty Level</label>
            <div className='relative'>
              <select
                value={preferences.difficulty}
                onChange={(e) => setPreferences((prev) => ({ ...prev, difficulty: e.target.value }))}
                className='w-full pl-4 pr-10 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                <option value='beginner'>Beginner</option>
                <option value='intermediate'>Intermediate</option>
                <option value='advanced'>Advanced</option>
              </select>
              <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
                <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                </svg>
              </div>
            </div>
          </div>

          {/* Timeframe selector */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Timeframe</label>
            <div className='relative'>
              <select
                value={preferences.timeframe}
                onChange={(e) => setPreferences((prev) => ({ ...prev, timeframe: e.target.value }))}
                className='w-full pl-4 pr-10 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                <option value='3months'>3 Months</option>
                <option value='6months'>6 Months</option>
                <option value='1year'>1 Year</option>
              </select>
              <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
                <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                </svg>
              </div>
            </div>
          </div>

          {/* Learning focus selector */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Learning Focus</label>
            <div className='relative'>
              <select
                value={preferences.focus}
                onChange={(e) => setPreferences((prev) => ({ ...prev, focus: e.target.value }))}
                className='w-full pl-4 pr-10 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                <option value='practical'>Practical (Hands-on Projects)</option>
                <option value='theoretical'>Theoretical (In-depth Learning)</option>
                <option value='balanced'>Balanced</option>
              </select>
              <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
                <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Career Path Cards: Render a card for each available career path */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12'>
        {pathsData.paths.map((path, index) => (
          <div
            key={path.Path_name || index}
            className={`relative h-full flex flex-col rounded-xl overflow-hidden border transition-all duration-200 ease-in-out
              ${
                selectedPathName === path.Path_name
                  ? "border-blue-500 dark:border-blue-400 ring-4 ring-blue-500/20 dark:ring-blue-400/20 shadow-lg"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 shadow-md hover:shadow-lg"
              }`}
            onClick={() => handleDivClick(path.Path_name)}>
            {/* Top colored bar to indicate selection */}
            <div
              className={`absolute top-0 left-0 w-full h-2 ${
                selectedPathName === path.Path_name ? "bg-gradient-to-r from-blue-500 to-indigo-600" : "bg-gray-200 dark:bg-gray-700"
              }`}></div>

            <div className='p-6 flex-grow'>
              <div className='flex items-start'>
                {/* Radio input for selecting a path */}
                <input
                  type='radio'
                  id={`path-${index}`}
                  name='careerPath'
                  value={path.Path_name}
                  checked={selectedPathName === path.Path_name}
                  onChange={handleSelectionChange}
                  className='mt-1 mr-4 h-5 w-5 shrink-0 cursor-pointer border-gray-300 dark:border-gray-500 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400'
                />
                <div className='flex-grow'>
                  <h3 className='text-xl font-bold text-gray-800 dark:text-white mb-3'>{path.Path_name}</h3>
                  <div className='space-y-3 text-gray-600 dark:text-gray-300'>
                    {/* Stages info */}
                    <div>
                      <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Stages</p>
                      <p className='text-sm'>{Array.isArray(path.Stages) ? path.Stages.join(" → ") : path.Stages}</p>
                    </div>
                    {/* Timeline info */}
                    <div>
                      <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Timeline</p>
                      <p className='text-sm'>{path.Timeline}</p>
                    </div>
                    {/* Salary range info */}
                    <div>
                      <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Salary Range</p>
                      <p className='text-sm'>{path.Salary_range}</p>
                    </div>
                    {/* Risk level info */}
                    <div>
                      <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Risk Level</p>
                      <p className='text-sm'>{path.Risk_level}</p>
                    </div>
                    {/* Required skills info */}
                    <div>
                      <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Required Skills</p>
                      <p className='text-sm'>
                        {Array.isArray(path.Required_skills) ? path.Required_skills.join(", ") : path.Required_skills}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card footer with select/confirm button */}
            <div
              className={`px-6 py-3 ${
                selectedPathName === path.Path_name ? "bg-blue-50 dark:bg-gray-700" : "bg-gray-50 dark:bg-gray-800"
              }`}>
              <button
                type='button'
                className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  selectedPathName === path.Path_name
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedPathName === path.Path_name) {
                    setIsPathSelected(true);
                  } else {
                    handleDivClick(path.Path_name);
                  }
                }}>
                {selectedPathName === path.Path_name ? "Confirm Selection" : "Select Path"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button: Allows user to continue after selecting a path */}
      {selectedPathName && (
        <div className='fixed right-6 bottom-8'>
          <button
            onClick={() => {
              console.log("path selected!!");
              setIsPathSelected(true);
            }}
            className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-full shadow-lg transition-all duration-200 flex items-center'>
            Continue with {selectedPathName}
            <svg className='w-5 h-5 ml-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

CareerPathSelector.propTypes = {
  onPathSelect: PropTypes.func.isRequired,
  setIsPathSelected: PropTypes.func.isRequired,
};

export default CareerPathSelector;
