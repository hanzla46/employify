const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Interview = require("../models/InterviewModel");
const Skill = require("../models/Skills");
const { GeneratePrompt } = require("../models/GptPrompt");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const  {analyzeExpressions} = require("../Utils/FacialAnalysis");
const startInterview = async (req, res) => {
  try {
    const userId = req.user._id;
    const userSkills = await Skill.findOne({ userId });
    const newInterview = new Interview({
      userId,
      status: "ongoing",
      questions: [],
      facialAnalysis: {},
      overallScore: null,
      skills: userSkills ? userSkills.skills : [],
      aiSummary: "",
    });
    await newInterview.save();
    res.status(201).json({
      message: "Interview started successfully!",
      interviewId: newInterview._id,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
const continueInterview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { question, answer, category } = req.body;
    const videoFile = req.file;
    const interview = await Interview.findOne({
      userId,
      status: "ongoing",
    }).sort({ createdAt: -1 });
    if (!interview) {
      return res
        .status(404)
        .json({ message: "No ongoing interview found.", success: false });
    }
    const facialAnalysis = await analyzeExpressions(videoFile);
    interview.questions.push({
      question,
      answer,
      category,
      score: null,
      facialAnalysis: [
        {
          timestamp: new Date(),
          emotions: facialData.emotions,
          intensity: facialData.intensity,
        },
      ],
    });

    await interview.save();
    const savedInterview = await Interview.findOne({
      userId,
      status: "ongoing",
    }).sort({ createdAt: -1 });
    const prompt = GeneratePrompt(savedInterview);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generation_config: { response_mime_type: "application/json" },
    });
    const result = await model.generateContent(prompt);
    const {
      aiSummary,
      currentAnalysis,
      generated_question,
      question_category,
      hypothetical_response,
      score,
    } = JSON.parse(result);
    if (savedInterview.questions.length > 0) {
      let lastQuestion =
        savedInterview.questions[savedInterview.questions.length - 1];
      lastQuestion.score = score;
      lastQuestion.analysis = currentAnalysis;
    }
    savedInterview.save();
    res.status(200).json({
      message: "AI Summary, Score & Analysis updated successfully!",
      interview,
      nextQuestion: generated_question,
      nextCategory: question_category,
      hypotheticalResponse: hypothetical_response,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
module.exports = {
  startInterview,
  continueInterview,
};
