const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  hardSkills: [
    {
      id: { type: Number, required: true },
      name: { type: String, required: true },
      experience: { type: String, required: true }, // e.g., "1.5 years"
    },
    { _id: false },
  ],
  softSkills: [
    {
      id: { type: Number, required: true },
      name: { type: String, required: true },
      proficiency: { type: String, required: true }, // e.g., "Intermediate"
    },
    { _id: false },
  ],
  jobs: [
    {
      id: { type: Number, required: true },
      title: { type: String, required: true },
      company: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
    { _id: false },
  ],
  projects: [
    {
      id: { type: Number, required: true },
      name: { type: String, required: true },
    },
    { _id: false },
  ],
  education: [
    {
      id: { type: Number, required: true },
      degree: { type: String, required: true },
      field: { type: String, required: true },
      startYear: { type: Date, required: true },
      endYear: { type: Date, required: true },
    },
    { _id: false },
  ],
  careerGoal: { type: String, required: true },
  location: {
    city: { type: String, required: true },
    country: { type: String, required: true },
  },
  jobKeywords: [String],
  evaluationResult: { type: String, default: "" },
  profileSummary: String,
  isEvaluated: { type: Boolean, default: false },
});

const Profile = mongoose.model("Profile", ProfileSchema);

module.exports = Profile;
