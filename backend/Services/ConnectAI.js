const Roadmap = require("../models/RoadmapModel");
const Profile = require("../models/ProfileModel");
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function callGemini(prompt) {
    let modifiedPrompt = prompt + "\n\nPlease craft a compelling LinkedIn post that feels genuine and resonates with a professional audience. Aim for a friendly, approachable tone while still showcasing expertise. Keep it concise and impactful, delivering value without unnecessary jargon. Just give me the post content directly, no extra notes or options.";
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(modifiedPrompt);
    // console.log("Generated Content Response:", result);
    const content = result.response.candidates[0].content.parts[0].text;
    return content;
}

const GenerateAutoPostAI = async (userId) => {
    // Fetch user profile
    const profile = await Profile.findOne({ userId });
    if (!profile) throw new Error("Profile not found");

    // Fetch roadmap
    const roadmap = await Roadmap.findOne({ userId });
    if (!roadmap) throw new Error("Roadmap not found");

    // Get latest completed course or project (robust)
    let latest = null;
    let type = null;
    let latestCourse = null;
    let latestProject = null;

    if (Array.isArray(roadmap.completedCourses) && roadmap.completedCourses.length > 0) {
        latestCourse = roadmap.completedCourses.reduce((a, b) => new Date(a.completedAt) > new Date(b.completedAt) ? a : b);
    }
    if (Array.isArray(roadmap.completedProjects) && roadmap.completedProjects.length > 0) {
        latestProject = roadmap.completedProjects.reduce((a, b) => new Date(a.completedAt) > new Date(b.completedAt) ? a : b);
    }

    if (latestCourse && latestProject) {
        if (new Date(latestCourse.completedAt) > new Date(latestProject.completedAt)) {
            latest = latestCourse;
            type = "course";
        } else {
            latest = latestProject;
            type = "project";
        }
    } else if (latestCourse) {
        latest = latestCourse;
        type = "course";
    } else if (latestProject) {
        latest = latestProject;
        type = "project";
    }

    if (!latest || !type || !latest.name) throw new Error("No completed courses or projects found, or missing name field");

    // Build prompt for Gemini (Improved)
    const prompt = `Hi there! As ${profile.name}, I'm excited to share a recent accomplishment. I just wrapped up the ${type} focused on '${latest.name}'. This ${type} really solidified my understanding of [mention a skill or two if possible, e.g., data analysis, web development] and provided practical experience with [mention a technology or tool if possible, e.g., Python, React]. Feeling motivated and ready to apply this newfound knowledge! Looking forward to tackling new challenges and connecting with others in this space.`;
    console.log("Generated Prompt:", prompt);
    const post = await callGemini(prompt);
    return post;
};

const GenerateCustomPostAI = async (userId, content, tone) => {
    // Fetch user profile
    const profile = await Profile.findOne({ userId });
    if (!profile) throw new Error("Profile not found");

    // Build prompt for Gemini (Improved)
    const prompt = `I need a LinkedIn post written from the perspective of ${profile.name}. The core message I want to convey is: '${content}'. Please make sure the tone is ${tone}, so it feels authentic and engaging to my network. Think about how I might naturally express this idea to others in a professional yet relatable way.`;
    console.log("Generated Prompt:", prompt);

    const post = await callGemini(prompt);
    return post;
};

module.exports = { GenerateCustomPostAI, GenerateAutoPostAI };