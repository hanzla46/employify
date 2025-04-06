const Profile = require("../models/ProfileModel.js");
const add = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("checking existing profile");
    // Check if the user already has a profile
    // const existing = Profile.findOne({ userId });
    // if (existing) {
    //     console.log("Profile already exists for user:", userId);
    //   return res
    //     .status(400)
    //     .json({ message: "Profile already exists", success: false });
    // }
    const { hardSkills, softSkills, jobs, projects, careerGoal } = req.body;
    console.log("Creating new profile");
    const profile = new Profile({
      userId,
      hardSkills,
      softSkills,
      jobs,
      projects,
      careerGoal,
    });
    console.log("Profile data:", profile);
    await profile.save();
    res.status(200).json({ message: "profile added", success: true });
  } catch (error) {
    console.error("Error adding profile:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
const update = async (req, res) => {
  res.status(201).json({ message: "profile updated" });
};
module.exports = { add, update };
