const mongoose = require("mongoose");

const SkillMarketDataSchema = new mongoose.Schema({
  skill: { type: String, required: true, unique: true },
  jobRequirements: [
    {
      requirement: String,
      frequency: Number, // How many jobs mention this requirement
      lastUpdated: Date,
    },
  ],
  marketDemand: {
    totalJobs: Number, // Total number of jobs mentioning this skill
    averageSalary: Number,
    trendingTechnologies: [
      {
        name: String,
        frequency: Number,
      },
    ],
    lastUpdated: Date,
  },
});

const MarketAnalysis = mongoose.model("MarketAnalysis", SkillMarketDataSchema);
module.exports = MarketAnalysis;
