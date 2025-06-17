require("dotenv").config();
const axios = require("axios");
const mongoose = require("mongoose");
const Job = require("../models/JobModel");
const MarketAnalysis = require("../models/MarketAnalysisModel");

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

async function updateMarketAnalysis(jobs = []) {
  if (!jobs || jobs.length === 0) {
    console.log("No jobs provided for market analysis update");
    return;
  }

  console.log(`Processing ${jobs.length} jobs for market analysis...`);
  const skillData = new Map();

  // Process each job
  jobs.forEach((job) => {
    try {
      const skills = extractSkills(job.job_description);
      console.log(`Found skills in job ${job._id}:`, skills);
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

        // Extract requirements specific to this skill
        const requirements = extractRequirementsForSkill(job.job_description, skill);
        requirements.forEach((req) => {
          data.requirements.set(req, (data.requirements.get(req) || 0) + 1);
        });

        // Count co-occurring technologies
        skills.forEach((otherSkill) => {
          if (otherSkill !== skill) {
            data.relatedTech.set(otherSkill, (data.relatedTech.get(otherSkill) || 0) + 1);
          }
        });
      });
    } catch (error) {
      console.error("Error processing job:", error);
    }
  });

  // Update database
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
    "Software Engineer",
    "Full Stack Developer",
    "Frontend Developer",
    "Backend Developer",
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
  const apiKeys = ["ff82a3cb34msh70d1e319df0556bp1011c1jsnf3a797ae2c39"];

  function getNextApiKey() {
    const key = apiKeys[keyIndex];
    keyIndex = (keyIndex + 1) % apiKeys.length;
    return key;
  }

  for (const country of countries) {
    for (const query of queries) {
      for (const work_from_home of workModes) {
        let page = 1;
        while (page <= 100) {
          try {
            const options = {
              method: "GET",
              url: "https://jsearch.p.rapidapi.com/search",
              params: {
                query: `${query} jobs`,
                page: page,
                num_pages: "20",
                work_from_home: work_from_home,
                country: country,
              },
              headers: {
                "X-RapidAPI-Key": getNextApiKey(),
                "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
              },
            };

            const response = await axios.request(options);
            const jobs = response.data.data;

            if (jobs && jobs.length > 0) {
              await Job.insertMany(jobs, { ordered: false });
              await updateMarketAnalysis(jobs);
              console.log(`Processed ${jobs.length} jobs from ${country} for query "${query}"`);
            }

            page = page + 20;
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

// Script entry point
(async () => {
  try {
    const MONGODB_URL = process.env.MONGODB_URL;
    if (!MONGODB_URL) {
      throw new Error("MONGODB_URL not found in environment variables");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB 🐱‍👤");

    await autoFetchJobs();
  } catch (error) {
    console.error("Script failed:", error);
  } finally {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
    } catch (error) {
      console.error("Error closing MongoDB connection:", error);
    }
    process.exit();
  }
})();
