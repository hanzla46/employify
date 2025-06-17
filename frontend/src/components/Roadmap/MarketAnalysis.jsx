import React from "react";
import axios from "axios";
import { BarChart, Loader2, X } from "lucide-react";
import { handleError } from "../../utils";

// Skill patterns organized by category
const SKILL_PATTERNS = {
  programming: [
    "JavaScript",
    "Python",
    "Java",
    "C++",
    "TypeScript",
    "Ruby",
    "PHP",
    "Go",
    "Rust",
    "Swift",
    "Kotlin",
    "C#",
    "Scala",
    "Dart",
    "R",
  ],
  frameworks: [
    "React",
    "Angular",
    "Vue",
    "Next.js",
    "Node.js",
    "Express",
    "Django",
    "Flask",
    "Spring",
    "Laravel",
    "ASP.NET",
    "FastAPI",
    "NestJS",
  ],
  databases: ["SQL", "MongoDB", "PostgreSQL", "MySQL", "Redis", "Elasticsearch", "DynamoDB", "Cassandra", "Oracle", "Firebase"],
  cloud: ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "DevOps", "Terraform", "Jenkins", "CircleCI", "GitLab CI"],
  ai_ml: [
    "Machine Learning",
    "Artificial Intelligence",
    "Deep Learning",
    "TensorFlow",
    "PyTorch",
    "NLP",
    "Computer Vision",
    "Data Science",
    "Neural Networks",
  ],
  tools: [
    "Git",
    "GitHub",
    "VSCode",
    "Jira",
    "Confluence",
    "Figma",
    "Postman",
    "Linux",
    "Bash",
    "PowerShell",
    "Slack",
    "Notion",
    "Trello",
    "Excel",
    "Google Sheets",
  ],
  concepts: [
    "Web Development",
    "Frontend",
    "Backend",
    "Full Stack",
    "Mobile Development",
    "Cloud Computing",
    "API Design",
    "Microservices",
    "System Design",
  ],
  business: [
    "Project Management",
    "Agile",
    "Scrum",
    "Waterfall",
    "Lean",
    "OKRs",
    "KPIs",
    "Business Analysis",
    "Stakeholder Management",
    "Budgeting",
    "Forecasting",
    "Change Management",
    "Risk Management",
    "Business Intelligence",
    "Process Improvement",
  ],
  finance: [
    "Financial Analysis",
    "Accounting",
    "Bookkeeping",
    "Budget Planning",
    "Excel Modeling",
    "Cash Flow Management",
    "Cost Accounting",
    "Auditing",
    "Taxation",
    "QuickBooks",
    "Financial Reporting",
    "GAAP",
    "IFRS",
  ],
  marketing: [
    "SEO",
    "Content Marketing",
    "Social Media",
    "Email Marketing",
    "Google Analytics",
    "Branding",
    "Copywriting",
    "PPC",
    "Digital Marketing",
    "Market Research",
    "CRM",
    "HubSpot",
    "Marketing Automation",
    "Ad Campaigns",
    "Product Marketing",
  ],
  sales: [
    "Lead Generation",
    "CRM",
    "Salesforce",
    "Negotiation",
    "Cold Calling",
    "B2B Sales",
    "B2C Sales",
    "Customer Relationship Management",
    "Pipeline Management",
    "Account Management",
    "Sales Forecasting",
  ],
  design: [
    "UX Design",
    "UI Design",
    "Wireframing",
    "Prototyping",
    "Adobe XD",
    "Sketch",
    "Figma",
    "Design Thinking",
    "Graphic Design",
    "Brand Design",
    "User Research",
  ],
  legal: [
    "Contract Law",
    "Compliance",
    "Legal Research",
    "Corporate Law",
    "Intellectual Property",
    "Risk Assessment",
    "Legal Writing",
    "Litigation",
    "Regulatory Affairs",
  ],
  admin: [
    "Data Entry",
    "Calendar Management",
    "Travel Arrangements",
    "Document Management",
    "Office Management",
    "Customer Support",
    "Record Keeping",
    "Reception Duties",
  ],
};

// Flatten all skills into a single array
const ALL_SKILLS = Object.values(SKILL_PATTERNS).flat();

// Extract skills from text using regex
export const extractSkillsFromText = (text = "") => {
  if (!text) return [];

  const normalizedText = text.toLowerCase();
  return ALL_SKILLS.filter((skill) => {
    try {
      // Escape special regex characters in the skill name
      const escapedSkill = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // Create a regex that matches the skill as a whole word, case insensitive
      const regex = new RegExp(`\\b${escapedSkill}\\b`, "i");
      return regex.test(normalizedText);
    } catch (error) {
      console.error(`Error creating regex for skill "${skill}":`, error);
      return false;
    }
  });
};

