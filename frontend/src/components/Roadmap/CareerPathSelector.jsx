import React, { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import FancyButton from "../Button";
import { Spinner } from "../../lib/Spinner";
import { SkillsContext } from "../../Context/SkillsContext";
import { handleError, handleSuccess } from "../../utils";

const url = import.meta.env.VITE_API_URL;

function CareerPathSelector({ onPathSelect, setIsPathSelected }) {
  const [loading, setLoading] = useState(true);
  const [pathsData, setPathsData] = useState({ paths: [] });
  const [selectedPathName, setSelectedPathName] = useState(null);
  const [preferences, setPreferences] = useState({
    difficulty: "intermediate", // beginner, intermediate, advanced
    timeframe: "6months", // 3months, 6months, 1year
    focus: "balanced", // practical, theoretical, balanced
  });
  const { roadmap, contextLoading } = useContext(SkillsContext);

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        if (contextLoading) {
          handleError("Context is still loading, please wait.");
          return;
        }
        if (roadmap && roadmap.length > 0) {
          handleSuccess("Using existing roadmap data, skipping career paths fetch");
          setLoading(false);
          return;
        }

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
  if (loading) {
    return (
      <p className='text-center text-gray-500 w-14 h-14'>
        <Spinner />
        Loading career paths.
      </p>
    );
  }
  const handleSelectionChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedPathName(selectedValue);
    const fullSelectedPath = pathsData.paths.find((p) => p.Path_name === selectedValue);
    onPathSelect({ ...fullSelectedPath, preferences } || null);
  };

  const handleDivClick = (pathName) => {
    setSelectedPathName(pathName);
    const fullSelectedPath = pathsData.paths.find((p) => p.Path_name === pathName);
    onPathSelect({ ...fullSelectedPath, preferences } || null);
  };

  return (
    <div>
      <h2 className='text-2xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-6'>Choose Your Desired Career Path:</h2>

      {/* Add preference controls */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow'>
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Difficulty Level</label>
          <select
            value={preferences.difficulty}
            onChange={(e) => setPreferences((prev) => ({ ...prev, difficulty: e.target.value }))}
            className='w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'>
            <option value='beginner'>Beginner</option>
            <option value='intermediate'>Intermediate</option>
            <option value='advanced'>Advanced</option>
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Timeframe</label>
          <select
            value={preferences.timeframe}
            onChange={(e) => setPreferences((prev) => ({ ...prev, timeframe: e.target.value }))}
            className='w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'>
            <option value='3months'>3 Months</option>
            <option value='6months'>6 Months</option>
            <option value='1year'>1 Year</option>
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Learning Focus</label>
          <select
            value={preferences.focus}
            onChange={(e) => setPreferences((prev) => ({ ...prev, focus: e.target.value }))}
            className='w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'>
            <option value='practical'>Practical (Hands-on Projects)</option>
            <option value='theoretical'>Theoretical (In-depth Learning)</option>
            <option value='balanced'>Balanced</option>
          </select>
        </div>
      </div>

      <form className='flex flex-wrap gap-5 m-auto'>
        {pathsData.paths.map((path, index) => (
          <div
            key={path.Path_name || index}
            // --- Apply base, hover, selected, and dark mode styles ---
            className={`
              border rounded-lg p-3 flex items-start cursor-pointer
              transition duration-200 ease-in-out text-gray-700 dark:text-gray-300 w-[47%] m-auto min-h-80
              ${
                selectedPathName === path.Path_name
                  ? "border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/50 dark:ring-blue-400/50 bg-blue-50 dark:bg-gray-700" // Selected: Light & Dark
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50" // Default & Hover: Light & Dark
              }
            `}
            // Make the whole div clickable to select the radio
            onClick={() => handleDivClick(path.Path_name)}>
            <input
              type='radio'
              id={`path-${index}`}
              name='careerPath'
              value={path.Path_name}
              checked={selectedPathName === path.Path_name}
              onChange={handleSelectionChange}
              // --- Radio styles using @tailwindcss/forms recommendations + dark mode ---
              className='mt-1 mr-4 h-4 w-4 shrink-0 cursor-pointer
                         border-gray-300 dark:border-gray-500
                         text-blue-600 dark:text-blue-500
                         focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-0
                         dark:bg-gray-700 dark:checked:bg-blue-500' // Explicit dark bg/checked colors can help
            />
            <label htmlFor={`path-${index}`} className='flex-grow cursor-pointer'>
              <h3 className='text-lg font-medium text-blue-700 dark:text-blue-400 mb-2'>{path.Path_name}</h3>
              <div className='text-sm space-y-1 text-gray-600 dark:text-gray-400'>
                <p>
                  <strong className='font-semibold text-gray-700 dark:text-gray-300 mr-1'>Stages:</strong>
                  {Array.isArray(path.Stages) ? path.Stages.join(" → ") : path.Stages}
                </p>
                <p>
                  <strong className='font-semibold text-gray-700 dark:text-gray-300 mr-1'>Timeline:</strong>
                  {path.Timeline}
                </p>
                <p>
                  <strong className='font-semibold text-gray-700 dark:text-gray-300 mr-1'>Salary Range:</strong>
                  {path.Salary_range}
                </p>
                <p>
                  <strong className='font-semibold text-gray-700 dark:text-gray-300 mr-1'>Risk Level:</strong>
                  {path.Risk_level}
                </p>
                <p>
                  <strong className='font-semibold text-gray-700 dark:text-gray-300 mr-1'>Required Skills:</strong>
                  {Array.isArray(path.Required_skills) ? path.Required_skills.join(", ") : path.Required_skills}
                </p>
              </div>
            </label>
          </div>
        ))}
      </form>
      <div
        onClick={() => {
          if (!selectedPathName) return;
          console.log("path selected!!");
          setIsPathSelected(true);
        }}
        className={`fixed right-4 bottom-14 ${!selectedPathName ? "opacity-50 pointer-events-none" : ""}`}>
        <FancyButton text={"Choose"} disabled={!selectedPathName} />
      </div>
    </div>
  );
}

CareerPathSelector.propTypes = {
  onPathSelect: PropTypes.func.isRequired,
  setIsPathSelected: PropTypes.func.isRequired,
};

export default CareerPathSelector;
