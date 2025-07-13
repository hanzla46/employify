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
  const { hasProfile, setMissingSkills, missingSkills } = useContext(SkillsContext);
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
        setMissingSkills((prev) => [...prev, skill]); // Update context state
      } else {
        handleError(res.data.message || "Failed to add skill");
      }
    } catch (err) {
      handleError("Server error: could not add skill");
    }
  };

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
        const res = await axios.get(url + "/company/get-company-emails?url=" + company.website);
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

      {/* Compact Header */}
      <header className='sticky top-11 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm'>
        <div className='container mx-auto px-4 py-3'>
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-3'>
            <h1 className='text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-600'>
              Personalized Job Matching
            </h1>

            {!hasProfile && user ? (
              <Link to={"/profile"} className='text-sm text-red-600 dark:text-red-400 hover:underline'>
                ❗ Add Profile to unlock more features ↗
              </Link>
            ) : hasProfile ? (
              <Link to={"/profile/edit"} className='text-sm text-green-600 dark:text-green-400 hover:underline'>
                ❗ Update profile for better matches ↗
              </Link>
            ) : null}

            <button
              onClick={openCloseSavedJobs}
              className={`text-sm px-3 py-1 rounded-full transition-all ${
                isOpenedsavedJobs
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}>
              Saved ({savedJobs.length})
            </button>
          </div>
        </div>
      </header>

      <ProtectedRoute>
        <div className='container mx-auto px-4 py-6'>
          <div className='max-w-6xl mx-auto'>
            {/* Compact Filters */}
            {!isOpenedsavedJobs && (
              <div className='bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-md p-4 mb-6 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-lg'>
                <div className='grid grid-cols-1 md:grid-cols-8 gap-3'>
                  <div className='md:col-span-3'>
                    <div className='relative'>
                      <input
                        type='text'
                        placeholder='Search jobs...'
                        className='w-full px-3 py-2 text-sm rounded-lg border border-gray-300/70 dark:border-gray-600/70 bg-white/70 dark:bg-gray-700/70 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent'
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      />
                      <Search className='absolute right-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400' />
                    </div>
                  </div>

                  <div className='flex gap-3 md:col-span-4'>
                    <select
                      className='w-full px-3 py-2 text-sm rounded-lg border text-black dark:text-gray-200 border-gray-300/70 dark:border-gray-600/70 bg-white/70 dark:bg-gray-700/70 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent'
                      value={filters.location}
                      onChange={(e) => setFilters({ ...filters, location: e.target.value })}>
                      {uniqueLocations.map((location) => (
                        <option key={location} value={location}>
                          {location.length > 12 ? `${location.substring(0, 10)}...` : location}
                        </option>
                      ))}
                    </select>

                    <select
                      className='w-full px-3 py-2 text-sm rounded-lg border text-black dark:text-gray-200 border-gray-300/70 dark:border-gray-600/70 bg-white/70 dark:bg-gray-700/70 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent'
                      value={filters.jobType}
                      onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}>
                      {uniqueJobTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => setFilters({ search: "", location: "All", jobType: "All" })}
                    className='text-sm px-3 py-2 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all shadow-sm'>
                    Clear Filters
                  </button>
                </div>
                <div className='mt-2 text-xs text-gray-500 dark:text-gray-400 font-medium text-right'>{filteredJobs.length} jobs found</div>
              </div>
            )}

            {/* Job listings with enhanced animations */}
            <div className='space-y-4'>
              {/* Render each filtered job card with all actions and details */}
              {filteredJobs.map((job) => {
                // Get the current state for cover letter and resume actions for this job
                const clState = jobActionStates[job.id]?.coverLetter || { status: "idle" };
                const resumeState = jobActionStates[job.id]?.resume || { status: "idle" };

                // Each job card displays job info, actions, and dynamic UI based on state
                return (
                  <div
                    key={job.id}
                    className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-md transition-all duration-300 hover:shadow-xl ${
                      job.featured ? "ring-2 ring-primary-500/50" : ""
                    } ${expandedJob === job.id ? "ring-2 ring-primary-500" : ""}`}>
                    {/* If job is featured, show badge */}
                    {job.featured && (
                      <div className='absolute top-3 right-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10 animate-pulse'>
                        FEATURED
                      </div>
                    )}

                    <div className='p-4'>
                      <div className='flex flex-col md:flex-row md:items-start gap-4'>
                        {/* Company logo with fallback */}
                        <div className='flex-shrink-0 relative group'>
                          <div className='bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl w-14 h-14 flex items-center justify-center overflow-hidden'>
                            <img
                              src={
                                job.company.logo ||
                                "https://img.freepik.com/premium-vector/building-logo-icon-design-template-vector_67715-555.jpg?w=360"
                              }
                              alt={` logo`}
                              className='w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-110'
                            />
                          </div>
                        </div>

                        <div className='flex-grow'>
                          <div className='flex flex-wrap items-start justify-between gap-3 mb-2'>
                            <div>
                              {/* Job title, company, and AI match score */}
                              <h2 className='text-lg font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors'>
                                {job.title}
                              </h2>
                              <div className='flex items-center gap-2'>
                                <a
                                  href={job.company ? job.company.website : "#"}
                                  target='_blank'
                                  className='text-sm underline text-gray-600 dark:text-gray-300 hover:text-primary-500'>
                                  {job.company ? job.company.name : "Unknown Company"}
                                </a>
                                {/* Show AI match score if available */}
                                <div className='inline-flex items-center bg-gradient-to-r from-amber-500/20 to-amber-600/20 dark:from-amber-500/10 dark:to-amber-600/10 border border-amber-400/30 rounded-full px-2 py-0.5'>
                                  <Sparkles className='h-3 w-3 text-amber-400 mr-1 animate-pulse' />
                                  <span className='text-xs font-medium text-amber-700 dark:text-amber-300'>
                                    AI Match: {job.matchAnalysis?.score ?? "N/A"}%
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className='flex gap-2'>
                              {/* Save job button toggles saved state */}
                              <button
                                onClick={() => toggleSaveJob(job.id)}
                                className={`p-1.5 rounded-full transition-all ${
                                  savedJobs.includes(job.id)
                                    ? "text-primary-500 bg-gradient-to-r from-primary-100/80 to-primary-200/80 dark:from-primary-900/50 dark:to-primary-800/50"
                                    : "text-gray-500 hover:text-primary-500 bg-gray-100 dark:bg-gray-700 hover:bg-primary-100/50 dark:hover:bg-primary-900/20"
                                }`}>
                                <BookmarkPlus className='h-4 w-4' />
                              </button>
                              {/* Share button (functionality can be added) */}
                              <button className='p-1.5 rounded-full text-gray-500 hover:text-blue-500 bg-gray-100 dark:bg-gray-700 hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-all'>
                                <Share2 className='h-4 w-4' />
                              </button>
                            </div>
                          </div>

                          {/* Job metadata: location, type, posted time */}
                          <div className='flex flex-wrap gap-2 mb-3'>
                            <div className='flex items-center text-xs text-gray-700 dark:text-gray-300 bg-gray-100/50 dark:bg-gray-700/50 rounded-lg px-2.5 py-1.5'>
                              <MapPin className='h-3 w-3 mr-1.5 text-gray-500 dark:text-gray-400' />
                              <span>
                                {job.location} {job.isRemote && "(Remote)"}
                              </span>
                            </div>
                            <div className='flex items-center text-xs text-gray-700 dark:text-gray-300 bg-gray-100/50 dark:bg-gray-700/50 rounded-lg px-2.5 py-1.5'>
                              <Briefcase className='h-3 w-3 mr-1.5 text-gray-500 dark:text-gray-400' />
                              <span>{job.type}</span>
                            </div>
                            <div className='flex items-center text-xs text-gray-700 dark:text-gray-300 bg-gray-100/50 dark:bg-gray-700/50 rounded-lg px-2.5 py-1.5'>
                              <Clock className='h-3 w-3 mr-1.5 text-gray-500 dark:text-gray-400' />
                              <span>{timeAgo(job.postedAt)}</span>
                            </div>
                          </div>

                          {/* Why you match and what's missing, with expand/collapse */}
                          <div className='flex flex-col sm:flex-row gap-2 mb-3'>
                            {/* Show why you match if available */}
                            {job.matchAnalysis?.why?.length > 0 && (
                              <div className='flex-1'>
                                <button
                                  onClick={() => setWhyExpanded((prev) => ({ ...prev, [job.id]: !prev[job.id] }))}
                                  className={`w-full flex justify-between items-center p-2 text-xs rounded-lg transition-all ${
                                    whyExpanded[job.id]
                                      ? "bg-green-100/70 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                      : "bg-green-50/50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100/50 dark:hover:bg-green-900/30"
                                  }`}>
                                  <span>Why You Match</span>
                                  <ChevronDown className={`h-3 w-3 transition-transform ${whyExpanded[job.id] ? "rotate-180" : ""}`} />
                                </button>
                                {whyExpanded[job.id] && (
                                  <div className='mt-1 p-2 text-xs bg-white/50 dark:bg-gray-800/50 rounded-lg border border-green-200/50 dark:border-green-900/50 animate-slideDown'>
                                    <ul className='list-disc pl-4 space-y-1'>
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
                            {/* Show what's missing if available, with add skill button */}
                            {job.matchAnalysis?.missing?.length > 0 && (
                              <div className='flex-1'>
                                <button
                                  onClick={() => setMissingExpanded((prev) => ({ ...prev, [job.id]: !prev[job.id] }))}
                                  className={`w-full flex justify-between items-center p-2 text-xs rounded-lg transition-all ${
                                    missingExpanded[job.id]
                                      ? "bg-amber-100/70 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                                      : "bg-amber-50/50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-amber-900/30"
                                  }`}>
                                  <span>What's Missing</span>
                                  <ChevronDown className={`h-3 w-3 transition-transform ${missingExpanded[job.id] ? "rotate-180" : ""}`} />
                                </button>
                                {missingExpanded[job.id] && (
                                  <div className='mt-1 p-2 text-xs bg-white/50 dark:bg-gray-800/50 rounded-lg border border-amber-200/50 dark:border-amber-900/50 animate-slideDown'>
                                    <ul className='list-disc pl-4 space-y-1'>
                                      {job.matchAnalysis.missing.map((item, index) => (
                                        <li key={index} className='flex items-center justify-between text-gray-600 dark:text-gray-300'>
                                          {item}
                                          {/* Add missing skill to roadmap */}
                                          {!missingSkills.includes(item) && (
                                            <button
                                              onClick={() => handleAddMissingSkill(item)}
                                              className='ml-2 px-1.5 py-0.5 text-[0.65rem] rounded bg-blue-200 hover:bg-blue-300 text-blue-900 border border-blue-300 transition-colors'>
                                              + Add
                                            </button>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Expandable job description */}
                          {expandedJob === job.id && (
                            <div className='mt-2 pt-3 border-t border-gray-200/50 dark:border-gray-700/50 animate-fadeIn'>
                              <h3 className='text-sm font-semibold text-gray-900 dark:text-white mb-2'>Job Description</h3>
                              <p className='text-xs text-gray-600 dark:text-gray-300 mb-3 whitespace-pre-line'>{job.description}</p>
                            </div>
                          )}

                          {/* Button to expand/collapse job details */}
                          <button
                            onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                            className='mt-2 w-full py-1.5 text-center text-xs bg-gray-100/50 dark:bg-gray-700/50 hover:bg-gray-200/50 dark:hover:bg-gray-700 rounded-lg transition-colors'>
                            <div className='flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium'>
                              {expandedJob === job.id ? "Show less" : "Show full details"}
                              <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${expandedJob === job.id ? "rotate-180" : ""}`} />
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Footer with all job actions */}
                    <div className='bg-gradient-to-r from-gray-50/70 to-gray-100/70 dark:from-gray-800/70 dark:to-gray-900/70 px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-2 border-t border-gray-200/50 dark:border-gray-700/50'>
                      {/* Practice Interview navigates to interview page for this job */}
                      <Link
                        to={`/interview?jobId=${job.id}`}
                        className='w-full sm:w-auto text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium transition-all shadow-sm hover:shadow-md'>
                        Practice Interview
                      </Link>

                      {/* Open company/contact info modal */}
                      <button
                        onClick={() => openCompanyModal(job)}
                        className='w-full sm:w-auto text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium transition-all shadow-sm hover:shadow-md'>
                        Company & Contact Info
                      </button>

                      {/* Cover Letter and Resume generation/download */}
                      <div className='flex gap-2 w-full sm:w-auto'>
                        {/* Cover Letter: get or download if ready */}
                        <button
                          onClick={() =>
                            clState.status === "loaded" ? handleDownloadFile(job.id, "coverLetter") : handleGetCoverLetter(job)
                          }
                          disabled={clState.status === "loading" || !hasProfile}
                          className={`text-xs px-2 py-1.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md ${
                            clState.status === "loading"
                              ? "bg-gray-300 dark:bg-gray-600 text-gray-500"
                              : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                          }`}>
                          {clState.status === "loading" ? (
                            <Loader2 className='animate-spin h-3 w-3 mx-2' />
                          ) : clState.status === "loaded" ? (
                            "Download CL"
                          ) : (
                            "Get Cover Letter"
                          )}
                        </button>
                        {/* Resume: get or download if ready */}
                        <button
                          onClick={() => (resumeState.status === "loaded" ? handleDownloadFile(job.id, "resume") : handleGetResume(job))}
                          disabled={resumeState.status === "loading" || !hasProfile}
                          className={`text-xs px-2 py-1.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md ${
                            resumeState.status === "loading"
                              ? "bg-gray-300 dark:bg-gray-600 text-gray-500"
                              : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                          }`}>
                          {resumeState.status === "loading" ? (
                            <Loader2 className='animate-spin h-3 w-3 mx-2' />
                          ) : resumeState.status === "loaded" ? (
                            "Download Resume"
                          ) : (
                            "Get Resume"
                          )}
                        </button>
                      </div>

                      {/* Apply Now and alternate apply options */}
                      <div className='flex items-center w-full sm:w-auto'>
                        {/* Main apply link */}
                        <a
                          href={job.externalLink}
                          target='_blank'
                          className='flex-1 text-xs px-3 py-1.5 rounded-l-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium transition-all shadow-sm hover:shadow-md'>
                          Apply Now
                        </a>
                        {/* Dropdown for alternate apply options if available */}
                        {job.applyOptions && job.applyOptions.length > 0 && (
                          <div className='relative'>
                            <button
                              onClick={() => toggleApplyDropdown(job.id)}
                              className='h-full px-2 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-r-lg transition-colors'>
                              <ChevronDown className='h-3 w-3' />
                            </button>
                            {openApplyDropdownJobId === job.id && (
                              <div className='absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-30 overflow-hidden border border-gray-200 dark:border-gray-700 animate-fadeIn'>
                                <div className='py-1'>
                                  {job.applyOptions.map((option, index) => (
                                    <a
                                      key={index}
                                      href={option.apply_link}
                                      target='_blank'
                                      className='block px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0'
                                      onClick={() => setOpenApplyDropdownJobId(null)}>
                                      {option.publisher}
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
              <div className='bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-md p-8 text-center animate-fadeIn'>
                <div className='text-gray-500 dark:text-gray-400 mb-3'>
                  <Search className='h-8 w-8 mx-auto mb-2' />
                  <p className='text-sm font-medium'>No jobs found matching your criteria</p>
                </div>
                <button
                  onClick={() => setFilters({ search: "", location: "All", jobType: "All" })}
                  className='text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all shadow-sm'>
                  Reset Filters
                </button>
              </div>
            )}

            {/* Loading state */}
            {contextLoading && (
              <div className='flex items-center justify-center h-48'>
                <Loader2 className='animate-spin h-12 w-12 text-primary-600 dark:text-primary-400' />
              </div>
            )}
          </div>
        </div>
      </ProtectedRoute>
    </div>
  );
}
