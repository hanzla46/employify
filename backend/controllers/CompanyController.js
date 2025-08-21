const axios = require("axios");
const Company = require("../models/CompanyModel");

// API Configurations for Glassdoor
const GLASSDOOR_API_CONFIG = {
  method: "GET",
  url: "https://real-time-glassdoor-data.p.rapidapi.com/company-search",
  headers: {
    "x-rapidapi-key": process.env.RAPIDAPI_KEYS?.split(",")[0] || "",
    "x-rapidapi-host": "real-time-glassdoor-data.p.rapidapi.com",
  },
};

// Helper to fetch company data from Glassdoor
async function fetchCompanyDataFromAPI(url) {
  try {
    const response = await axios.request({
      ...GLASSDOOR_API_CONFIG,
      params: {
        query: url,
        limit: "1",
        domain: "www.glassdoor.com",
      },
    });
    console.log("Glassdoor API response:", response.data);
    const rawData = response.data?.data?.[0];
    if (!rawData) return null;
    return {
      glassdoorId: rawData.company_id,
      name: rawData.name,
      url: rawData.website || "",
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
    console.error(`[Glassdoor] Failed for ${url}:`, error.message);
    return null;
  }
}

// Controller function
exports.getCompanyData = async (req, res) => {
  const { name, url } = req.query;
  console.log("getCompanyData called with:", { name, url });
  if (!name && !url) {
    return res.status(400).json({ error: "Missing company name or url in query parameter" });
  }
  try {
    // Try to find by url if provided, else by name
    let company = null;
    if (url) {
      company = await Company.findOne({ url });
    }
    if (!company && name) {
      company = await Company.findOne({ name });
    }
    if (company) {
      return res.json(company);
    }
    // Not found, fetch from API
    const apiData = await fetchCompanyDataFromAPI(url || name);
    console.log("Fetched from API:", apiData);
    if (!apiData) {
      return res.status(404).json({ error: "Company data not found" });
    }
    // Save to DB (ensure url is set)
    if (!apiData.url && url) apiData.url = url;
    // const saved = await Company.create(apiData);
    return res.json({ companyData: apiData, success: true });
  } catch (err) {
    console.error("Error in getCompanyData controller:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
exports.getCompanyEmails = async (req, res) => {
  try {
    const { url } = req.query;
    console.log("Fetching emails for company URL:", url);
    const options = {
      method: "GET",
      url: "https://company-contact-scraper.p.rapidapi.com/search-by-url",
      params: {
        url: url,
        "phone-limit": "100",
        "email-limit": "100",
        "filter-personal-emails": "false",
      },
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEYS?.split(",")[0] || "",
        "x-rapidapi-host": "company-contact-scraper.p.rapidapi.com",
      },
    };
    try {
      const response = await axios.request(options);
      console.log(response.data);
      res.status(200).json({ success: true, emails: response.data.emails, phones: response.data.phones });
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 404) {
        res.status(404).json({ message: "No emails found for this company." });
      } else {
        res.status(500).json({ message: "Error fetching company emails." });
      }
    }
  } catch (error) {
    console.error("Error fetching company emails:", error);
    res.status(500).json({ message: "Server Error!" });
  }
};
