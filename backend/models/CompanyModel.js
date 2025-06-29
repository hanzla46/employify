const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true, unique: true },
  glassdoorId: String,
  rating: Number,
  reviewCount: Number,
  salaryCount: Number,
  size: String,
  industry: String,
  workLifeBalance: Number,
  careerGrowth: Number,
  ceo: {
    name: String,
    approval: Number,
  },
  competitors: [String],
  locations: [String],
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Company", CompanySchema);
