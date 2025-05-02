const Profile = require("../models/ProfileModel");
const Roadmap = require("../models/RoadmapModel");
const { getRoadmapPrompt, getCareerPathPrompt } = require("../Services/RoadmapPrompt");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { parse, repair } = require("jsonrepair");

async function safeJsonParse(rawContent) {
  try {
    // Attempt normal parse first
    return JSON.parse(rawContent);
  } catch (err) {
    console.warn("⚠️ Normal JSON parse failed. Trying to REPAIR broken JSON...");
    try {
      // Try to repair broken JSON
      const repaired = repair(rawContent);
      console.log("🛠️ Successfully repaired JSON.");
      return JSON.parse(repaired);
    } catch (repairErr) {
      console.error("💀 JSON Repair also failed.");
      throw new Error("Completely invalid JSON, bro. LLM needs chittar therapy.");
    }
  }
}
const generateRoadmap = async (req, res) => {
  try {
    const user = req.user;
    console.log("Generating roadmap...");
    const selectedPath = req.body.selectedPath;
    console.log(selectedPath);
    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }
    profile.careerGoal = selectedPath.Path_name;
    await profile.save();
    const prompt = await getRoadmapPrompt(profile, selectedPath);
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
      throw new Error("💥 No valid JSON block found.");
    }
    const extractedJson = match[1];
    const roadmapData = await safeJsonParse(extractedJson);
    const { tasks } = roadmapData;
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
    return res.status(500).json({ success: false, message: error.message });
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
const modify = async (req, res) => {
  try {
    const userId = req.user._id;
    const query = req.query.text;
    const roadmap = await Roadmap.findOne({ userId });
    console.log("roadmap" + roadmap);
    const prompt = `Improve this career roadmap. user want modifications: ${query} \n and roadmap task array is ${roadmap.tasks} \n\n\n
---
Strictly Keep the schema same. you can add/remove/change the tasks or subtasks depending on the modifications requirements. if you changeany task/subtask change their other data accordingly.
---
Strictly give json response like:
\`\`\`json
{
tasks: [all updated tasks array with schema of existing tasks],
}
\`\`\`
`;
    console.log("modification prompt" + prompt);
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
      throw new Error("💥 No valid JSON block found.");
    }
    const extractedJson = match[1];
    const roadmapData = await safeJsonParse(extractedJson);
    const { tasks } = roadmapData;
    console.log(roadmapData);
    await Roadmap.updateOne({ userId: userId }, { $set: { tasks: tasks } });
    return res.status(200).json({
      success: true,
      data: {
        tasks: tasks,
      },
      prompt,
      result,
    });
  } catch (err) {
    console.log("failed modifying roadmap " + err);
  }
};

const getAllCareerPaths = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("userid" + userId);
    const profile = await Profile.findOne({ userId: userId });
    console.log(profile);
    const prompt = getCareerPathPrompt(profile);
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
      throw new Error("💥 No valid JSON block found.");
    }
    const extractedJson = match[1];
    const CareerPaths = await safeJsonParse(extractedJson);
    const { paths } = CareerPaths;
    console.log(paths);
    res.status(200).json({ data: { paths } });
  } catch (error) {
    console.log(error);
  }
};
module.exports = { generateRoadmap, get, getAllCareerPaths, modify };