// API function to fetch market analysis data
const fetchMarketAnalysis = async (skillName) => {
  if (!skillName) {
    console.error("No skill name provided for market analysis");
    return null;
  }

  try {
    const url = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const response = await axios.get(`${url}/roadmap/market-analysis`, {
      params: { skill: skillName.toLowerCase() },
      withCredentials: true,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      handleError(response.data.message || "Failed to fetch market analysis");
      return null;
    }
  } catch (error) {
    handleError("Failed to fetch market analysis");
    console.error("Market analysis error:", error);
    return null;
  }
};

// Custom hook for market analysis functionality
export const useMarketAnalysis = () => {
  const [marketAnalysisData, setMarketAnalysisData] = React.useState(null);
  const [showMarketModal, setShowMarketModal] = React.useState(false);
  const [selectedSkill, setSelectedSkill] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleMarketAnalysis = async (skillName) => {
    if (!skillName) return;

    setIsLoading(true);
    try {
      const data = await fetchMarketAnalysis(skillName);
      if (data) {
        setMarketAnalysisData(data);
        setSelectedSkill(skillName);
        setShowMarketModal(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const closeMarketModal = () => {
    setShowMarketModal(false);
    setMarketAnalysisData(null);
    setSelectedSkill(null);
  };

  return {
    marketAnalysisData,
    showMarketModal,
    selectedSkill,
    isLoading,
    handleMarketAnalysis,
    closeMarketModal,
  };
};

// Market Analysis Button Component
export const MarketAnalysisButton = ({ subtaskLabel, onAnalysis, isLoading }) => {
  const [showSkillDropdown, setShowSkillDropdown] = React.useState(false);
  const skills = extractSkillsFromText(subtaskLabel);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSkillDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (skills.length === 0) return null;

  const handleSkillSelect = (skill) => {
    onAnalysis(skill);
    setShowSkillDropdown(false);
  };

  return (
    <div className='relative' style={{ zIndex: 50 }} ref={dropdownRef}>
      <div className='absolute inset-0 z-0' onClick={() => setShowSkillDropdown(false)} />
      <button
        onClick={() => (skills.length === 1 ? onAnalysis(skills[0]) : setShowSkillDropdown(!showSkillDropdown))}
        disabled={isLoading}
        className='px-3 py-1 rounded text-xs font-medium bg-purple-100 hover:bg-purple-200 
                  dark:bg-purple-900/20 dark:hover:bg-purple-800/30 text-purple-700 dark:text-purple-300 
                  transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed relative z-50'>
        {isLoading ? <Loader2 size={12} className='animate-spin' /> : <BarChart size={12} />}
        <span>{isLoading ? "Loading..." : "Market Insights"}</span>
        {skills.length > 1 && !isLoading && <span className='ml-1 text-xs opacity-75'>({skills.length})</span>}
      </button>

      {showSkillDropdown && skills.length > 1 && (
        <div
          className='absolute left-28 mt-1 py-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700'
          style={{ zIndex: 100 }}>
          <div className='px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700'>
            Select skill to analyze
          </div>
          {skills.map((skill, index) => (
            <button
              key={index}
              onClick={() => handleSkillSelect(skill)}
              className='w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors'>
              {skill}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
import { useEffect } from "react";
// Market Analysis Modal Component
export const MarketAnalysisModal = ({ data, skillName, onClose }) => {
  if (!data || !skillName) return null;

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4' onClick={onClose}>
      <div
        className='bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl h-[90vh] transform transition-all animate-modal-slide-up flex flex-col'
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className='p-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2'>
              <BarChart className='text-purple-500' />
              {skillName}
            </h2>
            <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>Market Analysis & Insights</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className='rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'>
            <X size={20} className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200' />
          </button>
        </div>{" "}
        {/* Content */}
        <div className='flex-1 p-6 overflow-y-auto space-y-6'>
          {/* Market Demand Stats */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl shadow-sm'>
              <div className='text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1'>
                {data.marketDemand.totalJobs.toLocaleString()}
              </div>
              <div className='text-sm font-medium text-purple-700 dark:text-purple-300'>Active Job Listings</div>
            </div>
            <div className='bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl shadow-sm'>
              <div className='text-3xl font-bold text-green-600 dark:text-green-400 mb-1'>
                {data.marketDemand.trendingTechnologies.length}
              </div>
              <div className='text-sm font-medium text-green-700 dark:text-green-300'>Related Technologies</div>
            </div>
          </div>
          {/* Related Technologies Section */}
          <div className='bg-white dark:bg-gray-800/50 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700'>
            <h3 className='text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2'>
              <span className='w-2 h-2 bg-blue-500 rounded-full'></span>
              Related Technologies
            </h3>
            <div className='flex flex-wrap gap-2'>
              {data.marketDemand.trendingTechnologies.map((tech, index) => (
                <div
                  key={index}
                  className='bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 
                           text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium
                           hover:shadow-md transition-all duration-200 cursor-default
                           border border-gray-200 dark:border-gray-700'>
                  {tech.name}
                  <span className='ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full text-xs'>
                    {tech.frequency}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Requirements Section */}
          <div className='bg-white dark:bg-gray-800/50 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700'>
            <h3 className='text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2'>
              <span className='w-2 h-2 bg-purple-500 rounded-full'></span>
              Top Requirements
            </h3>
            <div className='space-y-3'>
              {data.jobRequirements.map((req, index) => (
                <div
                  key={index}
                  className='bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-sm flex justify-between items-center group hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'>
                  <span className='text-gray-700 dark:text-gray-300 flex-1'>{req.requirement}</span>
                  <span className='text-xs font-medium px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-full'>
                    {req.frequency} mentions
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className='p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center'>
          <span>Last updated: {new Date(data.marketDemand.lastUpdated).toLocaleDateString()}</span>
          <span className='text-purple-500 dark:text-purple-400'>Data based on real-time job market analysis</span>
        </div>
      </div>
    </div>
  );
};
