const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  id: { type: String, required: true },
  company: {
    name: String,
    logo: String,
    website: String,
  },
  location: String,
  type: { type: String, default: "Full-time" },
  salary: Number,
  skills: [String],
  description: String,
  postedAt: { type: Date, default: Date.now },
  source: {
    type: String,
    enum: ["jsearch", "fantastic_jobs", "manual"],
    required: true,
  },
  externalLink: String,
  isRemote: { type: Boolean, default: false },
  applyOptions: [
    {
      publisher: { type: String },
      apply_link: String,
      is_direct: { type: Boolean, default: false },
    },
  ],
  qualifications: [String],
  responsibilities: [String],
});

module.exports = mongoose.model("Job", JobSchema);
