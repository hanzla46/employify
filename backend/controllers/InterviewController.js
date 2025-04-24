const Interview = require("../models/InterviewModel");
const { GeneratePrompt } = require("../Services/InterviewPrompt");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { ProcessVideo } = require("../Services/ProcessVideo.Interview");
const Profile = require("../models/ProfileModel");

const startInterview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { position, company, industry, experience } = req.body.interviewData;

    // Update any existing ongoing interviews to 'completed'
    await Interview.updateMany(
      { userId, status: "ongoing" },
      { $set: { status: "completed" } }
    );

    let profile = await Profile.findOne({ userId });
    let userSkills = [];
    if (profile) {
      userSkills = profile.hardSkills;
    }

    const newInterview = new Interview({
      userId,
      status: "ongoing",
      position,
      company,
      industry,
      experience,
      questions: [],
      overallScore: 0,
      skills: userSkills,
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
      console.log( "No video file uploaded.");
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
    interview.questions.push({
      question,
      answer: answer + written,
      category,
      score: null,
      facialAnalysis: { emotions: [], expressionAnalysis: "" },
    }); 
    await interview.save();
    const previousInterviews = await Interview.find({
      userId,
      status: "completed",
    }).sort({ createdAt: -1 });

    const QId = interview.questions.length;
    if (req.file) {
      const videoFileBuffer = req.file.buffer;
      ProcessVideo(videoFileBuffer, QId, userId);
    }
    const prompt = GeneratePrompt(interview, previousInterviews);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const result = await model.generateContent(prompt);
    const content = result.response.candidates[0].content.parts[0].text;
    const jsonString = content.match(/```json\n([\s\S]*?)\n```/)[1];
    const parsedResult = JSON.parse(jsonString);

    const {
      aiSummary,
      currentAnalysis,
      generated_question,
      question_category,
      hypothetical_response,
      score,
      overallScore,
      completed,
    } = parsedResult;

    if (interview.questions.length > 1) {
      let lastQuestion = interview.questions[interview.questions.length - 2];
      lastQuestion.score = score;
      lastQuestion.analysis = currentAnalysis;
    }
    interview.aiSummary = aiSummary;
    await interview.save();

    res.status(200).json({
      aiSummary,
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
