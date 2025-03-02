const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, required: true },
  score: { type: Number, default: null },
  analysis: { type: String, default: "" },
  facialAnalysis: [
    {
      timestamp: { type: Date, default: Date.now },
      emotions: {
        happy: { type: Number, default: 0 },
        sad: { type: Number, default: 0 },
        angry: { type: Number, default: 0 },
        surprised: { type: Number, default: 0 },
        disgusted: { type: Number, default: 0 },
        neutral: { type: Number, default: 0 },
      },
      intensity: { type: Number, default: 0 },
    },
  ],
});

const interviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startTime: { type: Date, default: Date.now },
  questions: [questionSchema],
  skills: [
    {
      name: { type: String, required: true },
      level: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        required: true,
      },
      experienceYears: { type: Number, required: true },
    },
  ],
  overallScore: { type: Number, default: 0 },
  aiSummary: { type: String, default: "" },
});

module.exports = mongoose.model("Interview", interviewSchema);
