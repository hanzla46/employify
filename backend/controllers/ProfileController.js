const Profile = require("../models/ProfileModel.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const add = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("checking existing profile");
    const { hardSkills, softSkills, jobs, projects, careerGoal } = req.body;
    console.log("Creating new profile");
    const profile = new Profile({
      userId,
      hardSkills,
      softSkills,
      jobs,
      projects,
      careerGoal,
    });
    console.log("Profile data:", profile);
    await profile.save();
    res.status(200).json({ message: "profile added", success: true });
  } catch (error) {
    console.error("Error adding profile:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

const check = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("Checking existing profile for user:", userId);
    const existing = await Profile.findOne({ userId });
    if (existing) {
      console.log("Profile exists for user:", userId);
      return res.status(200).json({ profile: true, success: true });
    } else {
      console.log("No profile found for user:", userId);
      return res.status(200).json({ profile: false, success: true });
    }
  } catch (error) {
    console.error("Error checking profile:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
const getQuestions = async (req, res) => {
  try {
    console.log("Fetching questions for evaluation form...");
    // CALL GEMINI TO GET QUESTIONS USING PROFILE DATA
    const userId = req.user._id;
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      console.error("No profile found for user:", userId);
      return res
        .status(404)
        .json({ message: "Profile not found", success: false });
    }
    console.log("Profile data:", profile);
    const { hardSkills, softSkills, jobs, projects, careerGoal } = profile;
    const prompt = `Generate questions for evaluating a profile with the following data: Hard Skills: ${hardSkills}, Soft Skills: ${softSkills}, Jobs: ${jobs}, Projects: ${projects}, Career Goal: ${careerGoal}. it should be difficult according to user's profile. Response should be in JSON format: 
    \`\`\`json
    {
    hardSkillsTask(give a task that can be completed in max 3 hours, ask for a file),
    softSkillsQuestion(a tricky question),
    projectLink(ask for link of a project),
    projectContribution,
    projectImprovement(ask about something user has improved in the project using their hard skills), 
    jobExperience(ask anything related to job experience)
   }
    \`\`\`
    `;

    console.log("Prompt for Gemini:", prompt);
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
    const questions = JSON.parse(jsonString);
    const {
      hardSkillsTask,
      softSkillsQuestion,
      projectLink,
      projectContribution,
      projectImprovement,
      jobExperience,
    } = questions;
    console.log("Returning questions:", questions);
    return res
      .status(200)
      .json({
        hardSkillsTask,
        softSkillsQuestion,
        projectLink,
        projectContribution,
        projectImprovement,
        jobExperience,
      });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
module.exports = { add, check, getQuestions };
