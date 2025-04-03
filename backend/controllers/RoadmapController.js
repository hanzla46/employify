const Profile = require("../models/ProfileModel");
const { getRoadmapPrompt } = require("../models/RoadmapPrompt");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const generateRoadmap = async (req, res) => {
  try {
    console.log("Generating roadmap...");
    const user = req.user;
    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }
    const prompt = getRoadmapPrompt(profile);
    console.log(prompt);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro-exp-03-25",
      generation_config: {
        temperature: 2,
        response_mime_type: "application/json",
      },
    });
    const result = await model.generateContent(prompt);
    const content = result.response.candidates[0].content.parts[0].text;
    const jsonString = content.match(/```json\n([\s\S]*?)\n```/)[1];
    const roadmap = JSON.parse(jsonString);
    console.log(roadmap);
    return res.status(200).json({ success: true, data: roadmap , prompt});
  } catch (error) {
    console.error("Failed to generate roadmap:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = { generateRoadmap };
