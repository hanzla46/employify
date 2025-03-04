const Interview = require("../models/InterviewModel");
const Skill = require("../models/Skills");
const { GeneratePrompt } = require("../models/GptPrompt");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const startInterview = async (req, res) => {
  try {
    const userId = req.user._id;

    let userSkills = await Skill.findOne({ userId });

    if (!userSkills) {
      // Placeholder skills if none exist
      userSkills = {
        skills: [
          {
            name: "Problem Solving",
            level: "Intermediate",
            experienceYears: 2,
          },
          { name: "Communication", level: "Advanced", experienceYears: 3 },
          { name: "Teamwork", level: "Beginner", experienceYears: 1 },
          { name: "Leadership", level: "Intermediate", experienceYears: 2 },
        ],
      };
    }

    const newInterview = new Interview({
      userId,
      status: "ongoing",
      questions: [
        {
          question: "Tell me about yourself.",
          answer: "not much",
          category: "General",
          score: null,
          facialAnalysis: [],
        },
      ],
      overallScore: 0,
      skills: userSkills.skills, // Use placeholder if needed
      aiSummary: "",
    });

    await newInterview.save();

    res.status(201).json({
      message: "Interview started successfully!",
      interviewId: newInterview._id,
      question: "Tell me about yourself.",
      category: "General",
      success: true,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error " + error, success: false });
  }
};

const continueInterview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { question, answer, category } = req.body;
    const videoFile = req.file;
    if (!question || !answer || !category) {
      return res.status(400).json({
        message: "Question, answer, and category are required.",
        success: false,
      });
    }
    const interview = await Interview.findOne({
      userId,
      status: "ongoing",
    }).sort({ createdAt: -1 });

    if (!interview) {
      return res
        .status(404)
        .json({ message: "No ongoing interview found.", success: false });
    }

    // Placeholder facial analysis (random values)
    const facialAnalysis = {
      timestamp: new Date(),
      emotions: {
        happy: Math.random().toFixed(2),
        sad: Math.random().toFixed(2),
        angry: Math.random().toFixed(2),
        surprised: Math.random().toFixed(2),
        disgusted: Math.random().toFixed(2),
        neutral: Math.random().toFixed(2),
      },
      intensity: Math.floor(Math.random() * 5) + 1, // Random intensity (1-5)
    };

    interview.questions.push({
      question,
      answer,
      category,
      score: null,
      facialAnalysis: [facialAnalysis],
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
    res
      .status(500)
      .json({ message: "Internal server error: " + error, success: false });
  }
};

module.exports = { startInterview, continueInterview };
