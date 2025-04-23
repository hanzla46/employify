import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, DollarSign, Clock, Search, Filter, BookmarkPlus, Share2, ChevronRight, Star, StarHalf, Menu, X } from 'lucide-react';

export function Jobs() {
  useEffect(() => {
      document.title = "Jobs | Employify AI";
    }, []);
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'TechCorp',
      companyLogo: '/api/placeholder/48/48',
      location: 'San Francisco, CA',
      salary: '$120k - $180k',
      type: 'Full-time',
      posted: '2 days ago',
      skills: ['React', 'TypeScript', 'GraphQL', 'Tailwind'],
      rating: 4.8,
      description: 'Join our team to build innovative web applications using modern frontend technologies. You will be responsible for creating responsive user interfaces and maintaining high-quality code.',
      featured: true
    },
    {
      id: 2,
      title: 'Backend Engineer',
      company: 'DataFlow Systems',
      companyLogo: '/api/placeholder/48/48',
      location: 'Remote',
      salary: '$100k - $150k',
      type: 'Full-time',
      posted: '1 week ago',
      skills: ['Node.js', 'Python', 'PostgreSQL', 'REST API'],
      rating: 4.2,
      description: 'Help us develop scalable backend systems for our data processing platform. You will work with a variety of technologies to build efficient and reliable services.',
      featured: false
    },
    {
      id: 3,
      title: 'DevOps Engineer',
      company: 'CloudScale',
      companyLogo: '/api/placeholder/48/48',
      location: 'New York, NY',
      salary: '$130k - $190k',
      type: 'Full-time',
      posted: '3 days ago',
      skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD'],
      rating: 4.5,
      description: 'Join our infrastructure team to build and maintain cloud-based systems. You will automate deployments, optimize performance, and ensure reliability of our platform.',
      featured: true
    },
    {
      id: 4,
      title: 'UX/UI Designer',
      company: 'DesignHub',
      companyLogo: '/api/placeholder/48/48',
      location: 'Boston, MA',
      salary: '$90k - $130k',
      type: 'Contract',
      posted: '5 days ago',
      skills: ['Figma', 'Adobe XD', 'UI/UX', 'Prototyping'],
      rating: 4.0,
      description: 'Create beautiful and intuitive user interfaces for our products. You will work closely with developers and product managers to bring designs to life.',
      featured: false
    }
  ]);
  
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    jobType: '',
    featured: false
  });
  
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);
  const [expandedJob, setExpandedJob] = useState(null);
  
  // Filter jobs based on search and filter criteria
  const filteredJobs = jobs.filter(job => {
    return (
      (filters.search === '' || 
        job.title.toLowerCase().includes(filters.search.toLowerCase()) || 
        job.company.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(filters.search.toLowerCase()))) &&
      (filters.location === '' || job.location.includes(filters.location)) &&
      (filters.jobType === '' || job.type === filters.jobType) &&
      (!filters.featured || job.featured)
    );
  });
  
  const toggleSaveJob = (jobId) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter(id => id !== jobId));
    } else {
      setSavedJobs([...savedJobs, jobId]);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b pt-16 from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
      {/* Header */}
      <header className="sticky top-12 z-10 bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">Personalized Job Matching</h1>
            <div className="hidden md:flex space-x-4">
              <button className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">Jobs</button>
              <button className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">Companies</button>
              <button className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">Saved ({savedJobs.length})</button>
            </div>
            <button className="md:hidden text-gray-600 dark:text-gray-300" onClick={() => setMobileFiltersOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>
      
      {/* Mobile filters sidebar */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex md:hidden">
          <div className="w-80 bg-white dark:bg-gray-800 p-4 h-full ml-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold dark:text-white">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)}>
                <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Job title, company, skill..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                  />
                  <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-500 dark:text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                >
                  <option value="">All Locations</option>
                  <option value="San Francisco">San Francisco</option>
                  <option value="New York">New York</option>
                  <option value="Remote">Remote</option>
                  <option value="Boston">Boston</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Type</label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={filters.jobType}
                  onChange={(e) => setFilters({...filters, jobType: e.target.value})}
                >
                  <option value="">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Part-time">Part-time</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured-mobile"
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                  checked={filters.featured}
                  onChange={(e) => setFilters({...filters, featured: e.target.checked})}
                />
                <label htmlFor="featured-mobile" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Featured jobs only
                </label>
              </div>
              <div className="pt-4">
                <button className="w-full bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Search and filters section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search job title, company, skill..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                  />
                  <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-500 dark:text-gray-400" />
                </div>
              </div>
              <div>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                >
                  <option value="">All Locations</option>
                  <option value="San Francisco">San Francisco</option>
                  <option value="New York">New York</option>
                  <option value="Remote">Remote</option>
                  <option value="Boston">Boston</option>
                </select>
              </div>
              <div>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={filters.jobType}
                  onChange={(e) => setFilters({...filters, jobType: e.target.value})}
                >
                  <option value="">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Part-time">Part-time</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                  checked={filters.featured}
                  onChange={(e) => setFilters({...filters, featured: e.target.checked})}
                />
                <label htmlFor="featured" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Featured jobs only
                </label>
              </div>
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
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-200 ${
                  job.featured ? 'border-l-4 border-primary-500' : ''
                } ${expandedJob === job.id ? 'ring-2 ring-primary-500' : ''}`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex">
                      <div className="mr-4 flex-shrink-0">
                        <img 
                          src={job.companyLogo} 
                          alt={`${job.company} logo`}
                          className="w-12 h-12 rounded-md bg-gray-200 object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center mb-1">
                          <h2 className="text-xl font-semibold dark:text-white mr-2">{job.title}</h2>
                          {job.featured && (
                            <span className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-xs font-medium px-2 py-0.5 rounded-full">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-1">{job.company}</p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center mr-2">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            <span>{job.rating}</span>
                          </div>
                          <span className="text-gray-300 dark:text-gray-600 mx-1">•</span>
                          <span>{job.posted}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => toggleSaveJob(job.id)}
                        className={`p-2 rounded-full ${
                          savedJobs.includes(job.id) 
                            ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        <BookmarkPlus className="h-5 w-5" />
                      </button>
                      <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        <Share2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <MapPin className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                      {job.location}
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
                      {job.posted}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  {expandedJob === job.id && (
                    <div className="mt-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Job Description</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">{job.description}</p>
                      <div className="flex flex-col sm:flex-row sm:justify-between space-y-3 sm:space-y-0">
                        <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40">
                          View Company Profile
                        </button>
                        <button className="inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600">
                          Easy Apply
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <button 
                    className="mt-2 flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium"
                    onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                  >
                    {expandedJob === job.id ? 'Show less' : 'Show more'}
                    <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${expandedJob === job.id ? 'rotate-90' : ''}`} />
                  </button>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-750 px-6 py-3 flex justify-between items-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Be an early applicant
                  </div>
                  <button className="bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* No results state */}
          {filteredJobs.length === 0 && (
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
                onClick={() => setFilters({search: '', location: '', jobType: '', featured: false})}
              >
                Clear all filters
              </button>
            </div>
          )}
          
          {/* Pagination */}
          {filteredJobs.length > 0 && (
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
    </div>
  );
}