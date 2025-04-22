const { GoogleGenerativeAI } = require("@google/generative-ai");
const Interview = require("../models/InterviewModel");

const ProcessVideo = async (videoFile, QId, userId) => {
  try {
    console.log("Processing the video...");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    function fileToGenerativePart(videoFile) {
      const base64EncodedData = videoFile.toString("base64");
      return {
        inlineData: {
          data: base64EncodedData,
          mimeType: "video/mp4", // Or the correct MIME type
        },
      };
    }
    if (!videoFile) {
      console.error("No video file provided for processing.");
      return;
    }
    const videoPart = fileToGenerativePart(videoFile);
    const prompt = `Analyze this video and provide insights on the person's facial expressions and emotions. Remember that the person is giving an interview. Your output should be: top 3 emotions with intensity from 0 to 1 and a one-sentence summary of the person's movement. Response should be in JSON and like this: array of objects of emotion and intensity and then a string of summary and then length of video in seconds. If you find no person, you can give random output of emotions and summary.`;

    const result = await model.generateContent([prompt, videoPart]);
    const response = await result.response;
    const text = response.text();
    const jsonString = text.match(/```json\n([\s\S]*?)\n```/)[1];
    const parsedResult = JSON.parse(jsonString);

    console.log("Gemini Response:", text);
    console.log("Parsed Result:", parsedResult);

    const interview = await Interview.findOne({
      userId,
      status: "ongoing",
    }).sort({ createdAt: -1 });
    if (!interview) {
      console.error("No ongoing interview found for user:", userId);
      return;
    }

    const questionIndex = QId - 1; // Adjust index for zero-based array
    if (!interview.questions[questionIndex]) {
      console.error("No question found for QId:", QId);
      return;
    }

    // Add facial analysis to the specific question
    interview.questions[questionIndex].facialAnalysis = {
      timestamp: new Date(),
      emotions: parsedResult.emotions || [],
      expressionAnalysis: parsedResult.summary || "",
    };

    await interview.save();
    console.log("Facial analysis added to question:", QId);
  } catch (error) {
    console.error("Error processing video with Gemini:", error);
    // DO NOT re-throw here. We want the main interview flow to continue.
  }
};

module.exports = { ProcessVideo };
