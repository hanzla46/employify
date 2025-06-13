import React, { useState, useEffect, useContext } from "react";
import { Briefcase, MapPin, DollarSign, Clock, Search, BookmarkPlus, Share2, Mic, Sparkles, ChevronDown, Loader2 } from "lucide-react"; // Added Loader2
import ProtectedRoute from "../Context/ProtectedRoute";
import { JobsContext } from "../Context/JobsContext";
import { AuthContext } from "../Context/AuthContext";
import { useSearchParams, useLocation, Navigate, useNavigate, Link } from "react-router-dom";
import { handleError, handleSuccess } from "../utils";
import FancyButton from "../components/Button";
import { SkillsContext } from "../Context/SkillsContext";
const url = import.meta.env.VITE_API_URL;
import axios from "axios";

export function Jobs() {
  const { hasProfile } = useContext(SkillsContext);
  const { user } = useContext(AuthContext);
  const { jobs, savedJobs, setSavedJobs, filteredJobs, setFilteredJobs } = useContext(JobsContext);
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

  // State for Cover Letter and Resume generation
  const [jobActionStates, setJobActionStates] = useState({});
  const [activeResumeDropdown, setActiveResumeDropdown] = useState(null); // Stores jobId or null
  const [isOpenedsavedJobs, setIsOpenedSavedJobs] = useState(false);
  useEffect(() => {
    if (isOpenedsavedJobs) {
      return;
    }
    const urlFilters = {
      search: searchParams.get("search") || "",
      location: searchParams.get("location") || "All",
      jobType: searchParams.get("jobType") || "All",
    };
    setFilters(urlFilters);
  }, [isOpenedsavedJobs]);

  const shareJob = async (jobId) => {
    await navigator.clipboard.writeText(window.location.origin + "/job" + "?jobId=" + jobId);
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
    setUniqueLocations(["All", "Remote", ...new Set(jobs.map((item) => item.location).filter(Boolean))]);
    setUniqueJobTypes(["All", ...new Set(jobs.map((item) => item.type).filter(Boolean))]);
  }, [jobs]);

  useEffect(() => {
    const filtered = jobs.filter((job) => {
      return (
        (filters.search === "" ||
          job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          job.company.name.toLowerCase().includes(filters.search.toLowerCase())) &&
        (filters.location === "" ||
          filters.location === "All" ||
          (filters.location === "Remote" && job.isRemote) ||
          job.location === filters.location) &&
        (filters.jobType === "" || filters.jobType === "All" || job.type === filters.jobType)
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
  const openCloseSavedJobs = () => {
    if (isOpenedsavedJobs) {
      setFilters({
        search: "",
        location: "",
        jobType: "",
      });
      setIsOpenedSavedJobs(false);
      return;
    }
    let filteredJobs = jobs.filter((job) => savedJobs.includes(job.id));
    setFilteredJobs(filteredJobs);
    setIsOpenedSavedJobs(true);
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
        resumeNormal: { status: "idle" },
        resumeBest: { status: "idle" },
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

  const handleGetResume = async (job, quality) => {
    const { id, title, company } = job;
    const jobId = id;
    const actionKey = quality === "Normal" ? "resumeNormal" : "resumeBest";
    updateJobActionState(jobId, actionKey, { status: "loading" });
    setActiveResumeDropdown(null); // Close dropdown after selection

    try {
      const res = await axios.get(url + `/jobs/generateResume?quality=${quality}&jobId=${id}`, {
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
      updateJobActionState(jobId, actionKey, {
        status: "loaded",
        file: fileBlob,
        fileName: `${title.replace(/\W+/g, "_")}_${company.name.replace(/\W+/g, "_")}_Resume_${quality}.pdf`,
      });
      handleSuccess(`${quality} resume generated!`);
    } catch (error) {
      console.error(`Failed to get ${quality} resume:`, error);
      updateJobActionState(jobId, actionKey, { status: "error", file: null });
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

  // Common button classes
  const baseActionBtnClass =
    "flex-1 inline-flex items-center justify-center px-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl text-white";
  const disabledBtnClass = "opacity-70 cursor-not-allowed";
  const clBtnColors = "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800";
  const resumeBtnColors = "bg-gradient-to-r from-indigo-700 to-purple-700 hover:from-indigo-800 hover:to-purple-800";
  const dropdownItemClass =
    "w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center rounded-md";
  const dropdownItemDisabledClass = "opacity-60 cursor-not-allowed";

  return (
    <div className='min-h-screen bg-gradient-to-b pt-16 from-gray-50 to-white dark:from-gray-800 dark:to-gray-700'>
      {/* Header */}
      <header className='sticky top-11 z-10 bg-white dark:bg-gray-800 shadow-md'>
        <div className='container mx-auto px-2 py-2'>
          <div className='flex justify-between items-center'>
            <h1 className='text-xl font-bold text-primary-600 dark:text-primary-400'>Personalized Job Matching</h1>
            {!hasProfile && user ? (
              <div>
                {" "}
                <Link to={"/roadmap"}>
                  {" "}
                  <h2 className='text-red-600 dark:text-red-400 underline'>
                    ❗ Add Profile to unlock more features <span className='text-xl'>↗</span>
                  </h2>
                </Link>
              </div>
            ) : (
              ""
            )}
            <div className='hidden md:flex space-x-4'>
              <button
                onClick={() => {
                  openCloseSavedJobs();
                }}
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
            {!isOpenedsavedJobs && (
              <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8'>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                  <div className='md:col-span-2'>
                    <div className='relative'>
                      <input
                        type='text'
                        placeholder='Search job title, company, skill...'
                        className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      />
                      <Search className='absolute right-3 top-2.5 h-5 w-5 text-gray-500 dark:text-gray-400' />
                    </div>
                  </div>
                  <div>
                    <select
                      className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                      value={filters.location}
                      onChange={(e) => setFilters({ ...filters, location: e.target.value })}>
                      {uniqueLocations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                      value={filters.jobType}
                      onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}>
                      {uniqueJobTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className='mt-4 flex justify-end items-center'>
                  <div className='text-sm text-gray-600 dark:text-gray-300'>Found {filteredJobs.length} jobs</div>
                </div>
              </div>
            )}
            {/* Job listings */}
            <div className='space-y-6'>
              {filteredJobs.map((job) => {
                const clState = jobActionStates[job.id]?.coverLetter || { status: "idle" };
                const resumeNormalState = jobActionStates[job.id]?.resumeNormal || { status: "idle" };
                const resumeBestState = jobActionStates[job.id]?.resumeBest || { status: "idle" };

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
                              <a href={job.company.website} className='block underline text-gray-600 dark:text-gray-300 mb-2'>
                                {job.company.name}
                              </a>

                              {/* AI Score Badge */}
                              <div className='inline-flex items-center bg-gradient-to-r from-amber-500/20 to-amber-600/20 dark:from-amber-500/10 dark:to-amber-600/10 border border-amber-400/30 rounded-full px-3 py-1 mb-3'>
                                <Sparkles className='h-4 w-4 text-amber-400 mr-1' />
                                <span className='text-sm font-medium text-amber-700 dark:text-amber-300'>
                                  AI Match: {job.score ? job.score + "%" : "N/A"}
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
                          <div className='flex flex-wrap justify-around gap-3 mb-2'>
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

                          {/* Expandable Section */}
                          {expandedJob === job.id && (
                            <div className='mt-3 pt-4 border-t border-gray-200 dark:border-gray-700'>
                              <h3 className='font-bold text-gray-900 dark:text-white mb-3'>Job Description</h3>
                              <p className='text-gray-600 dark:text-gray-300 mb-6 whitespace-pre-line'>{job.description}</p>

                              <div className='w-1/3 flex flex-col sm:flex-row gap-3'>
                                <a
                                  href={job.company.website || `https://www.google.com/search?q=${job.company.name}`}
                                  target='_blank'
                                  className='flex-1 inline-flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
                                  View Company
                                </a>
                              </div>
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
                        <div className='flex-1 relative'>
                          <button
                            onClick={() => setActiveResumeDropdown(activeResumeDropdown === job.id ? null : job.id)}
                            disabled={resumeNormalState.status === "loading" || resumeBestState.status === "loading" || !hasProfile}
                            className={`w-full disabled:opacity-60 ${baseActionBtnClass} ${resumeBtnColors} ${
                              resumeNormalState.status === "loading" || resumeBestState.status === "loading" ? disabledBtnClass : ""
                            }`}>
                            {resumeNormalState.status === "loading" || resumeBestState.status === "loading" ? (
                              <>
                                <Loader2 className='animate-spin h-5 w-5 mr-2' /> Generating Resume...
                              </>
                            ) : (
                              <>
                                Get Resume{" "}
                                <ChevronDown
                                  className={`h-5 w-5 ml-2 transition-transform ${activeResumeDropdown === job.id ? "rotate-180" : ""}`}
                                />
                              </>
                            )}
                          </button>
                          {activeResumeDropdown === job.id && (
                            <div className='absolute bottom-full mb-2 w-full rounded-md shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black dark:ring-gray-700 ring-opacity-5 p-1 space-y-1 z-20'>
                              {/* Normal Quality Resume Button */}
                              <button
                                onClick={() =>
                                  resumeNormalState.status === "loaded"
                                    ? handleDownloadFile(job.id, "resumeNormal")
                                    : handleGetResume(job, "Normal")
                                }
                                disabled={resumeNormalState.status === "loading"}
                                className={`${dropdownItemClass} ${
                                  resumeNormalState.status === "loading"
                                    ? dropdownItemDisabledClass
                                    : "hover:bg-primary-50 dark:hover:bg-primary-700/30"
                                }`}>
                                {resumeNormalState.status === "loading" ? (
                                  <>
                                    <Loader2 className='animate-spin h-4 w-4 mr-2' /> Normal...
                                  </>
                                ) : resumeNormalState.status === "loaded" ? (
                                  `Download Normal (${resumeNormalState.fileName?.split(".").pop() || "file"})`
                                ) : resumeNormalState.status === "error" ? (
                                  "Retry Normal"
                                ) : (
                                  "Normal Quality"
                                )}
                              </button>
                              {/* Best Quality Resume Button */}
                              <button
                                onClick={() =>
                                  resumeBestState.status === "loaded"
                                    ? handleDownloadFile(job.id, "resumeBest")
                                    : handleGetResume(job, "Best")
                                }
                                disabled={resumeBestState.status === "loading"}
                                className={`${dropdownItemClass} ${
                                  resumeBestState.status === "loading"
                                    ? dropdownItemDisabledClass
                                    : "hover:bg-primary-50 dark:hover:bg-primary-700/30"
                                }`}>
                                {resumeBestState.status === "loading" ? (
                                  <>
                                    <Loader2 className='animate-spin h-4 w-4 mr-2' /> Best...
                                  </>
                                ) : resumeBestState.status === "loaded" ? (
                                  `Download Best (${resumeBestState.fileName?.split(".").pop() || "file"})`
                                ) : resumeBestState.status === "error" ? (
                                  "Retry Best"
                                ) : (
                                  "Best Quality"
                                )}
                              </button>
                            </div>
                          )}
                        </div>
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
                      location: "",
                      jobType: "",
                      featured: false,
                    })
                  }>
                  Clear all filters
                </button>
              </div>
            )}

            {/* Loading state */}
            {jobs.length === 0 && (
              <div className='flex items-center justify-center h-64'>
                <Loader2 className='animate-spin h-10 w-10 text-primary-600 dark:text-primary-400' />
              </div>
            )}
          </div>
        </div>
      </ProtectedRoute>
      {/* Footer */}
    </div>
  );
}
