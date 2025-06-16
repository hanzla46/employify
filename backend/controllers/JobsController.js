const axios = require("axios");
const Profile = require("../models/ProfileModel.js");
const Job = require("../models/JobModel");
const fs = require("fs");
const {
  CalculateRelevancyScores,
  getCoverLetterData,
  getNormalResumeData,
  getBestResumeData,
} = require("../Services/JobPrompts.js");
const getJobs = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await Profile.findOne({ userId });
    console.log("profile for jobs" + profile);
    if (
      !profile ||
      !profile.jobKeywords ||
      profile.jobKeywords.length <= 0 ||
      !profile.profileSummary ||
      profile.profileSummary.length <= 0
    ) {
      console.log("sending all jobs");
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
      locationOrRemoteConditions.push({ location: { $regex: userCityRegex } });
      const userCountryRegex = new RegExp(profile.location.country.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      locationOrRemoteConditions.push({
        location: { $regex: userCountryRegex },
      });
    }
    const finalQuery = {
      $and: [skillRegex ? { description: { $regex: skillRegex } } : { _id: null }, { $or: locationOrRemoteConditions }],
    };
    const matchingJobs = await Job.find(finalQuery).lean();
    console.log(`Found ${matchingJobs.length} matching jobs for user ${userId}.`);
    const jobAnalysis = await CalculateRelevancyScores(matchingJobs, profile);
    const analysisMap = new Map(jobAnalysis.map((analysis) => [analysis.id, analysis]));
    // console.log("Job Analysis:", analysisMap);

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
    const coverLetterText = await getCoverLetterData(summary, job);
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
    const { jobId, quality } = req.query;
    console.log("params: " + jobId + "  " + quality);
    const job = await Job.findOne({ id: jobId });
    if (quality.toLowerCase() === "normal") {
      const resumeBuffer = await getNormalResumeData(profile, job);
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="NormalResume_${job.id}_123.pdf"`,
      });
      res.end(resumeBuffer);
    } else if (quality.toLowerCase() === "best") {
      const resumeBuffer = await getBestResumeData(profile, job);
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="BestResume_${job.id}_123.pdf"`,
      });
      res.end(resumeBuffer);
    }
  } catch (error) {
    console.log("error while generating resume: " + error);
    res.status(500).json({ message: "Server Error!" });
  }
};
module.exports = { getJobs, generateCL, generateResume };
