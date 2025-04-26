const Profile = require("../models/ProfileModel.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getKeywords } = require("../Services/JobKeywords.js");
const mime = require("mime-types");
const add = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("checking existing profile");
    const { hardSkills, softSkills, jobs, projects, careerGoal, location } =
      req.body;
    console.log("Creating new profile");
    const profile = new Profile({
      userId,
      hardSkills,
      softSkills,
      jobs,
      projects,
      careerGoal,
      location,
    });
    console.log("Profile data:", profile);
    await profile.save();
    const keywordsArray = await getKeywords(hardSkills);
    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: userId },
      { $set: { jobKeywords: keywordsArray } },
      { new: true }
    );
    console.log("Updated profile with keywords:", updatedProfile);
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
    const prompt = `Generate questions for evaluating a profile with the following data: Hard Skills: ${hardSkills}, Soft Skills: ${softSkills}, Jobs: ${jobs}, Projects: ${projects}, Career Goal: ${careerGoal}. it should be difficult according to user's profile. Give questions that require actual human creativity. Nad skills you will test should have actual value in current job market. Response should be in JSON format: 
    \`\`\`json
    {
    hardSkillsTask1(give a task that can be completed in 1-2 hours, ask for a file),
    hardSkillsTask2(give a task that can be completed in 1-2 hours, ask for a file),
    softSkillsQuestion2(a tricky question),
    softSkillsQuestion2(a tricky question),
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
      hardSkillsTask1,
      hardSkillsTask2,
      softSkillsQuestion1,
      softSkillsQuestion2,
      projectLink,
      projectContribution,
      projectImprovement,
      jobExperience,
    } = questions;
    console.log("Returning questions:", questions);
    return res.status(200).json({
      hardSkillsTask1,
      hardSkillsTask2,
      softSkillsQuestion1,
      softSkillsQuestion2,
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
const evaluateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { file1, file2 } = req.files;
    if(!file1 || !file2) {
      console.error("Files not provided in the request");
    }
    const firstFile = file1[0];
    const secondFile = file2[0];
    const questions = JSON.parse(req.body.questions);
    console.log("Questions for evaluation:", questions);
    const evaluationForm = JSON.parse(req.body.evaluationForm);
    console.log("Evaluation form data:", evaluationForm);
    const profile = await Profile.findOne({ userId });
    console.log("Evaluating profile for user:", userId);
    const evaluate = async (question, file) => {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });
      function fileToGenerativePart(fileData, filename) {
        const mimeType = mime.lookup(filename) || "text/plain"; // Default to text/plain if type is unknown
        return {
          inlineData: {
            data: fileData, // The Base64 encoded data
            mimeType: mimeType,
          },
        };
      }
      try {
        const name = file.originalname || "file.txt"; // Fallback name if originalname is not available
        const data = file.buffer.toString("base64");
        const filePart = fileToGenerativePart(data, name);
        const prompt = `Analyze this task and its response and provide insights about the user's performance. Give your response in one paragraph without formatting and extra special characters. Task is: ${question} and the user's response is attached: `;
        const result = await model.generateContent([prompt, filePart]);
        const response = await result.response;
        const text = response.text();
        console.log("Gemini Response:", text);
        return text;
      } catch (error) {
        console.error("Error in evaluate function:", error);
        return { error: error.message };
      }
    };
    const hardSkillResponse1 = await evaluate(questions.hardSkillsTask1, firstFile);
    const hardSkillResponse2 = await evaluate(questions.hardSkillsTask2, secondFile);
    const prompt = `
Analyze the user's profile based on the following summarized data:

Profile Overview:
- Top Hard Skill: ${profile.hardSkills[0]?.name} (${profile.hardSkills[0]?.experience})
- Top Soft Skill: ${profile.softSkills[0]?.name} (${profile.softSkills[0]?.proficiency})
- Latest Job: ${profile.jobs[0]?.title} at ${profile.jobs[0]?.company}
- Recent Project: ${profile.projects[0]?.name}
- Career Goal: ${profile.careerGoal}

Evaluation Tasks:
- Hard Skills Task 1: ${questions.hardSkillsTask1}
  - Evaluation: ${hardSkillResponse1}
- Hard Skills Task 2: ${questions.hardSkillsTask2}
  - Evaluation: ${hardSkillResponse2}
- Soft Skills Question 1: ${questions.softSkillsQuestion1}
  - Response: ${evaluationForm.softSkillsResponse1}
- Soft Skills Question 2: ${questions.softSkillsQuestion2}
  - Response: ${evaluationForm.softSkillsResponse2}
- Project Link: ${evaluationForm.projectLink}
- Project Contribution: ${evaluationForm.projectContribution}
- Project Improvement Suggestion: ${evaluationForm.projectImprovement}
- Job Experience Summary: ${evaluationForm.jobExperience}

Instructions:
- Provide a summary of the user's profile.
- Provide an evaluation based on tasks, project, and job experience.
- Do NOT use bullet points, special characters, or markdown in the main response.
- Response MUST be in **strict JSON format** with two keys: "summary" and "evaluation".

Expected Output Format:
\`\`\`json
{
  "summary": "Brief profile summary here.",
  "evaluation": "Detailed evaluation here."
}
\`\`\`
`;
console.log("Prompt for Gemini:", prompt);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const result = await model.generateContent(prompt);
    const content = result.response.candidates[0].content.parts[0].text;
    const jsonString = content.match(/```json\n([\s\S]*?)\n```/)[1];
    const parsedResult = JSON.parse(jsonString);
    const { summary, evaluation } = parsedResult;
    console.log("Evaluation Summary:", summary);
    console.log("Evaluation Result:", evaluation);
    profile.profileSummary = summary;
    profile.evaluationResult = evaluation;
    await profile.save();
    res
      .status(200)
      .json({ message: "Profile evaluated successfully", success: true });
  } catch (error) {
    console.error("Error evaluating profile:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
module.exports = { add, check, getQuestions, evaluateProfile };
