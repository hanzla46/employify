require("dotenv").config();
const axios = require("axios");
const mongoose = require("mongoose");
const cron = require("node-cron");
const Job = require("../models/JobModel");
const MarketAnalysis = require("../models/MarketAnalysisModel");

const apiKeys = process.env.RAPIDAPI_KEYS ? process.env.RAPIDAPI_KEYS.split(",").map((key) => key.trim()) : [];
let keyIndex = 0;

function getNextApiKey() {
  const key = apiKeys[keyIndex];
  keyIndex = (keyIndex + 1) % apiKeys.length;
  return key;
}
// Skill extraction regex patterns
const SKILL_PATTERNS = {
  programming: /\b(JavaScript|Python|Java|C\+\+|Ruby|PHP|Go|Rust|Swift|Kotlin|TypeScript|C#|Scala|Dart|R)\b/gi,
  frameworks: /\b(React|Angular|Vue|Django|Flask|Spring|Laravel|Express|Next\.js|Node\.js|ASP\.NET|FastAPI|NestJS)\b/gi,
  databases: /\b(SQL|MongoDB|PostgreSQL|MySQL|Redis|Elasticsearch|DynamoDB|Cassandra|Oracle|Firebase)\b/gi,
  cloud: /\b(AWS|Azure|GCP|Docker|Kubernetes|DevOps|Terraform|Jenkins|CircleCI|GitLab CI)\b/gi,
  ai_ml:
    /\b(Machine Learning|Deep Learning|TensorFlow|PyTorch|NLP|Computer Vision|AI|Artificial Intelligence|Data Science|Neural Networks)\b/gi,
  tools:
    /\b(Git|GitHub|VSCode|Jira|Confluence|Figma|Postman|Linux|Bash|PowerShell|Slack|Notion|Trello|Excel|Google Sheets)\b/gi,
  business:
    /\b(Project Management|Agile|Scrum|Waterfall|Lean|OKRs|KPIs|Business Analysis|Stakeholder Management|Budgeting|Forecasting|Change Management|Risk Management|Business Intelligence|Process Improvement)\b/gi,
  finance:
    /\b(Financial Analysis|Accounting|Bookkeeping|Budget Planning|Excel Modeling|Cash Flow Management|Cost Accounting|Auditing|Taxation|QuickBooks|Financial Reporting|GAAP|IFRS)\b/gi,
  marketing:
    /\b(SEO|Content Marketing|Social Media|Email Marketing|Google Analytics|Branding|Copywriting|PPC|Digital Marketing|Market Research|CRM|HubSpot|Marketing Automation|Ad Campaigns|Product Marketing)\b/gi,
  sales:
    /\b(Lead Generation|CRM|Salesforce|Negotiation|Cold Calling|B2B Sales|B2C Sales|Customer Relationship Management|Pipeline Management|Account Management|Sales Forecasting)\b/gi,
  design:
    /\b(UX Design|UI Design|Wireframing|Prototyping|Adobe XD|Sketch|Figma|Design Thinking|Graphic Design|Brand Design|User Research)\b/gi,
  legal:
    /\b(Contract Law|Compliance|Legal Research|Corporate Law|Intellectual Property|Risk Assessment|Legal Writing|Litigation|Regulatory Affairs)\b/gi,
  admin:
    /\b(Data Entry|Calendar Management|Travel Arrangements|Document Management|Office Management|Customer Support|Record Keeping|Reception Duties)\b/gi,
};

// API Configurations
const GLASSDOOR_API_CONFIG = {
  method: "GET",
  url: "https://real-time-glassdoor-data.p.rapidapi.com/company-search",
  headers: {
    "x-rapidapi-key": "be6e459e24msha7b59aacb49a197p18a90fjsndc025d66ac28",
    "x-rapidapi-host": "real-time-glassdoor-data.p.rapidapi.com",
  },
};

const JSEARCH_API_CONFIG = {
  method: "GET",
  url: "https://jsearch.p.rapidapi.com/search",
  headers: {
    "X-RapidAPI-Key": "73dfebafaamsh693cbbe6778ea66p17cf03jsn44cb2f06bfe0",
    "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
  },
};

// Extract skills from job description
function extractSkills(description = "") {
  let skills = new Set();
  try {
    Object.values(SKILL_PATTERNS).forEach((pattern) => {
      const matches = description.match(pattern) || [];
      matches.forEach((skill) => skills.add(skill.toLowerCase()));
    });
  } catch (error) {
    console.error("Error extracting skills:", error);
  }
  return Array.from(skills);
}

// Logging function for cleanup process
async function logCleanupStats() {
  try {
    const totalJobs = await Job.countDocuments();
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const oldJobs = await Job.countDocuments({ postedAt: { $lt: tenDaysAgo } });
    const recentJobs = await Job.countDocuments({ postedAt: { $gte: tenDaysAgo } });

    console.log("Job Database Statistics:");
    console.log("------------------------");
    console.log(`Total jobs: ${totalJobs}`);
    console.log(`Jobs older than 10 days: ${oldJobs}`);
    console.log(`Recent jobs (≤10 days): ${recentJobs}`);
    console.log("------------------------");
  } catch (error) {
    console.error("Error logging cleanup stats:", error);
  }
}

// Cleanup old jobs and update market analysis
async function cleanupOldJobs() {
  try {
    console.log("Starting job cleanup process...");
    await logCleanupStats();

    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const oldJobs = await Job.find({ postedAt: { $lt: tenDaysAgo } });
    console.log(`Found ${oldJobs.length} jobs older than 10 days`);

    if (oldJobs.length > 0) {
      const skillsToUpdate = new Set();
      oldJobs.forEach((job) => {
        const jobSkills = extractSkills(job.description);
        jobSkills.forEach((skill) => skillsToUpdate.add(skill));
      });

      for (const skill of skillsToUpdate) {
        const analysis = await MarketAnalysis.findOne({ skill: skill.toLowerCase() });
        if (analysis) {
          const currentJobs = await Job.find({
            description: new RegExp(skill, "i"),
            postedAt: { $gte: tenDaysAgo },
          });
          analysis.marketDemand.totalJobs = currentJobs.length;
          analysis.marketDemand.lastUpdated = new Date();
          await analysis.save();
        }
      }

      const deleteResult = await Job.deleteMany({ postedAt: { $lt: tenDaysAgo } });
      console.log(`Deleted ${deleteResult.deletedCount} old jobs`);
    }

    console.log("Job cleanup process completed successfully");
    console.log("\nAfter cleanup:");
    await logCleanupStats();
  } catch (error) {
    console.error("Error during job cleanup:", error);
  }
}

// Extract requirements that co-occur with a skill
function extractRequirementsForSkill(description = "", skill = "") {
  try {
    const sentences = description.split(/[.!?]+/);
    const requirements = sentences
      .filter((sentence) => sentence.toLowerCase().includes(skill.toLowerCase()))
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 0);
    return requirements;
  } catch (error) {
    console.error(`Error extracting requirements for skill ${skill}:`, error);
    return [];
  }
}

