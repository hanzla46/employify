const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  careerGoal: { type: String, required: true },
  hardSkills: [
    {
      name: { type: String, required: true },
      experience: { type: String, required: true } // e.g., "1.5 years"
    }
  ],
  softSkills: [
    {
      name: { type: String, required: true },
      proficiency: { type: String, required: true } // e.g., "Intermediate"
    }
  ],
  jobs: [
    {
      role: { type: String, required: true },
      company: { type: String, required: true },
      duration: { type: String, required: true }
    }
  ],
  projects: [{ type: String, required: true }],
  industryAwareness: [{ type: String }]
});

const Profile = mongoose.model('Profile', ProfileSchema);

module.exports = Profile;