const axios = require("axios");
const Profile = require("../models/ProfileModel.js");
const Job = require("../models/JobModel");
const User = require("../models/User.js");
const fs = require("fs");
const { CalculateRelevancyScoresAI, getCoverLetterDataAI, getResumeDataAI } = require("../Services/JobsAI.js");
// Helper function to split array into chunks
const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};
const getJobs = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await Profile.findOne({ userId });

    // Get jobs not older than 10 days
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    // Base query to exclude old jobs
    const baseQuery = { postedAt: { $gte: tenDaysAgo } };

    if (
      !profile ||
      !profile.jobKeywords ||
      profile.jobKeywords.length <= 0 ||
      !profile.profileSummary ||
      profile.profileSummary.length <= 0
    ) {
      console.log("sending all recent jobs");
      const jobs = await Job.find();
      return res.status(200).json({ message: "fetched all jobs", jobs: jobs });
    }

    let skillRegex = null;
    if (profile.jobKeywords && profile.jobKeywords.length > 0) {
      const skillWords = profile.jobKeywords.map((s) => s.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
      const pattern = skillWords.join("|");
      skillRegex = new RegExp(pattern, "i");
    }

    const locationOrRemoteConditions = [{ isRemote: true }];
    if (profile.location) {
      const userCityRegex = new RegExp(profile.location.city.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      // Match either job.location or job.city with user's city
      locationOrRemoteConditions.push({
        $or: [{ location: { $regex: userCityRegex } }, { city: { $regex: userCityRegex } }],
      });

      const userCountryRegex = new RegExp(profile.location.country.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      locationOrRemoteConditions.push({
        location: { $regex: userCountryRegex },
      });
    }
    const finalQuery = {
      $and: [
        baseQuery,
        skillRegex ? { description: { $regex: skillRegex } } : { _id: null },
        { $or: locationOrRemoteConditions },
      ],
    };
    const matchingJobs = await Job.find(finalQuery).lean();
    console.log(`Found ${matchingJobs.length} matching jobs for user ${userId}.`);

    // Split jobs into chunks of 50
    const jobChunks = chunkArray(matchingJobs, 50);
    console.log(`Split jobs into ${jobChunks.length} chunks of 50 jobs each`); // Process each chunk in parallel and ensure we get analysis for each job
    const analysisResults = await Promise.all(
      jobChunks.map(async (chunk) => {
        try {
          const chunkAnalysis = await CalculateRelevancyScoresAI(chunk, profile);
          return chunk.map((job) => {
            const analysis = chunkAnalysis.find((a) => a.id === job._id.toString());
            return (
              analysis || {
                id: job._id.toString(),
                score: 0,
                why: [],
                missing: [],
                email: {},
              }
            );
          });
        } catch (err) {
          console.error(`AI analysis failed for a chunk:`, err);
          return chunk.map((job) => ({
            id: job._id.toString(),
            score: 0,
            why: ["AI analysis failed"],
            missing: [],
            email: {},
          }));
        }
      })
    );

    // Combine all analysis results
    const jobAnalysis = analysisResults.flat();
    const analysisMap = new Map(jobAnalysis.map((analysis) => [analysis.id, analysis]));

    const sortedJobs = matchingJobs
      .map((job) => ({
        ...job,
        matchAnalysis: analysisMap.get(job._id.toString()) || {
          score: 0,
          why: [],
          missing: [],
        },
      }))
      .sort((a, b) => b.matchAnalysis.score - a.matchAnalysis.score);
    res.status(200).json({ message: "fetched matching jobs", jobs: sortedJobs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching jobs", error: error.message });
  }
};
const generateCL = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await Profile.findOne({ userId });
    const summary = profile.profileSummary || "User is reactjs developer with 2 years experience";
    console.log("summary: " + summary);
    const { jobId } = req.query;
    const job = await Job.findOne({ id: jobId });
    if (!job) {
      console.log("no job found");
      res.status(400).json({ message: "no job" });
    } else {
      console.log("job found: " + job);
    }
    const coverLetterText = await getCoverLetterDataAI(summary, job);
    const buffer = Buffer.from(coverLetterText, "utf-8");
    res.set({
      "Content-Type": "text/plain",
      "Content-Disposition": `attachment; filename="CoverLetter_${userId}_${job.company.name}.txt"`,
      "Cache-Control": "no-cache",
    });
    res.send(buffer);
  } catch (error) {
    console.log("error while generating cover letter: " + error);
    res.status(500).json({ message: "Server Error!" });
  }
};
const generateResume = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await Profile.findOne({ userId });
    const user = await User.findOne({ _id: userId });
    profile.name = user.name;
    profile.email = user.email;
    const { jobId } = req.query;
    console.log("params: " + jobId);
    const job = await Job.findOne({ id: jobId });
    const resumeBuffer = await getResumeDataAI(profile, job);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="NormalResume_${job.id}_123.pdf"`,
    });
    res.end(resumeBuffer);
  } catch (error) {
    console.log("error while generating resume: " + error);
    res.status(500).json({ message: "Server Error!" });
  }
};
const getCompanyEmails = async (req, res) => {
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
        "x-rapidapi-key": "ff82a3cb34msh70d1e319df0556bp1011c1jsnf3a797ae2c39",
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
module.exports = { getJobs, generateCL, generateResume, getCompanyEmails };
