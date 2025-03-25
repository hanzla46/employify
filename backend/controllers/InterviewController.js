const Interview = require("../models/InterviewModel");
const Skill = require("../models/Skills");
const { GeneratePrompt } = require("../models/GptPrompt");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { ProcessVideo } = require("../Services/ProcessVideo.Interview");

const startInterview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { position, company, industry, experience } = req.body.interviewData;

    // Update any existing ongoing interviews to 'completed'
    await Interview.updateMany(
      { userId, status: "ongoing" },
      { $set: { status: "completed" } }
    );

    let userSkills = await Skill.findOne({ userId });

    // Use a more robust default skills object if none are found
    if (!userSkills) {
      userSkills = {
        skills: [], // Start with an empty array
      };
    }

    const newInterview = new Interview({
      userId,
      status: "ongoing",
      position,
      company,
      industry,
      experience,
      questions: [
        {
          question: "Tell me about yourself.",
          answer: "not much", //  Consider removing the default answer
          category: "General",
          score: null,
          facialAnalysis: [], // Start with an empty array
        },
      ],
      overallScore: 0,
      skills: userSkills.skills,
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
    res
      .status(500)
      .json({
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

    // --- Get the video file buffer from req.file (provided by multer) ---
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No video file uploaded.", success: false });
    }
    console.log("before file buffer");
    const videoFileBuffer = req.file.buffer;
    console.log("after file buffer");
    const interview = await Interview.findOne({
      userId,
      status: "ongoing",
    }).sort({ createdAt: -1 });
    if (!interview) {
      return res
        .status(404)
        .json({ message: "No ongoing interview found.", success: false });
    }

    // --- Add the new question and answer to the interview ---
    interview.questions.push({
      question,
      answer: answer + written, // Combine spoken and written answers
      category,
      score: null, // Score will be updated later
      facialAnalysis: [], // Will be populated later
    });
    await interview.save();

    // --- Process the video *without* awaiting the result ---
    const QId = interview.questions.length;
    ProcessVideo(videoFileBuffer, QId, userId); // Don't await

    // --- Generate the next question using Gemini ---
    const prompt = GeneratePrompt(interview); // Pass the updated interview
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
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

    // --- Update the *previous* question's score and analysis ---
    if (interview.questions.length > 1) {
      // Check if there's a previous question
      let lastQuestion = interview.questions[interview.questions.length - 2]; // Get the *second to last* question (the one we just answered)
      lastQuestion.score = score;
      lastQuestion.analysis = currentAnalysis;
    }

    // --- Save the interview with the updated scores ---
    await interview.save();

    res.status(200).json({
      aiSummary,
      question: generated_question,
      category: question_category,
      hypotheticalResponse: hypothetical_response,
      success: true,
      completed: completed,
      score, // Send the score of the *previous* question
      overallScore, // Overall score so far
    });
  } catch (error) {
    console.error("Error in continueInterview:", error);
    res
      .status(500)
      .json({
        message: "Internal server error",
        success: false,
        error: error.message,
      });
  }
};

module.exports = { startInterview, continueInterview };