// Fetch and normalize Glassdoor company data
async function getCompanyData(companyName) {
  try {
    const response = await axios.request({
      ...GLASSDOOR_API_CONFIG,
      headers: {
        ...GLASSDOOR_API_CONFIG.headers,
        "x-rapidapi-key": getNextApiKey(),
      },
      params: {
        query: companyName,
        limit: "1",
        domain: "www.glassdoor.com",
      },
    });

    const rawData = response.data?.data?.[0];
    if (!rawData) return null;

    return {
      glassdoorId: rawData.company_id,
      name: rawData.name,
      rating: rawData.rating,
      reviewCount: rawData.review_count,
      salaryCount: rawData.salary_count,
      size: rawData.company_size,
      industry: rawData.industry,
      workLifeBalance: rawData.work_life_balance_rating,
      careerGrowth: rawData.career_opportunities_rating,
      ceo: {
        name: rawData.ceo,
        approval: rawData.ceo_rating,
      },
      competitors: rawData.competitors?.map((c) => c.name) || [],
      locations: rawData.office_locations,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error(`[Glassdoor] Failed for ${companyName}:`, error.message);
    return null;
  }
}

// Process jobs with company data enrichment
async function processJobs(jobs, work_from_home) {
  const processedJobs = [];
  const companyCache = new Map();

  for (const job of jobs) {
    try {
      const jobCopy = {
        title: job.job_title,
        id: job.job_id,
        company: {
          name: job.employer_name,
          logo: job.employer_logo,
          website: job.employer_website,
        },
        type: job.job_employment_type,
        salary: job.salary_min ? `${job.job_min_salary} - ${job.job_max_salary}` : 0,
        description: job.job_description,
        location: job.job_city,
        postedAt: new Date(job.job_posted_at_datetime_utc),
        source: "jsearch",
        externalLink: job.job_apply_link,
        applyOptions: job.apply_options,
        isRemote: work_from_home == "true" ? true : false,
        qualifications: job.job_highlights?.Qualifications || [],
        responsibilities: job.job_highlights?.Responsibilities || [],
      };

      if (job.employer_name || job.employer_website) {
        if (companyCache.has(job.employer_name)) {
          jobCopy.companyData = companyCache.get(job.employer_name);
        } else {
          const companyData = await getCompanyData(job.employer_name);
          if (companyData) {
            companyCache.set(job.employer_name, companyData);
            jobCopy.companyData = companyData;
            jobCopy.companyId = companyData.glassdoorId;
          }
        }
      }

      processedJobs.push(jobCopy);
    } catch (error) {
      console.error(`Error processing job ${job.job_id}:`, error.message);
      processedJobs.push(job);
    }
  }
  return processedJobs;
}

// Update market analysis with processed jobs
async function updateMarketAnalysis(jobs = []) {
  if (!jobs || jobs.length === 0) return;

  console.log(`Processing ${jobs.length} jobs for market analysis...`);
  const skillData = new Map();

  for (const job of jobs) {
    try {
      const skills = extractSkills(job.job_description);
      const salary = job.salary_max || job.salary_min || 0;

      skills.forEach((skill) => {
        if (!skillData.has(skill)) {
          skillData.set(skill, {
            jobCount: 0,
            salarySum: 0,
            requirements: new Map(),
            relatedTech: new Map(),
          });
        }

        const data = skillData.get(skill);
        data.jobCount++;
        data.salarySum += salary;

        extractRequirementsForSkill(job.job_description, skill).forEach((req) => {
          data.requirements.set(req, (data.requirements.get(req) || 0) + 1);
        });

        skills.forEach((otherSkill) => {
          if (otherSkill !== skill) {
            data.relatedTech.set(otherSkill, (data.relatedTech.get(otherSkill) || 0) + 1);
          }
        });
      });
    } catch (error) {
      console.error("Error processing job:", error);
    }
  }

  for (const [skill, data] of skillData.entries()) {
    try {
      const requirements = Array.from(data.requirements.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([req, freq]) => ({ requirement: req, frequency: freq }));

      const trendingTech = Array.from(data.relatedTech.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tech, freq]) => ({ name: tech, frequency: freq }));

      const marketData = {
        skill: skill.toLowerCase(),
        jobRequirements: requirements,
        marketDemand: {
          totalJobs: data.jobCount,
          averageSalary: Math.round(data.salarySum / data.jobCount),
          trendingTechnologies: trendingTech,
          lastUpdated: new Date(),
        },
      };

      await MarketAnalysis.findOneAndUpdate({ skill: skill.toLowerCase() }, marketData, { upsert: true, new: true });
      console.log(`Updated market analysis for skill: ${skill}`);
    } catch (error) {
      console.error(`Error updating market analysis for skill ${skill}:`, error);
    }
  }
}

