const Profile = require("../models/ProfileModel");
const Roadmap = require("../models/RoadmapModel");
const { getRoadmapPrompt } = require("../Services/RoadmapPrompt");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const generateRoadmap = async (req, res) => {
  try {
    const user = req.user;
    console.log("Generating roadmap...");
    const questions = JSON.parse(req.body.questions);
    const evaluationForm = JSON.parse(req.body.evaluationForm);
    console.log("Request body:", req.body);
    console.log("Uploaded files:", req.files);
    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    if (!req.files || !req.files.file1 || !req.files.file2) {
      console.error(
        "Files are not properly received by the server:",
        req.files
      );
      return res
        .status(400)
        .json({ success: false, message: "Files are missing" });
    }

    const { file1, file2 } = req.files;

    if (!file1 || !file2) {
      console.error("Missing files in request:", req.files);
      return res
        .status(400)
        .json({ success: false, message: "Files are required" });
    }

    const firstFile = file1[0];
    const secondFile = file2[0];
    console.log(firstFile, secondFile);
    const prompt = await getRoadmapPrompt(
      profile,
      questions,
      evaluationForm,
      firstFile,
      secondFile
    );
    console.log(prompt);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generation_config: {
        temperature: 2,
        response_mime_type: "application/json",
      },
    });
    const result = await model.generateContent(prompt);
    const content = result.response.candidates[0].content.parts[0].text;
    const jsonString = content.match(/```json\n([\s\S]*?)\n```/)[1];
    const roadmapData = JSON.parse(jsonString);
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
module.exports = { generateRoadmap, get };
