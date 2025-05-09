const Interview = require("../models/InterviewModel");
const { GeneratePrompt, GetInterviewInfo } = require("../Services/InterviewPrompt");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { ProcessVideo } = require("../Services/ProcessVideo.Interview");
const Profile = require("../models/ProfileModel");

const startInterview = async (req, res) => {
  try {
    const userId = req.user._id;
    await Interview.updateMany({ userId, status: "ongoing" }, { $set: { status: "completed" } });
    const interviewData = req.body.interviewData;
    const job = req.body.job;
    const jobOrMock = req.body.jobOrMock;
    const profile = await Profile.findOne({ userId });
    const previousInterviews = await Interview.find({
      userId,
      status: "completed",
    }).sort({ createdAt: -1 });
    const infoSummary = await GetInterviewInfo(profile, jobOrMock, job, interviewData, previousInterviews);
    if (infoSummary.startsWith("WRONG")) {
      return res.status(401).json({ message: "fake input!!!", success: false });
    }
    const newInterview = new Interview({
      userId,
      status: "ongoing",
      infoSummary,
      questions: [],
      overallScore: 0,
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
    console.error("Error in startInterview:", error); // More detailed error logging
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};

const continueInterview = async (req, res) => {
  try {
    console.log("Continue Interview Request:", req.body);
    console.log("Request Files:", req.file);
    const userId = req.user._id;
    const { question, written, answer, category } = req.body;
    if (!req.file) {
      console.log("No video file uploaded.");
    }

    const interview = await Interview.findOne({
      userId,
      status: "ongoing",
    }).sort({ createdAt: -1 });
    if (!interview) {
      return res.status(404).json({ message: "No ongoing interview found.", success: false });
    }
    interview.questions.push({
      question,
      answer: answer + written,
      category,
      score: null,
      facialAnalysis: { emotions: [], expressionAnalysis: "" },
    });
    await interview.save();

    const QId = interview.questions.length;
    if (req.file) {
      const videoFileBuffer = req.file.buffer;
      ProcessVideo(req.file, QId, userId);
    }
    const prompt = GeneratePrompt(interview);
    console.log("interview prompt: " + prompt);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const result = await model.generateContent(prompt);
    const content = result.response.candidates[0].content.parts[0].text;
    const jsonString = content.match(/```json\n([\s\S]*?)\n```/)[1];
    const parsedResult = JSON.parse(jsonString);

    const {
      overallAnalysis,
      currentAnalysis,
      generated_question,
      question_category,
      hypothetical_response,
      score,
      overallScore,
      completed,
      weknesses,
    } = parsedResult;

    if (interview.questions.length > 1) {
      let lastQuestion = interview.questions[interview.questions.length - 2];
      lastQuestion.score = score;
      lastQuestion.analysis = currentAnalysis;
    }
    interview.weknesses = weknesses;
    interview.aiSummary = overallAnalysis;
    await interview.save();

    res.status(200).json({
      aiSummary: currentAnalysis,
      overallAnalysis,
      question: generated_question,
      category: question_category,
      hypotheticalResponse: hypothetical_response,
      success: true,
      completed: completed,
      score,
      overallScore,
      prompt,
    });
  } catch (error) {
    console.error("Error in continueInterview:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};

module.exports = { startInterview, continueInterview };
