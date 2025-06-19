const Profile = require("../models/ProfileModel.js");
const { getKeywordsAndSummaryAI, getSubskillsAI } = require("../Services/ProfileAI.js");
const mime = require("mime-types");
const add = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("checking existing profile");
    const { hardSkills, softSkills, jobs, projects, careerGoal, location } = req.body;
    console.log("Creating new profile");
    const profile = new Profile({
      userId,
      hardSkills,
      softSkills,
      jobs,
      projects,
      careerGoal,
      location,
    });
    console.log("Profile data:", profile);
    await profile.save();
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
    console.log("Updated profile with keywords:", updatedProfile);
    res.status(200).json({ message: "profile added", success: true });
  } catch (error) {
    console.error("Error adding profile:", error);
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
      return res
        .status(200)
        .json({ profile: true, success: true, isEvaluated: existing.isEvaluated, careerPath: existing.careerGoal });
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
