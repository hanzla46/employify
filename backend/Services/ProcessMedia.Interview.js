const Interview = require("../models/InterviewModel");
const { GoogleGenAI } = require("@google/genai");
const path = require("path");
const fs = require("fs").promises;

const ProcessVideo = async (videoFile, QId, userId) => {
  try {
    console.log("Processing the video...");
    const safeFileName = `${userId}_${QId}_${videoFile.originalname}`;
    const filePath = path.join(__dirname, "uploads", safeFileName);
    await fs.writeFile(filePath, videoFile.buffer);

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API,
    });
    const modelName = "gemini-2.5-flash";
    let files;
    let config;
    try {
      console.log("Starting video file upload...");
      files = [await ai.files.upload({ file: filePath })];
      await fs.unlink(filePath);
      config = {
        responseMimeType: "text/plain",
      };
      console.log(`Video uploaded successfully. File URI: ${files[0].uri}, File Name: ${files[0].name}`);
    } catch (error) {
      console.error("Error uploading video file:", error);
      throw new Error("Failed to upload video for processing.");
    }
    const prompt = `Analyze this video and provide insights on the person's facial expressions and emotions. Remember that the person is giving an interview. Your output should be: top 3 emotions with intensity from 0 to 1 and a one-sentence summary of the person's movement. Response should be in JSON and like this: array of objects of emotion and intensity and then a string of summary and then length of video in seconds. If you find no person, you can give random output of emotions and summary.`;
    const contents = [
      {
        role: "user",
        parts: [
          {
            fileData: {
              fileUri: files[0].uri,
              mimeType: files[0].mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    ];
    let parsedResult = null;
    try {
      console.log("Generating content from video...");
      const result = await ai.models.generateContent({
        model: modelName,
        contents: contents,
      });
      console.log("video result: " + result);
      const response = result.response;
      const text = response.text();
      console.log("Raw response text:", text);
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch || jsonMatch[1] === undefined) {
        console.error("Could not find JSON block in response:", text);
        throw new Error("Model response did not contain expected JSON block.");
      }
      const jsonString = jsonMatch[1];
      parsedResult = JSON.parse(jsonString);
    } catch (error) {
      console.error("Error generating content from video:", error);
      throw error;
    }
    // console.log("Gemini Response:", text);
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
async function ProcessAudio(audioFile, QId, userId) {
  try {
    console.log("Processing the audio...");

    // Convert audio buffer to base64
    const base64Audio = audioFile.buffer.toString("base64");

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API,
    });
    const modelName = "gemini-2.5-flash";

    // Prepare the content with inline data
    const contents = [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              data: base64Audio,
              mimeType: audioFile.mimetype,
            },
          },
          {
            text: "Analyze this audio recording of an interview answer. Provide a detailed analysis including: 1) A transcript of what was said 2) Analysis of speaking clarity and confidence 3) Analysis of pace and tone 4) Any detected filler words or hesitations. Format the response in JSON with these sections.",
          },
        ],
      },
    ];

    let parsedResult = null;
    try {
      console.log("Generating content from audio...");
      const result = await ai.models.generateContent({
        model: modelName,
        contents: contents,
      });

      const response = result.response;
      const text = response.text();
      console.log("Raw audio analysis response:", text);

      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch || jsonMatch[1] === undefined) {
        console.error("Could not find JSON block in response:", text);
        throw new Error("Model response did not contain expected JSON block.");
      }

      parsedResult = JSON.parse(jsonMatch[1]);
      console.log("Parsed audio analysis:", parsedResult);

      // Find the ongoing interview and update it
      const interview = await Interview.findOne({
        userId,
        status: "ongoing",
      }).sort({ createdAt: -1 });

      if (!interview) {
        console.error("No ongoing interview found for user:", userId);
        return;
      }

      const questionIndex = QId - 1;
      if (!interview.questions[questionIndex]) {
        console.error("No question found for QId:", QId);
        return;
      }

      // Add audio analysis to the specific question
      interview.questions[questionIndex].audioAnalysis = {
        timestamp: new Date(),
        transcript: parsedResult.transcript || "",
        clarity: parsedResult.clarity || "",
        confidence: parsedResult.confidence || "",
        paceAndTone: parsedResult.paceAndTone || "",
        fillerWords: parsedResult.fillerWords || [],
      };

      await interview.save();
      console.log("Audio analysis added to question:", QId);
    } catch (error) {
      console.error("Error generating content from audio:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error processing audio with Gemini:", error);
    // DO NOT re-throw here. We want the main interview flow to continue.
  }
}

module.exports = { ProcessVideo, ProcessAudio };
