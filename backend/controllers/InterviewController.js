const Interview = require("../models/InterviewModel");
const { ContinueInterviewAI, GetInterviewInfoAI, getSuggestedInterviewAI } = require("../Services/InterviewAI");
const { ProcessVideo } = require("../Services/ProcessMedia.Interview");
const Profile = require("../models/ProfileModel");
const Roadmap = require("../models/RoadmapModel");

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
const getAllInterviews = async (req, res) => {
  try {
    const userId = req.user._id;
    const AllInterviews = await Interview.find({ userId });
    console.log("all interviews: " + AllInterviews);
    res.status(200).json({ interviews: AllInterviews });
  } catch (err) {
    res.status(500).json({ message: "server error" });
  }
};

const getSuggestedInterview = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await Profile.findOne({ userId });
    if (!profile) return res.status(404).json({ message: "Profile not found", success: false });
    const roadmap = await Roadmap.findOne({ userId }).tasks;
    const interviews = await Interview.find({ userId, status: "completed" }).sort({ createdAt: -1 }).limit(3);
    if (!roadmap || interviews.length < 1)
      return res.status(201).json({ title: profile.careerGoal, interviewId: "", success: true });
    // 1. Get last 3 completed subtasks
    let completedSubtasks = [];
    if (Array.isArray(profile.roadmap)) {
      for (let i = profile.roadmap.length - 1; i >= 0 && completedSubtasks.length < 3; i--) {
        const task = profile.roadmap[i];
        if (Array.isArray(task.subtasks)) {
          for (let j = task.subtasks.length - 1; j >= 0 && completedSubtasks.length < 3; j--) {
            if (task.subtasks[j].completed) {
              completedSubtasks.push(task.subtasks[j].title);
            }
          }
        }
      }
    }

    // 2. Get careerPath
    const careerPath = profile.careerGoal || "";
    const ProfileSummary = profile.profileSummary || "";

    const weaknesses = interviews.map((i) => i.weaknesses).filter(Boolean);

    const { title, infoSummary } = await getSuggestedInterviewAI(
      completedSubtasks,
      careerPath,
      ProfileSummary,
      weaknesses
    );
    const newInterview = new Interview({
      userId,
      status: "ongoing",
      infoSummary,
      questions: [],
      overallScore: 0,
      aiSummary: "",
    });

    res.status(200).json({ title, interviewId: newInterview._id, success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
module.exports = { startInterview, continueInterview, getAllInterviews, getSuggestedInterview };
