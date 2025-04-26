const Profile = require("../models/ProfileModel");
const Roadmap = require("../models/RoadmapModel");
const { getRoadmapPrompt } = require("../Services/RoadmapPrompt");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { parse, repair } = require('jsonrepair');

async function safeJsonParse(rawContent) {
  try {
      // Attempt normal parse first
      return JSON.parse(rawContent);
  } catch (err) {
      console.warn('⚠️ Normal JSON parse failed. Trying to REPAIR broken JSON...');
      try {
          // Try to repair broken JSON
          const repaired = repair(rawContent);
          console.log('🛠️ Successfully repaired JSON.');
          return JSON.parse(repaired);
      } catch (repairErr) {
          console.error('💀 JSON Repair also failed.');
          throw new Error('Completely invalid JSON, bro. LLM needs chittar therapy.');
      }
  }
}
const generateRoadmap = async (req, res) => {
  try {
    const user = req.user;
    console.log("Generating roadmap...");
   
    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    const prompt = await getRoadmapPrompt(
      profile,
    );
    console.log(prompt);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-04-17",
      generation_config: {
        temperature: 2,
        response_mime_type: "application/json",
      },
    });
    const result = await model.generateContent(prompt);
    const content = result.response.candidates[0].content.parts[0].text;
    console.log("Generated content:", content);
    const match = content.match(/```json\n([\s\S]*?)\n```/);
    if (!match) {
        throw new Error('💥 No valid JSON block found.');
    }
    const extractedJson = match[1];
    const roadmapData = await safeJsonParse(extractedJson);
    const { tasks, summary } = roadmapData;
    profile.summary = summary;
    await profile.save();
    console.log(roadmapData);
    const roadmap = new Roadmap({ userId: user._id, tasks: tasks });
    await roadmap.save();
    return res.status(200).json({
      success: true,
      data: {
        tasks: tasks,
      },
      prompt,
      result,
    });
  } catch (error) {
    console.error("Failed to generate roadmap:", error.message);
    return res.status(500).json({ success: false, message: error.message, });
  }
};
const get = async (req, res) => {
  const user = req.user;
  const existingRoadmap = await Roadmap.findOne({ userId: user._id });
  if (existingRoadmap) {
    return res.status(200).json({
      success: true,
      message: "Roadmap already exists",
      data: existingRoadmap,
    });
  } else {
    return res.status(404).json({
      success: false,
      message: "No roadmap found",
    });
  }
};
module.exports = { generateRoadmap, get };