// Main job fetching function
const autoFetchJobs = async () => {
  const countries = ["PK", "US", "IN", "GB", "CA", "DE", "SG", "AU", "NL", "KE"];
  const queries = [
    "Backend Developer",
    "Software Engineer",
    "Full Stack Developer",
    "Frontend Developer",
    "DevOps Engineer",
    "AI Engineer",
    "Machine Learning Engineer",
    "Data Scientist",
    "Data Engineer",
    "Cloud Solutions Architect",
    "Cybersecurity Analyst",
    "Embedded Systems Engineer",
    "QA Automation Engineer",
    "Site Reliability Engineer",
    "Product Manager",
    "Product Owner",
    "UX Designer",
    "UI Designer",
    "Design Researcher",
    "Technical Writer",
    "Business Analyst",
    "Operations Manager",
    "Financial Analyst",
    "Project Coordinator",
    "Program Manager",
    "Strategy Consultant",
    "Compliance Analyst",
    "Marketing Specialist",
    "Growth Hacker",
    "Digital Marketing Manager",
    "SEO Analyst",
    "Sales Development Representative",
    "Customer Success Manager",
  ];

  const workModes = ["true", "false"];
  let keyIndex = 0;

  for (const country of countries) {
    for (const query of queries) {
      for (const work_from_home of workModes) {
        let page = 1;
        while (page <= 100) {
          try {
            const response = await axios.request({
              ...JSEARCH_API_CONFIG,
              params: {
                query: `${query} jobs`,
                page: page,
                num_pages: "10",
                work_from_home: work_from_home,
                country: country,
              },
              headers: {
                ...JSEARCH_API_CONFIG.headers,
                "X-RapidAPI-Key": getNextApiKey(),
              },
            });

            let jobs = response.data.data;
            if (jobs && jobs.length > 0) {
              jobs = await processJobs(jobs, work_from_home);
              await Job.insertMany(jobs, { ordered: false });
              await updateMarketAnalysis(jobs);
              console.log(`Processed ${jobs.length} jobs from ${country} for query "${query}"`);
            }
            page += 10;
          } catch (error) {
            console.error(`Error fetching jobs for ${country}, ${query}, page ${page}:`, error.message);
            break;
          }
        }
      }
    }
  }
  console.log("Job fetching and market analysis complete 🔥🧠");
};

// Schedule jobs
async function scheduleJobs() {
  try {
    const MONGODB_URL = process.env.MONGODB_URL;
    if (!MONGODB_URL) throw new Error("MONGODB_URL not found in environment variables");

    await mongoose.connect(MONGODB_URL);
    console.log("Connected to MongoDB successfully");

    cron.schedule("0 0 * * *", async () => {
      console.log("Running scheduled job cleanup...");
      await cleanupOldJobs();
    });

    cron.schedule("0 */6 * * *", async () => {
      console.log("Running scheduled job fetch...");
      await autoFetchJobs();
    });

    await cleanupOldJobs();
    await autoFetchJobs();
  } catch (error) {
    console.error("Error in job scheduling:", error);
    process.exit(1);
  }
}

// Script entry point
if (require.main === module) {
  let cleanup = async () => {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
    } catch (error) {
      console.error("Error closing MongoDB connection:", error);
    }
    process.exit();
  };

  process.on("SIGTERM", cleanup);
  process.on("SIGINT", cleanup);

  scheduleJobs().catch((error) => {
    console.error("Failed to start job scheduler:", error);
    cleanup();
  });
}
