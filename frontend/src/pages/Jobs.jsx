import React, { useState, useEffect, useContext } from "react";
import { Briefcase, MapPin, DollarSign, Clock, Search, BookmarkPlus, Share2, Mic, Sparkles, ChevronDown, Loader2 } from "lucide-react"; // Added Loader2
import ProtectedRoute from "../Context/ProtectedRoute";
import { JobsContext } from "../Context/JobsContext";
import { AuthContext } from "../Context/AuthContext";
import { useSearchParams, useLocation, Navigate, useNavigate, Link } from "react-router-dom";
import { handleError, handleSuccess } from "../utils";
import FancyButton from "../components/Button";
import { SkillsContext } from "../Context/SkillsContext";
import CompanyDetailsModal from "../components/CompanyDetails";
const url = import.meta.env.VITE_API_URL;
import axios from "axios";
axios.defaults.withCredentials = true; // Ensure cookies are sent with requests

export function Jobs() {
  const { hasProfile } = useContext(SkillsContext);
  const { user } = useContext(AuthContext);
  const { contextLoading, jobs, savedJobs, setSavedJobs, filteredJobs, setFilteredJobs } = useContext(JobsContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: "",
    location: "All", // Default to "All" for consistent dropdown behavior
    jobType: "All", // Default to "All" for consistent dropdown behavior
  });
  const [uniqueLocations, setUniqueLocations] = useState(["All locations"]);
  const [uniqueJobTypes, setUniqueJobTypes] = useState(["All types"]);
  const [expandedJob, setExpandedJob] = useState(null);
  const [openApplyDropdownJobId, setOpenApplyDropdownJobId] = useState(null);

  // State for Cover Letter and Resume generation
  const [jobActionStates, setJobActionStates] = useState({});
  const [activeResumeDropdown, setActiveResumeDropdown] = useState(null); // Stores jobId or null
  const [isOpenedsavedJobs, setIsOpenedSavedJobs] = useState(false); // Renamed to clearly indicate its purpose
  const [whyExpanded, setWhyExpanded] = useState({});
  const [missingExpanded, setMissingExpanded] = useState({});

  // EFFECT 1: Initialize state from URL params on first render (mount)
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlLocation = searchParams.get("location") || "All";
    const urlJobType = searchParams.get("jobType") || "All";
    const urlSavedJobs = searchParams.get("savedJobs") === "true"; // Check for "true" string

    // Set filters based on URL or defaults
    setFilters({
      search: urlSearch,
      location: urlLocation,
      jobType: urlJobType,
    });

    // Set saved jobs state based on URL
    setIsOpenedSavedJobs(urlSavedJobs);

    // This effect runs only once on mount to set initial states.
    // Subsequent changes to filters or isOpenedsavedJobs will be handled by Effect 2.
  }, [searchParams]); // Depend on searchParams to react to external URL changes (e.g., direct navigation)

  // EFFECT 2: Update URL params whenever filters or savedJobs view changes
  useEffect(() => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.location !== "All") params.location = filters.location; // Only add if not "All"
    if (filters.jobType !== "All") params.jobType = filters.jobType; // Only add if not "All"
    if (isOpenedsavedJobs) params.savedJobs = "true"; // Add savedJobs param only when active

    setSearchParams(params);
  }, [filters, isOpenedsavedJobs, setSearchParams]); // Added setSearchParams to deps for consistency

  useEffect(() => {
    document.title = "Jobs | Employify AI";
  }, []);

  const timeAgo = (postedAt) => {
    const diffMs = Date.now() - new Date(postedAt).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return new Date(postedAt).toLocaleDateString();
  };

  useEffect(() => {
    if (!Array.isArray(jobs)) return;
    // Ensure "All" and "Remote" are always options, and add others from jobs
    setUniqueLocations(["All", "Remote", ...new Set(jobs.map((item) => item.location).filter(Boolean))].sort());
    setUniqueJobTypes(["All", ...new Set(jobs.map((item) => item.type).filter(Boolean))].sort());
  }, [jobs]);

  // EFFECT 3: Filter jobs based on current state (filters OR savedJobs view)
  useEffect(() => {
    let currentFilteredJobs = [];
    if (!Array.isArray(jobs)) {
      setFilteredJobs([]);
      return;
    }

    if (isOpenedsavedJobs) {
      // If "Saved Jobs" filter is active, only show saved jobs
      currentFilteredJobs = jobs.filter((job) => savedJobs.includes(job.id));
    } else {
      // Otherwise, apply search, location, and job type filters
      currentFilteredJobs = jobs.filter((job) => {
        const matchesSearch =
          filters.search === "" ||
          job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          job.company.name.toLowerCase().includes(filters.search.toLowerCase());

        const matchesLocation =
          filters.location === "All" || (filters.location === "Remote" && job.isRemote) || job.location === filters.location; // Direct match for location name

        const matchesJobType = filters.jobType === "All" || job.type === filters.jobType;

        return matchesSearch && matchesLocation && matchesJobType;
      });
    }
    setFilteredJobs(currentFilteredJobs);
  }, [filters, jobs, savedJobs, isOpenedsavedJobs]); // Added savedJobs and isOpenedsavedJobs as dependencies

  const toggleSaveJob = (jobId) => {
    const isSaved = savedJobs.includes(jobId);
    let newSavedJobs;
    if (isSaved) {
      newSavedJobs = savedJobs.filter((id) => id !== jobId);
    } else {
      newSavedJobs = [...savedJobs, jobId];
    }
    setSavedJobs(newSavedJobs);

    // If currently viewing saved jobs, update the filtered list immediately
    // This is handled by the main filtering useEffect, but if we want *immediate* UI feedback
    // without waiting for the next render cycle of the main filter, we can update here.
    // However, the main useEffect (Effect 3) will handle it, so this manual update might be redundant.
    // For simplicity and single source of truth for filteredJobs,
    // let's rely on Effect 3 completely for filtering based on state changes.
    // If performance becomes an issue on very large datasets, reconsider.
  };

  const openCloseSavedJobs = () => {
    if (isOpenedsavedJobs) {
      // If it was open, close it and reset filters to default "All" values
      setFilters({
        search: "",
        location: "All",
        jobType: "All",
      });
      setIsOpenedSavedJobs(false);
    } else {
      // If it was closed, open it and clear other filters
      setIsOpenedSavedJobs(true);
      setFilters({
        search: "",
        location: "All",
        jobType: "All",
      });
    }
  };

  const navigate = useNavigate();
  const toggleApplyDropdown = (jobId) => {
    setOpenApplyDropdownJobId((prevOpenId) => (prevOpenId === jobId ? null : jobId));
  };

  // Helper to update jobActionStates
  const updateJobActionState = (jobId, actionKey, newActionState) => {
    setJobActionStates((prev) => {
      const currentJobFullState = prev[jobId] || {
        coverLetter: { status: "idle" },
        resume: { status: "idle" },
      };
      const currentActionSpecificState = currentJobFullState[actionKey] || { status: "idle" };

      return {
        ...prev,
        [jobId]: {
          ...currentJobFullState,
          [actionKey]: {
            ...currentActionSpecificState,
            ...newActionState,
          },
        },
      };
    });
  };

  const handleGetCoverLetter = async (job) => {
    const { id, title, company } = job;
    const jobId = id;
    updateJobActionState(id, "coverLetter", { status: "loading" });
    try {
      const res = await axios.get(url + `/jobs/generateCoverLetter?jobId=${id}`, { responseType: "blob", withCredentials: true });
      const contentType = res.headers["content-type"];
      if (contentType && contentType.includes("application/json")) {
        const text = await res.data.text();
        const errorData = JSON.parse(text);
        handleError(errorData.message || "Server said nope 🙅‍♂️");
        throw new Error(errorData.message);
      }
      const fileBlob = res.data;
      updateJobActionState(id, "coverLetter", {
        status: "loaded",
        file: fileBlob,
        fileName: `${title.replace(/\W+/g, "_")}_${company.name.replace(/\W+/g, "_")}_CoverLetter.txt`,
      });
      handleSuccess("Cover letter generated!");
    } catch (error) {
      console.error("Failed to get cover letter:", error);
      updateJobActionState(jobId, "coverLetter", { status: "error", file: null });
    }
  };

  const handleGetResume = async (job) => {
    const { id, title, company } = job;
    const jobId = id;
    updateJobActionState(jobId, "resume", { status: "loading" });
    try {
      const res = await axios.get(url + `/jobs/generateResume?jobId=${id}`, {
        responseType: "blob",
        withCredentials: true,
      });
      const contentType = res.headers["content-type"];
      if (contentType && contentType.includes("application/json")) {
        const text = await res.data.text();
        const errorData = JSON.parse(text);
        handleError(errorData.message || "Server said nope 🙅‍♂️");
        throw new Error(errorData.message);
      }
      const fileBlob = res.data;
      updateJobActionState(jobId, "resume", {
        status: "loaded",
        file: fileBlob,
        fileName: `${title.replace(/\W+/g, "_")}_${company.name.replace(/\W+/g, "_")}_Resume.pdf`,
      });
      handleSuccess(`Resume generated for: ${title} at ${company.name}`);
    } catch (error) {
      console.error(`Failed to get resume:`, error);
      updateJobActionState(jobId, "resume", { status: "error", file: null });
    }
  };

  const handleDownloadFile = (jobId, actionKey) => {
    const actionState = jobActionStates[jobId]?.[actionKey];
    if (actionState && actionState.status === "loaded" && actionState.file) {
      const url = URL.createObjectURL(actionState.file);
      const a = document.createElement("a");
      a.href = url;
      a.download = actionState.fileName || "download.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Handler to add a missing skill to roadmap
  const handleAddMissingSkill = async (skill) => {
    try {
      const res = await axios.post(url + "/roadmap/add-missing-skills", { skills: [skill] }, { withCredentials: true });
      if (res.data.success) {
        handleSuccess(`Added '${skill}' to your roadmap suggestions!`);
      } else {
        handleError(res.data.message || "Failed to add skill");
      }
    } catch (err) {
      handleError("Server error: could not add skill");
    }
  };

  // Common button classes
  const baseActionBtnClass =
    "flex-1 inline-flex items-center justify-center px-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl text-white";
  const disabledBtnClass = "opacity-70 cursor-not-allowed";
  const clBtnColors = "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800";
  const resumeBtnColors = "bg-gradient-to-r from-indigo-700 to-purple-700 hover:from-indigo-800 hover:to-purple-800";

  const [company, setCompany] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [emailData, setEmailData] = useState(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [emails, setEmails] = useState([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  useEffect(() => {
    if (company) {
      const getEmails = async () => {
        setEmailsLoading(true);
        const res = await axios.get(url + "/jobs/get-company-emails?url=" + company.website);
        if (res.data.success) setEmails(res.data.emails || []);
        else handleError(res.data.message || "Failed to fetch emails");
        setEmailsLoading(false);
      };
      getEmails();
    }
  }, [company]);
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (company && company.website) {
        setCompanyData(null);
        const res = await axios.get(`${url}/company?name=${encodeURIComponent(company.name)}`);
        if (res.data.success) {
          setCompanyData(res.data.companyData);
        } else {
          setCompanyData(null);
        }
      }
    };
    fetchCompanyData();
  }, [company]);
  useEffect(() => {
    console.log("cdd", companyData);
  }, [companyData]);
  const openCompanyModal = (job) => {
    setCompany(job.company);
    // setCompanyData(job.companyData || null);
    setEmailData(job.matchAnalysis ? job.matchAnalysis.email : null);
    setIsCompanyModalOpen(true);
  };
  return (
    <div className='min-h-screen bg-gradient-to-b pt-16 from-gray-50 to-white dark:from-gray-800 dark:to-gray-700'>
      <CompanyDetailsModal
        isOpen={isCompanyModalOpen}
        onClose={() => {
          setEmails([]);
          setIsCompanyModalOpen(false);
        }}
        companyData={companyData}
        company={company}
        emailData={emailData}
        emails={emails}
        emailsLoading={emailsLoading}
      />
      {/* Header */}
      <header className='sticky top-11 z-10 bg-white dark:bg-gray-800 shadow-md'>
        <div className='container mx-auto px-2 py-2'>
          <div className='flex justify-between items-center'>
            <h1 className='text-xl font-bold text-primary-600 dark:text-primary-400'>Personalized Job Matching</h1>
            {!hasProfile && user ? (
              <div>
                {" "}
                <Link to={"/profile"}>
                  {" "}
                  <h2 className='text-red-600 dark:text-red-400 underline'>
                    ❗ Add Profile to unlock more features <span className='text-xl'>↗</span>
                  </h2>
                </Link>
              </div>
            ) : (
              ""
            )}
            {hasProfile ? (
              <div>
                {" "}
                <Link to={"/profile/edit"}>
                  {" "}
                  <h2 className='text-green-600 dark:text-green-400 underline'>
                    ❗ You can update profile for better experience <span className='text-xl'>↗</span>
                  </h2>
                </Link>
              </div>
            ) : (
              ""
            )}
            <div className='hidden md:flex space-x-4'>
              <button
                onClick={openCloseSavedJobs} // Use the new handler
                className={`p-1 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 ${
                  isOpenedsavedJobs ? "bg-green-500 dark:bg-green-300 border rounded-lg text-primary-600 dark:text-primary-400" : "bg-none"
                }`}>
                Saved ({savedJobs.length})
              </button>
            </div>
          </div>
        </div>
      </header>
      <ProtectedRoute>
        <div className='container mx-auto px-4 py-8'>
          <div className='max-w-6xl mx-auto'>
            {!isOpenedsavedJobs && ( // Conditionally render filters when not in saved jobs view
              <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-10 border border-gray-100 dark:border-gray-700'>
                <form className='grid grid-cols-1 md:grid-cols-4 gap-6 items-end'>
                  <div className='md:col-span-2'>
                    <label htmlFor='job-search' className='block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1'>
                      Search
                    </label>
                    <div className='relative'>
                      <input
                        id='job-search'
                        type='text'
                        placeholder='Search job title, company, skill...'
                        className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500'
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        aria-label='Search jobs'
                      />
                      <Search className='absolute right-3 top-2.5 h-5 w-5 text-gray-500 dark:text-gray-400' />
                    </div>
                  </div>
                  <div>
                    <label htmlFor='job-location' className='block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1'>
                      Location
                    </label>
                    <select
                      id='job-location'
                      className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500'
                      value={filters.location}
                      onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                      aria-label='Filter by location'>
                      {uniqueLocations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor='job-type' className='block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1'>
                      Job Type
                    </label>
                    <select
                      id='job-type'
                      className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500'
                      value={filters.jobType}
                      onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
                      aria-label='Filter by job type'>
                      {uniqueJobTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='flex items-end'>
                    <button
                      type='button'
                      className='w-full px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow transition'
                      onClick={() => setFilters({ search: "", location: "All", jobType: "All" })}>
                      Clear Filters
                    </button>
                  </div>
                </form>
                <div className='flex justify-self-end mt-0 pt-0'>
                  <div className='text-sm text-gray-600 dark:text-gray-300 font-medium'>Found {filteredJobs.length} jobs</div>
                </div>
              </div>
            )}
            {/* Job listings */}
            <div className='space-y-6'>
              {filteredJobs.map((job) => {
                const clState = jobActionStates[job.id]?.coverLetter || { status: "idle" };
                const resumeState = jobActionStates[job.id]?.resume || { status: "idle" };

                return (
                  <div
                    key={job.id}
                    className={`relative bg-gray-200 dark:bg-gray-900 rounded-xl shadow-lg shadow-gray-500 transition-all duration-300 ${
                      job.featured ? "border-l-4 border-primary-500" : ""
                    } ${expandedJob === job.id ? "ring-2 ring-primary-500" : ""}`}>
                    {/* Featured Ribbon */}
                    {job.featured && (
                      <div className='absolute top-3 right-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10'>
                        FEATURED
                      </div>
                    )}

                    <div className='p-3'>
                      <div className='flex flex-col md:flex-row md:items-start gap-5'>
                        {/* Company Logo */}
                        <div className='flex-shrink-0'>
                          <div className='bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl w-16 h-16 flex items-center justify-center overflow-hidden'>
                            <img
                              src={
                                job.company.logo ||
                                "https://img.freepik.com/premium-vector/building-logo-icon-design-template-vector_67715-555.jpg?w=360"
                              }
                              alt={`${job.company.name} logo`}
                              className='w-12 h-12 object-contain'
                            />
                          </div>
                        </div>

                        {/* Job Info */}
                        <div className='flex-grow'>
                          <div className='flex flex-wrap items-start justify-between gap-3 mb-2'>
                            <div>
                              <h2 className='text-xl font-bold text-gray-900 dark:text-white hover:text-primary-600 transition-colors'>
                                {job.title}
                              </h2>
                              <a
                                href={job.company.website}
                                target='_blank'
                                className='block underline text-gray-600 dark:text-gray-300 mb-2'>
                                {job.company.name}
                              </a>

                              {/* AI Score Badge */}
                              <div className='inline-flex items-center bg-gradient-to-r from-amber-500/20 to-amber-600/20 dark:from-amber-500/10 dark:to-amber-600/10 border border-amber-400/30 rounded-full px-3 py-1 mb-3'>
                                <Sparkles className='h-4 w-4 text-amber-400 mr-1' />
                                <span className='text-sm font-medium text-amber-700 dark:text-amber-300'>
                                  AI Match:{" "}
                                  {job.matchAnalysis && job.matchAnalysis.score !== undefined ? job.matchAnalysis.score + "%" : "N/A"}
                                </span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className='flex gap-2'>
                              <button
                                onClick={() => toggleSaveJob(job.id)}
                                className={`p-2 rounded-full transition-all ${
                                  savedJobs.includes(job.id)
                                    ? "text-primary-500 bg-primary-100/80 dark:bg-primary-900/50"
                                    : "text-gray-500 hover:text-primary-500 bg-gray-100 dark:bg-gray-700 hover:bg-primary-100/50"
                                }`}>
                                <BookmarkPlus className='h-5 w-5' />
                              </button>
                              <button
                                onClick={() => shareJob(job.id)}
                                className='p-2 rounded-full text-gray-500 hover:text-blue-500 bg-gray-100 dark:bg-gray-700 hover:bg-blue-100/50 transition-all'>
                                <Share2 className='h-5 w-5' />
                              </button>
                            </div>
                          </div>

                          {/* Job Metadata */}
                          <div className='flex flex-wrap justify-around mb-2'>
                            <div className='w-auto flex items-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2'>
                              <MapPin className='h-4 w-4 mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0' />
                              <span className='truncate inline-block w-auto'>
                                {job.location} {job.isRemote && "(Remote)"}
                              </span>
                            </div>

                            <div className='w-auto flex items-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2'>
                              <Briefcase className='h-4 w-4 mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0' />
                              <span className='inline-block w-auto'>{job.type}</span>
                            </div>

                            <div className='w-auto flex items-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2'>
                              <Clock className='h-4 w-4 mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0' />
                              <span className='inline-block w-auto'>{timeAgo(job.postedAt)}</span>
                            </div>
                          </div>
                          <div className='flex flex-row gap-2 justify-around'>
                            {/* WHY Section */}
                            {job.matchAnalysis?.why?.length > 0 && (
                              <div className='mb-4 w-[45%]'>
                                <button
                                  onClick={() => setWhyExpanded((prev) => ({ ...prev, [job.id]: !prev[job.id] }))}
                                  className='w-full flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors'>
                                  <span className='font-medium'>Why You Match</span>
                                  <ChevronDown className={`h-5 w-5 transition-transform ${whyExpanded[job.id] ? "rotate-180" : ""}`} />
                                </button>
                                {whyExpanded[job.id] && (
                                  <div className='mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-900'>
                                    <ul className='list-disc pl-5 space-y-1'>
                                      {job.matchAnalysis.why.map((item, index) => (
                                        <li key={index} className='text-gray-600 dark:text-gray-300'>
                                          {item}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* WHAT'S MISSING Section */}
                            {job.matchAnalysis?.missing?.length > 0 && (
                              <div className='mb-4 w-[45%]'>
                                <button
                                  onClick={() => setMissingExpanded((prev) => ({ ...prev, [job.id]: !prev[job.id] }))}
                                  className='w-full flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors'>
                                  <span className='font-medium'>What's Missing</span>
                                  <ChevronDown className={`h-5 w-5 transition-transform ${missingExpanded[job.id] ? "rotate-180" : ""}`} />
                                </button>
                                {missingExpanded[job.id] && (
                                  <div className='mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-900'>
                                    <ul className='list-disc pl-5 space-y-1'>
                                      {job.matchAnalysis.missing.map((item, index) => (
                                        <li key={index} className='text-gray-600 dark:text-gray-300 flex items-center gap-2'>
                                          {item}
                                          <button
                                            className='ml-2 px-2 py-0.5 text-xs rounded bg-amber-200 hover:bg-amber-300 text-amber-900 border border-amber-400 transition-colors'
                                            onClick={() => handleAddMissingSkill(item)}
                                            title='Add to Roadmap Suggestions'>
                                            + Add
                                          </button>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          {/* Expandable Section */}
                          {expandedJob === job.id && (
                            <div className='mt-3 pt-4 border-t border-gray-200 dark:border-gray-700'>
                              <h3 className='font-bold text-gray-900 dark:text-white mb-3'>Job Description</h3>
                              <p className='text-gray-600 dark:text-gray-300 mb-6 whitespace-pre-line'>{job.description}</p>
                            </div>
                          )}

                          {/* Expand/Collapse Button */}
                          <center>
                            {" "}
                            <button
                              className='mt-4 w-[60%] md:w-[30%] py-2 text-center bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors'
                              onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}>
                              <div className='flex items-center justify-center text-primary-600 dark:text-primary-400 text-sm font-medium'>
                                {expandedJob === job.id ? "Show less" : "Show full details"}
                                <ChevronDown
                                  className={`h-4 w-4 ml-2 transition-transform ${expandedJob === job.id ? "rotate-180" : ""}`}
                                />
                              </div>
                            </button>
                          </center>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 px-5 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-gray-200 dark:border-gray-700'>
                      <Link to={"/interview?jobId=" + job.id} className='w-full sm:w-auto'>
                        <FancyButton text={"Practice Interview"} />
                      </Link>
                      <button
                        onClick={() => openCompanyModal(job)}
                        className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-center transition-all duration-200 shadow-lg hover:shadow-xl'>
                        View Company
                      </button>
                      {/* resume and CL */}
                      <div className='flex flex-row gap-2'>
                        {" "}
                        <button
                          onClick={() =>
                            clState.status === "loaded" ? handleDownloadFile(job.id, "coverLetter") : handleGetCoverLetter(job)
                          }
                          disabled={clState.status === "loading" || !hasProfile}
                          className={`disabled:opacity-60 ${baseActionBtnClass} ${clBtnColors} ${
                            clState.status === "loading" ? disabledBtnClass : ""
                          }`}>
                          {clState.status === "loading" ? (
                            <>
                              <Loader2 className='animate-spin h-5 w-5 mr-2' /> Generating CL...
                            </>
                          ) : clState.status === "loaded" ? (
                            `Download CL (${clState.fileName?.split(".").pop() || "file"})`
                          ) : clState.status === "error" ? (
                            "Error CL. Retry?"
                          ) : (
                            "Get Cover Letter"
                          )}
                        </button>
                        <button
                          onClick={() => (resumeState.status === "loaded" ? handleDownloadFile(job.id, "resume") : handleGetResume(job))}
                          disabled={resumeState.status === "loading" || !hasProfile}
                          className={`disabled:opacity-60 ${baseActionBtnClass} ${resumeBtnColors} ${
                            resumeState.status === "loading" ? disabledBtnClass : ""
                          }`}>
                          {resumeState.status === "loading" ? (
                            <>
                              <Loader2 className='animate-spin h-5 w-5 mr-2' /> Generating Resume...
                            </>
                          ) : resumeState.status === "loaded" ? (
                            `Download Resume (${resumeState.fileName?.split(".").pop() || "file"})`
                          ) : resumeState.status === "error" ? (
                            "Error Resume. Retry?"
                          ) : (
                            "Get Resume"
                          )}
                        </button>
                      </div>

                      <div className='flex items-center w-full sm:w-auto'>
                        <a
                          href={job.externalLink}
                          target='_blank'
                          className='flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-5 py-2.5 rounded-l-xl font-medium text-center transition-all duration-200 shadow-lg hover:shadow-xl'>
                          Apply Now
                        </a>

                        {job.applyOptions && job.applyOptions.length > 0 && (
                          <div className='relative'>
                            <button
                              onClick={() => toggleApplyDropdown(job.id)}
                              className='h-full px-3 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-r-xl transition-colors'>
                              <ChevronDown className='h-4 w-4' />
                            </button>

                            {openApplyDropdownJobId === job.id && (
                              <div className='absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-30 overflow-hidden border border-gray-200 dark:border-gray-700'>
                                <div className='py-1'>
                                  {job.applyOptions.map((option, index) => (
                                    <a
                                      key={index}
                                      href={option.apply_link}
                                      target='_blank'
                                      className='block px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0'
                                      onClick={() => setOpenApplyDropdownJobId(null)}>
                                      <div className='font-medium'>{option.publisher}</div>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* No results state */}
            {jobs.length !== 0 && filteredJobs.length === 0 && (
              <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-10 text-center'>
                <div className='text-gray-500 dark:text-gray-400 mb-4'>
                  <Search className='h-10 w-10 mx-auto mb-2' />
                  <p className='text-lg font-medium'>No jobs found</p>
                </div>
                <p className='text-gray-600 dark:text-gray-300 mb-6'>Try adjusting your search or filter criteria</p>
                <button
                  className='text-primary-600 dark:text-primary-400 font-medium'
                  onClick={() =>
                    setFilters({
                      search: "",
                      location: "All", // Reset to "All" for dropdown
                      jobType: "All", // Reset to "All" for dropdown
                    })
                  }>
                  Clear all filters
                </button>
              </div>
            )}

            {/* Loading state */}
            {contextLoading && (
              <div className='flex items-center justify-center h-64'>
                <Loader2 className='animate-spin h-16 w-16 text-primary-600 dark:text-primary-400' />
              </div>
            )}
            {!contextLoading && jobs.length === 0 && (
              <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-10 text-center'>
                <div className='text-gray-500 dark:text-gray-400 mb-4'>
                  <Search className='h-10 w-10 mx-auto mb-2' />
                  <p className='text-lg font-medium'>Something went wrong</p>
                </div>
                <p className='text-gray-600 dark:text-gray-300 mb-6'>Please refresh the page</p>
              </div>
            )}
          </div>
        </div>
      </ProtectedRoute>
      {/* Footer */}
    </div>
  );
}
