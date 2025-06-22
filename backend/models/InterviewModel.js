const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String },
  category: { type: String },
  score: { type: String, default: "0" },
  analysis: { type: String, default: "" },
  facialAnalysis: {
    timestamp: { type: Date, default: Date.now },
    emotions: [
      {
        emotion: { type: String, required: true },
        intensity: { type: Number, default: 0 },
      },
    ],
    expressionAnalysis: { type: String, default: "" },
  },
  audioAnalysis: {
    timestamp: { type: Date, default: Date.now },
    transcript: { type: String, default: "" },
    clarity: { type: String, default: "" },
    confidence: { type: String, default: "" },
    paceAndTone: { type: String, default: "" },
    fillerWords: [{ type: String }],
  },
});

const interviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, default: "" },
  startTime: { type: Date, default: Date.now },
  infoSummary: { type: String, default: "" },
  questions: { type: [questionSchema], default: [] },
  overallScore: { type: String, default: "0" },
  aiSummary: { type: String, default: "" },
  weaknesses: { type: String, default: "" },
});

module.exports = mongoose.model("Interview", interviewSchema);
