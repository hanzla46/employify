const Interview = require("../models/InterviewModel");
const { GoogleGenAI } = require("@google/genai");
const path = require("path");
const fs = require("fs").promises;
const { setTimeout } = require("timers/promises");

const ProcessVideo = async (videoFile, QId, userId, sessionId) => {
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
      await waitForFileActive(ai, files[0].name);
      await fs.unlink(filePath);
      config = {
        responseMimeType: "text/plain",
      };
      console.log(`Video uploaded successfully. File URI: ${files[0].uri}, File Name: ${files[0].name}`);
    } catch (error) {
      console.error("Error uploading video file:", error);
      throw new Error("Failed to upload video for processing.");
    }
    // Updated prompt to request both facial and audio analysis
    const prompt = `Analyze this video and provide insights on the person's facial expressions, emotions, and audio. The person is giving an interview. Your output should be JSON with the following structure: {\n  emotions: array of top 3 objects with emotion and intensity (0-1),\n  summary: one-sentence summary of movement,\n  videoLength: number (seconds),\n  audioAnalysis: {\n    transcript: string,\n    clarity: string,\n    confidence: string,\n    paceAndTone: string,\n    fillerWords: array of strings\n  }\n}. If you find no person/audio, you can give random output.`;
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
      const result = await ai.models.generateContentStream({
        model: modelName,
        contents: contents,
        config: config,
      });
      let content = "";
      for await (const chunk of result) {
        content += chunk.text;
      }
      console.log("Raw response text:", content);
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch || jsonMatch[1] === undefined) {
        console.error("Could not find JSON block in response:", content);
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
      _id: sessionId,
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

    // Add audio analysis to the specific question
    interview.questions[questionIndex].audioAnalysis = {
      timestamp: new Date(),
      transcript: parsedResult.audioAnalysis?.transcript || "",
      clarity: parsedResult.audioAnalysis?.clarity || "",
      confidence: parsedResult.audioAnalysis?.confidence || "",
      paceAndTone: parsedResult.audioAnalysis?.paceAndTone || "",
      fillerWords: parsedResult.audioAnalysis?.fillerWords || [],
    };

    await interview.save();
    console.log("Facial and audio analysis added to question:", QId, "for user:", userId, "session:", sessionId);
  } catch (error) {
    console.error("Error processing video with Gemini:", error);
    // DO NOT re-throw here. We want the main interview flow to continue.
  }
};

// --- Helper Function to Poll File Status ---
async function waitForFileActive(ai, fileName) {
  let file = await ai.files.get({ name: fileName });
  let retries = 0;
  const maxRetries = 20; // Safety break to prevent infinite loops
  const delay = 5000; // 5 seconds

  while (file.state === "PROCESSING" && retries < maxRetries) {
    console.log(`Polling file status: ${file.state}... (Attempt ${retries + 1})`);
    await setTimeout(delay); // Wait for 5 seconds
    file = await ai.files.get({ name: fileName });
    retries++;
  }

  if (file.state !== "ACTIVE") {
    console.error("File processing failed or timed out. Final state:", file.state);
    throw new Error(`File ${fileName} is not in ACTIVE state. Current state: ${file.state}`);
  }

  return file;
}

module.exports = { ProcessVideo };
