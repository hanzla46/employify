const Profile = require("../models/ProfileModel.js");
const { getKeywordsAndSummaryAI, getSubskillsAI } = require("../Services/ProfileAI.js");
const mime = require("mime-types");
const fs = require("fs");
const path = require("path");
const add = async (req, res) => {
  try {
    const userId = req.user._id;
    // Parse JSON fields from multipart/form-data
    const hardSkills = JSON.parse(req.body.hardSkills || "[]");
    const softSkills = JSON.parse(req.body.softSkills || "[]");
    const jobs = JSON.parse(req.body.jobs || "[]");
    const projects = JSON.parse(req.body.projects || "[]");
    const careerGoal = req.body.careerGoal || "";
    const location = JSON.parse(req.body.location || "{}");
    const education = req.body.education ? JSON.parse(req.body.education) : undefined;
    const linkedin = req.body.linkedin;
    const github = req.body.github;
    const phone = req.body.phone;
    // Handle resume file
    let resumePath = undefined;
    if (req.file) {
      // Save file path or buffer as needed
      resumePath = req.file;
      console.log("resume: " + resumePath.buffer);
    }
    let profile = await Profile.findOne({ userId });
    if (profile) {
      // Edit mode: update existing profile
      profile.hardSkills = hardSkills;
      profile.softSkills = softSkills;
      profile.jobs = jobs;
      profile.projects = projects;
      profile.careerGoal = careerGoal;
      profile.location = location;
      if (education) profile.education = education;
      if (linkedin !== undefined) profile.linkedin = linkedin;
      if (github !== undefined) profile.github = github;
      if (phone !== undefined) profile.phone = phone;
      await profile.save();
      console.log("Profile updated:", profile);
    } else {
      // Add mode: create new profile
      profile = new Profile({
        userId,
        hardSkills,
        softSkills,
        jobs,
        projects,
        careerGoal,
        location,
        education,
        linkedin,
        github,
        phone,
      });
      await profile.save();
      console.log("Profile created:", profile);
    }
    const keywordsAndSummary = await getKeywordsAndSummaryAI(profile);
    if (typeof keywordsAndSummary === "string") {
      if (keywordsAndSummary.startsWith("WRONG")) {
        return res.status(401).json({ message: "Wrong data", success: false });
      }
      if (keywordsAndSummary.startsWith("LLM_ERROR")) {
        return res.status(500).json({ message: "AI Engine error", success: false });
      }
    }
    const { summary, jobKeywords } = keywordsAndSummary;
    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: userId },
      { $set: { jobKeywords: jobKeywords, profileSummary: summary } },
      { new: true }
    );
    res.status(200).json({
      message: profile.isNew ? "profile added" : "profile updated",
      success: true,
      profileData: updatedProfile,
    });
  } catch (error) {
    console.error("Error adding/updating profile:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

const check = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("Checking existing profile for user:", userId);
    const existing = await Profile.findOne({ userId });
    if (existing) {
      console.log("Profile exists for user:", userId);
      return res.status(200).json({
        profile: true,
        success: true,
        profileData: existing,
        isEvaluated: existing.isEvaluated,
        careerPath: existing.careerGoal,
      });
    } else {
      console.log("No profile found for user:", userId);
      return res.status(200).json({ profile: false, success: true });
    }
  } catch (error) {
    console.error("Error checking profile:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

const getSubskills = async (req, res) => {
  try {
    const { skillName } = req.params;
    const subskills = await getSubskillsAI(skillName);
    res.json({
      success: true,
      subskills,
    });
  } catch (error) {
    console.error("Error in getSubskills:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subskills",
    });
  }
};

module.exports = { add, check, getSubskills };
