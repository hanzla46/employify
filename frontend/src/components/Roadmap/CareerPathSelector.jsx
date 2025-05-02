import React from "react";
import PropTypes from "prop-types"; // Optional, but good practice
import FancyButton from "../Button";
import { Spinner } from "../../lib/Spinner";
function CareerPathSelector({ pathsData, selectedPathName, onPathSelect, setIsPathSelected }) {
  if (!pathsData || !pathsData.paths || pathsData.paths.length === 0) {
    return (
      <p className='text-center text-gray-500'>
        <Spinner />
        Loading career paths available.
      </p>
    );
  }

  const handleSelectionChange = (event) => {
    const selectedValue = event.target.value;
    const fullSelectedPath = pathsData.paths.find((p) => p.Path_name === selectedValue);
    onPathSelect(fullSelectedPath || null);
  };

  return (
    <div>
      <h2 className='text-2xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-6'>Choose Your Desired Career Path:</h2>
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
          console.log("path selected!!");
          setIsPathSelected(true);
        }}
        className='fixed right-4 bottom-4'>
        <FancyButton text={"Choose"}></FancyButton>
      </div>
    </div>
  );
}

// --- PropTypes remain the same ---
CareerPathSelector.propTypes = {
  pathsData: PropTypes.shape({
    paths: PropTypes.arrayOf(
      PropTypes.shape({
        Path_name: PropTypes.string.isRequired,
        Stages: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
        Timeline: PropTypes.string,
        Salary_range: PropTypes.string,
        Industries: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
        Risk_level: PropTypes.string,
        AI_impact: PropTypes.string,
        Required_skills: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
        Accelerators: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
        Notes: PropTypes.string,
      })
    ),
  }).isRequired,
  selectedPathName: PropTypes.string,
  onPathSelect: PropTypes.func.isRequired,
};

CareerPathSelector.defaultProps = {
  selectedPathName: null,
};

export default CareerPathSelector;
