const Roadmap = require("../models/RoadmapModel");
const Profile = require("../models/ProfileModel");
const { getKeywordsAndSummaryAI } = require("./ProfileAI");
//helper function to update roadmap dynamically

const updateUserProfile = async (userId) => {
  try {
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      console.error("Profile not found for user:", userId);
      return;
    }
    const keywordsAndSummary = await getKeywordsAndSummaryAI(profile);
    if (keywordsAndSummary.summary) profile.profileSummary = keywordsAndSummary.summary;
    if (keywordsAndSummary.jobKeywords) profile.jobKeywords = keywordsAndSummary.jobKeywords;
    console.log("Updating profile with new summary and keywords:", keywordsAndSummary);
    await profile.save();
  } catch (error) {
    console.error("Error updating user profile:", error);
  }
};
module.exports = { updateUserProfile };
