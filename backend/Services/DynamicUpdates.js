const Roadmap = require("../models/RoadmapModel");
const Profile = require("../models/ProfileModel");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getKeywordsAndSummaryAI } = require("./ProfileAI");
const { safeJsonParse } = require("./JsonParse");
//helper function to update roadmap dynamically
const updateRoadmap = async (userId) => {
  const roadmap = await Roadmap.findOne({ userId });
  if (!roadmap) return;

  roadmap.interactionCount = (roadmap.interactionCount || 0) + 1;
  await roadmap.save();

  // If threshold reached, trigger roadmap update
  if (roadmap.interactionCount >= 4) {
    // 1. Grab latest 4 interactions (subtask evaluations and missing skills)
    let evaluations = [];
    roadmap.tasks.forEach((task) => {
      task.subtasks.forEach((subtask) => {
        if (subtask.evaluation && subtask.evaluation.text) {
          evaluations.push({
            taskId: task.id,
            subtaskId: subtask.id,
            evaluation: { ...subtask.evaluation },
            completed: subtask.completed,
            subtaskRef: subtask, // for resetting below
          });
        }
      });
    });
    evaluations.sort((a, b) => new Date(b.evaluation.submittedAt) - new Date(a.evaluation.submittedAt));
    const missingSkills = roadmap.missingSkills || [];
    const numNeeded = 4 - missingSkills.length;
    const selectedEvaluations = evaluations.slice(0, Math.max(0, numNeeded));

    // Prepare prompt for Gemini
    const prompt = `You are an expert career coach AI. The user has made progress on their roadmap. Your job is to update ONLY the incomplete tasks/subtasks in the roadmap below, using the user's latest progress and missing skills.\n\n---\n\nCurrent Roadmap Tasks (JSON, exact schema, only incomplete tasks/subtasks):\n\n\`json\n${JSON.stringify(
      roadmap.tasks,
      null,
      2
    )}\n\`\n\n---\n\nRecent User Progress (subtask evaluations):\n${selectedEvaluations
      .map(
        (ev) =>
          `Task ID: ${ev.taskId}, Subtask ID: ${ev.subtaskId}, Evaluation: ${
            ev.evaluation.analysis || ev.evaluation.text
          }`
      )
      .join("\n")}\n\n---\n\nMissing Skills the user wants to add:\n${missingSkills.join(
      ", "
    )}\n\n---\n\nUpdate the roadmap to reflect the user's new skills and progress. You may:\n- Add, remove, or update tasks/subtasks as needed.\n- Only modify tasks/subtasks that are not completed.\n- Keep the schema EXACTLY the same as input.\n- Return ONLY the updated tasks array in JSON, no extra text.\n\n
    \`\`\` json\n{ "tasks":[updated tasks array]} \n\`\`\``;
    console.log("Update prompt:", prompt);
    // Call Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-05-20",
      generation_config: {
        thinkingBudget: 0,
        temperature: 1,
        response_mime_type: "application/json",
      },
    });
    const result = await model.generateContent(prompt);
    const content = result.response.candidates[0].content.parts[0].text;
    const match = content.match(/```json\n([\s\S]*?)\n```/);
    if (!match) return; // fail silently for now
    const roadmapData = await safeJsonParse(match[1]);
    if (!roadmapData.tasks || !Array.isArray(roadmapData.tasks)) {
      console.error("Gemini response JSON did not contain a valid 'tasks' array:", roadmapData);
      return; // do not overwrite tasks if invalid
    }
    roadmap.tasks = roadmapData.tasks;

    // 2. Reset the evaluation objects we just used (but keep completed as true)
    selectedEvaluations.forEach(({ subtaskRef, completed }) => {
      subtaskRef.evaluation = undefined;
      if (completed) subtaskRef.completed = true;
    });
    // 3. Reset missingSkills and interactionCount
    roadmap.missingSkills = [];
    roadmap.interactionCount = 0;
    await roadmap.save();
    console.log(`Roadmap dynamically updated successfully: ${roadmap.tasks.length} tasks`);
    return;
  }
};
const updateUserProfile = async (userId) => {
  try {
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      console.error("Profile not found for user:", userId);
      return;
    }
    const keywordsAndSummary = await getKeywordsAndSummaryAI(profile);
    if (keywordsAndSummary.summary) profile.profileSummary = keywordsAndSummary.summary;
    if (keywordsAndSummary.jobKeywords) profile.jobKeywords = keywordsAndSummary.jobKeywords;
    console.log("Updating profile with new summary and keywords:", keywordsAndSummary);
    await profile.save();
  } catch (error) {
    console.error("Error updating user profile:", error);
  }
};
module.exports = { updateRoadmap, updateUserProfile };
