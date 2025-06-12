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

    const ai = new GoogleGenAI(process.env.GEMINI_API);
    const modelName = "gemini-2.0-flash";
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
async function ProcessAudio(audio, QId, userId) {
  const filePath = path.join(__dirname, `../audioUploads/${QId}_${userId}.wav`);
  fs.writeFileSync(filePath, audio.buffer);
  const API_KEY = process.env.ASSEMBLY_AI_KEY;

  try {
    const uploadRes = await axios({
      method: "post",
      url: "https://api.assemblyai.com/v2/upload",
      headers: {
        authorization: API_KEY,
        "transfer-encoding": "chunked",
      },
      data: fs.createReadStream(filePath),
    });
    const audioUrl = uploadRes.data.upload_url;
    const transcriptRes = await axios.post(
      "https://api.assemblyai.com/v2/transcript",
      { audio_url: audioUrl },
      { headers: { authorization: API_KEY } }
    );
    const transcriptId = transcriptRes.data.id;
    let result;
    while (true) {
      const poll = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { authorization: API_KEY },
      });
      if (poll.data.status === "completed") {
        result = poll.data;
        console.log(" TRANSCRIPT:", result.text);
        break;
      } else if (poll.data.status === "error") {
        throw new Error(`AssemblyAI Error: ${poll.data.error}`);
      }

      await new Promise((r) => setTimeout(r, 3000));
    }

    // 🔄 Save result to DB / notify frontend / etc.
    console.log("🎯 Final audio transcript:", result.text);
  } catch (err) {
    console.error("🔥 AssemblyAI error:", err.message);
  } finally {
    fs.existsSync(filePath) && fs.unlinkSync(filePath);
  }
}

module.exports = { ProcessVideo, ProcessAudio };
