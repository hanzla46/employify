const Interview = require("../models/InterviewModel");
const { ContinueInterviewAI, GetInterviewInfoAI } = require("../Services/InterviewAI");
const { ProcessVideo } = require("../Services/ProcessMedia.Interview");
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
    const infoSummary = await GetInterviewInfoAI(profile, jobOrMock, job, interviewData, previousInterviews);
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
    const introInterviewQuestions = [
      "Can you briefly introduce yourself?",
      "Walk me through your background. ",
      "How do you describe yourself in one sentence? ",
      "What’s your story?",
      "What excites you the most about this opportunity? ",
    ];
    const randomIntroQ = introInterviewQuestions[Math.floor(Math.random() * introInterviewQuestions.length)];
    res.status(201).json({
      message: "Interview started successfully!",
      interviewId: newInterview._id,
      question: randomIntroQ,
      category: "General",
      success: true,
    });
  } catch (error) {
    console.error("Error in startInterview:", error);
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
    const video = req.files?.video?.[0];
    const audio = req.files?.audio?.[0];

    const userId = req.user._id;
    const { question, written, answer, category } = req.body;

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
    if (video) {
      console.log("Video received - Size:", video.size / 1024 / 1024, "MB, Type:", video.mimetype);
      ProcessVideo(video, QId, userId);
    } else {
      console.log("No video file uploaded.");
    }
    const result = await ContinueInterviewAI(interview);

    console.log("Parsed Result:", result);
    const {
      overallAnalysis,
      currentAnalysis,
      generated_question,
      question_category,
      hypothetical_response,
      score,
      overallScore,
      completed,
      weaknesses,
    } = result;

    if (interview.questions.length > 1) {
      let lastQuestion = interview.questions[interview.questions.length - 2];
      lastQuestion.score = score;
      lastQuestion.analysis = currentAnalysis;
    }
    interview.weaknesses = weaknesses;
    interview.aiSummary = overallAnalysis;
    await interview.save();

    res.status(200).json({
      aiSummary: currentAnalysis,
      overallAnalysis,
      question: generated_question,
      category: question_category,
      hypotheticalResponse: hypothetical_response,
      success: true,
      completed,
      score,
      overallScore,
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
