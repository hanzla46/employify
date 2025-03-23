const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  hardSkills: [
    {
      id: { type: Number, required: true },
      name: { type: String, required: true },
      experience: { type: String, required: true }, // e.g., "1.5 years"
    },
  ],
  softSkills: [
    {
      id: { type: Number, required: true },
      name: { type: String, required: true },
      proficiency: { type: String, required: true }, // e.g., "Intermediate"
    },
  ],
  jobs: [
    {
      id: { type: Number, required: true },
      title: { type: String, required: true },
      company: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
  ],
  projects: [
    {
      id: { type: Number, required: true },
      name: { type: String, required: true },
      description: { type: String, required: true },
    },
  ],
});

const Profile = mongoose.model("Profile", ProfileSchema);

module.exports = Profile;
