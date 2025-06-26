const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  hardSkills: [
    {
      name: { type: String, required: true },
      experience: { type: String, required: true },
      subskills: [String],
    },
  ],
  softSkills: [
    {
      name: { type: String, required: true },
      proficiency: { type: String, required: true },
    },
  ],
  jobs: [
    {
      title: { type: String, required: true },
      company: { type: String, required: true },
      startDate: { type: String, required: true },
      endDate: { type: String },
    },
  ],
  projects: [
    {
      name: { type: String, required: true },
      description: { type: String, default: "" },
    },
  ],
  education: [
    {
      degree: { type: String, required: true },
      institute: String,
      startYear: { type: String, required: true },
      endYear: { type: String, required: true },
    },
  ],
  careerGoal: { type: String, required: true },
  location: {
    city: { type: String, required: true },
    country: { type: String, required: true },
  },
  linkedin: { type: String },
  github: { type: String },
  phone: { type: String },
  resumeAnalysis: { type: String, default: "" },
  jobKeywords: [String],
  evaluationResult: { type: String, default: "" },
  profileSummary: String,
  isEvaluated: { type: Boolean, default: false },
});

const Profile = mongoose.model("Profile", ProfileSchema);

module.exports = Profile;
