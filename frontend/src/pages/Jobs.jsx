import React, { useState, useEffect, useContext } from "react";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Search,
  Filter,
  BookmarkPlus,
  Share2,
  ChevronRight,
  Star,
  ChevronDown,
} from "lucide-react";
import ProtectedRoute from "../Context/ProtectedRoute";
import { JobsContext } from "../Context/JobsContext";
import { useSearchParams, useLocation } from "react-router-dom";
import { handleSuccess } from "../utils";
export function Jobs() {
  const { jobs, savedJobs, setSavedJobs, filteredJobs, setFilteredJobs } =
    useContext(JobsContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    jobType: "",
  });
  const [uniqueLocations, setUniqueLocations] = useState(["All locations"]);
  const [uniqueJobTypes, setUniqueJobTypes] = useState(["All types"]);
  const [expandedJob, setExpandedJob] = useState(null);
  const [openApplyDropdownJobId, setOpenApplyDropdownJobId] = useState(null);

  useEffect(() => {
    const urlFilters = {
      search: searchParams.get("search") || "",
      location: searchParams.get("location") || "All",
      jobType: searchParams.get("jobType") || "All",
    };
    setFilters(urlFilters);
  }, []);
  // url for job sharing
  const [currentUrl, setCurrentUrl] = useState('');
  useEffect(() => {
    setCurrentUrl(window.location.origin);
  }, []);
  const shareJob = async (jobId) => {
    await navigator.clipboard.writeText(currentUrl + "/job" + "?jobId=" + jobId);
    handleSuccess("Job link copied to clipboard!");
  };
  useEffect(() => {
    const params = {
      ...(filters.search && { search: filters.search }),
      ...(filters.location !== "All" && { location: filters.location }),
      ...(filters.jobType !== "All" && { jobType: filters.jobType }),
    };
    setSearchParams(params);
  }, [filters]);

  useEffect(() => {
    document.title = "Jobs | Employify AI";
  }, []);

  useEffect(() => {
    if (!Array.isArray(jobs)) return;
    setUniqueLocations([
      "All",
      "Remote",
      ...new Set(jobs.map((item) => item.location)),
    ]);
    setUniqueJobTypes(["All", ...new Set(jobs.map((item) => item.type))]);
  }, [jobs]);

  useEffect(() => {
    const filtered = jobs.filter((job) => {
      return (
        (filters.search === "" ||
          job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          job.company.name
            .toLowerCase()
            .includes(filters.search.toLowerCase())) &&
        (filters.location === "" ||
          filters.location === "All" ||
          (filters.location === "Remote" && job.isRemote) ||
          job.location === filters.location) &&
        (filters.jobType === "" ||
          filters.jobType === "All" ||
          job.type === filters.jobType)
      );
    });
    setFilteredJobs(filtered);
  }, [filters, jobs]);

  const toggleSaveJob = (jobId) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter((id) => id !== jobId));
    } else {
      setSavedJobs([...savedJobs, jobId]);
    }
  };

  // Function to toggle the dropdown for a specific job ID
  const toggleApplyDropdown = (jobId) => {
    setOpenApplyDropdownJobId((prevOpenId) =>
      prevOpenId === jobId ? null : jobId
    );
  };
  return (
    <div className="min-h-screen bg-gradient-to-b pt-16 from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
      {/* Header */}
      <header className="sticky top-12 z-10 bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              Personalized Job Matching
            </h1>
            <div className="hidden md:flex space-x-4">
              <button className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                Saved ({savedJobs.length})
              </button>
            </div>
          </div>
        </div>
      </header>
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Search and filters section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search job title, company, skill..."
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={filters.search}
                      onChange={(e) =>
                        setFilters({ ...filters, search: e.target.value })
                      }
                    />
                    <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </div>
                </div>
                <div>
                  <select
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={filters.location}
                    onChange={(e) =>
                      setFilters({ ...filters, location: e.target.value })
                    }
                  >
                    {uniqueLocations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={filters.jobType}
                    onChange={(e) =>
                      setFilters({ ...filters, jobType: e.target.value })
                    }
                  >
                    {uniqueJobTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end items-center">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Found {filteredJobs.length} jobs
                </div>
              </div>
            </div>

            {/* Job listings */}
            <div className="space-y-6">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg transition-all duration-200 ${
                    job.featured ? "border-l-4 border-primary-500" : ""
                  } ${expandedJob === job.id ? "ring-2 ring-primary-500" : ""}`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex">
                        <div className="mr-4 flex-shrink-0">
                          <img
                            src={
                              job.company.logo ||
                              "https://img.freepik.com/premium-vector/building-logo-icon-design-template-vector_67715-555.jpg?w=360"
                            }
                            alt={`${job.company.name} logo`}
                            className="w-12 h-12 rounded-md bg-gray-200 object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center mb-1">
                            <h2 className="text-xl font-semibold dark:text-white mr-2">
                              {job.title}
                            </h2>
                            {job.featured && (
                              <span className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-xs font-medium px-2 py-0.5 rounded-full">
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 mb-1">
                            {job.company.name}
                          </p>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center mr-2">
                              <Star className="h-4 w-4 text-yellow-400 mr-1" />
                              <span>{job.score || 46}</span>
                            </div>
                            <span className="text-gray-300 dark:text-gray-600 mx-1">
                              •
                            </span>
                            <span>{job.postedAt}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleSaveJob(job.id)}
                          className={`p-2 rounded-full ${
                            savedJobs.includes(job.id)
                              ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          <BookmarkPlus className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => shareJob(job.id)}
                          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        >
                          <Share2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <MapPin className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                        {job.location} {job.isRemote && "(Remote)"}
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <DollarSign className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                        {job.salary}
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <Briefcase className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                        {job.type}
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <Clock className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                        {job.postedAt}
                      </div>
                    </div>

                    {expandedJob === job.id && (
                      <div className="mt-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                          Job Description
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                          {job.description}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:justify-between space-y-3 sm:space-y-0">
                          <a
                            href={
                              job.company.website ||
                              `https://www.google.com/search?q=${job.company.name}`
                            }
                            target="_blank"
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40"
                          >
                            View Company
                          </a>
                          <a
                            href={job.externalLink}
                            target="_blank"
                            className="inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600"
                          >
                            Easy Apply
                          </a>
                        </div>
                      </div>
                    )}

                    <button
                      className="mt-2 flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium"
                      onClick={() =>
                        setExpandedJob(expandedJob === job.id ? null : job.id)
                      }
                    >
                      {expandedJob === job.id ? "Show less" : "Show more"}
                      <ChevronRight
                        className={`h-4 w-4 ml-1 transition-transform ${
                          expandedJob === job.id ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 px-6 py-2 flex justify-between items-center relative mt-0">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Be an early applicant
                    </div>
                    <div className="flex flex-row">
                      {" "}
                      <div className="bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors">
                        {" "}
                        <a href={job.externalLink} target="_blank">
                          Apply Now
                        </a>{" "}
                      </div>
                      {job.applyOptions && job.applyOptions.length > 0 && (
                        <div className="ml-2 relative">
                          {/* Dropdown Trigger Button */}
                          <button
                            onClick={() => toggleApplyDropdown(job.id)}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-black dark:text-white"
                          >
                            <ChevronDown />
                          </button>
                          {openApplyDropdownJobId === job.id && (
                            <ul className="min-w-[150px] px-4 py-2 text-sm text-gray-600 dark:text-gray-100 space-y-1 absolute bg-white dark:bg-gray-800 shadow-lg rounded-lg z-10 right-0 top-full mt-2 border border-gray-200 dark:border-gray-700">
                              {" "}
                              {/* Added min-width, border, text color */}
                              {job.applyOptions.map((option, index) => (
                                <li
                                  key={index}
                                  className="flex items-center justify-between space-x-4 py-1" // Adjusted spacing/padding
                                >
                                  <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    {" "}
                                    {/* Prevent wrap */}
                                    {option.publisher}
                                  </span>
                                  <a
                                    href={option.apply_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-600 dark:text-primary-400 hover:underline font-medium whitespace-nowrap" // Added font-medium, prevent wrap
                                    onClick={() =>
                                      setOpenApplyDropdownJobId(null)
                                    } // Optional: Close dropdown on click
                                  >
                                    Apply
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No results state */}
            {jobs.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-10 text-center">
                <div className="text-gray-500 dark:text-gray-400 mb-4">
                  <Search className="h-10 w-10 mx-auto mb-2" />
                  <p className="text-lg font-medium">No jobs found</p>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  className="text-primary-600 dark:text-primary-400 font-medium"
                  onClick={() =>
                    setFilters({
                      search: "",
                      location: "",
                      jobType: "",
                      featured: false,
                    })
                  }
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {jobs.length > 0 && (
              <div className="mt-8 flex justify-center">
                <nav className="inline-flex rounded-md shadow">
                  <button className="px-3 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300">
                    Previous
                  </button>
                  <button className="px-3 py-2 border-t border-b border-gray-300 dark:border-gray-600 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium">
                    1
                  </button>
                  <button className="px-3 py-2 border-t border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300">
                    2
                  </button>
                  <button className="px-3 py-2 border-t border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300">
                    3
                  </button>
                  <button className="px-3 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300">
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </ProtectedRoute>
      {/* Footer */}
    </div>
  );
}
