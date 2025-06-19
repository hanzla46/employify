const Profile = require("../models/ProfileModel");
const Roadmap = require("../models/RoadmapModel");
const MarketAnalysis = require("../models/MarketAnalysisModel");
const { getRoadmapPrompt, getCareerPathPrompt } = require("../Services/RoadmapPrompt");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { parse, repair } = require("jsonrepair");
const { updateUserProfile } = require("../controllers/ProfileController");
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
    const existingRoadmap = await Roadmap.findOne({ userId: user._id });
    if (existingRoadmap) {
      return res.status(200).json({
        success: true,
        message: "Roadmap already exists",
        data: existingRoadmap,
        changes: existingRoadmap.changes || [],
      });
    }
    console.log("Generating roadmap...");
    const { selectedPath } = req.body;
    const { preferences } = selectedPath; // Extract preferences from selected path
    console.log("Path:", selectedPath);
    console.log("Preferences:", preferences);
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
      model: "gemini-2.5-flash-preview-05-20",
      generation_config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
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
    const roadmap = new Roadmap({ userId: user._id, tasks: tasks, changes: [] });
    await roadmap.save();
    return res.status(200).json({
      success: true,
      data: {
        tasks: tasks,
      },
      changes: [],
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
Strictly Keep the schema same. you can add/remove/change the tasks or subtasks depending on the modifications requirements. if you change any task/subtask change their other data accordingly. Update tag of each task (new, updated etc).
---
Strictly give json response like:
\`\`\`json
{
tasks: [all tasks array with schema of existing tasks],
}
\`\`\`
`;
    console.log("modification prompt" + prompt);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-04-17",
      generation_config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
        temperature: 1,
        response_mime_type: "application/json",
      },
    });
    const result = await model.generateContent(prompt);
    const content = result.response.candidates[0].content.parts[0].text;
    console.log("Generated content:", content);
    const match = content.match(/```json\n([\s\S]*?)\n```/);
    if (!match) {
      console.log("💥 No valid JSON block found.");
      return res.status(500).json({ success: false, message: "AI Engine Error!" });
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
    return res.status(500).json({ success: false, message: "Server Error!" });
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
    res.status(200).json({ data: { paths }, success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error, success: false });
  }
};

const evaluateSubtask = async (req, res) => {
  try {
    const user = req.user;
    console.log("Full request body:", req.body);
    const { taskId, subtaskId, text } = req.body;
    console.log("Parsed values - taskId:", taskId, "subtaskId:", subtaskId, "text:", text);
    console.log(
      "File info:",
      req.file
        ? {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
          }
        : "No file provided"
    ); // Input validation with type coercion
    const parsedTaskId = parseInt(taskId);
    const parsedSubtaskId = parseInt(subtaskId);

    if (!parsedTaskId || !parsedSubtaskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID and subtask ID are required and must be valid numbers",
        error: "MISSING_REQUIRED_FIELDS",
        debug: { receivedTaskId: taskId, receivedSubtaskId: subtaskId },
      });
    } // File validation is now handled by fileUpload middleware
    if (req.file) {
      console.log("File received:", {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });
    }

    const roadmap = await Roadmap.findOne({ userId: user._id });
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found",
      });
    }
    const task = roadmap.tasks.find((t) => t.id === parsedTaskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
        debug: { taskId: parsedTaskId, availableTaskIds: roadmap.tasks.map((t) => t.id) },
      });
    }

    const subtask = task.subtasks.find((st) => st.id === parsedSubtaskId);
    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: "Subtask not found",
      });
    }

    let analysis = "";

    if (req.file || text) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-preview-05-20",
        generation_config: {
          thinkingConfig: {
            thinkingBudget: 0,
          },
          temperature: 0.4,
        },
      });

      let promptText = `As a career advisor, evaluate the following submission for the task "${task.name}" and subtask "${subtask.name}". `;
      if (req.file) {
        const fileContent = req.file.buffer.toString();
        promptText += `The user has submitted a file with the following content:\n${fileContent}\n`;
      }
      if (text) {
        promptText += `The user has provided the following explanation:\n${text}\n`;
      }
      promptText += `\nProvide a concise evaluation (phrases) of this submission. Assess:
1. Areas of strength
2. Areas for improvement.
3. Relevance.
keep your response as short as possible, and do not include any additional information or instructions. dont add markdown or text formatting.`;

      const result = await model.generateContent(promptText);
      analysis = result.response.text();
    }
    let retries = 3;
    while (retries > 0) {
      try {
        subtask.completed = true;
        subtask.evaluation = {
          text: text || "",
          fileUrl: req.file ? req.file.path : "",
          analysis: analysis,
          submittedAt: new Date(),
          score: null,
        };

        await roadmap.save();
        updateRoadmap(user._id);
        updateUserProfile(user._id, analysis, subtask.name);
        return res.status(200).json({
          success: true,
          message: "Subtask evaluated successfully",
          data: {
            task: taskId,
            subtask: subtaskId,
            completed: true,
            evaluation: subtask.evaluation,
          },
        });
      } catch (saveError) {
        retries--;
        if (retries === 0) {
          throw new Error("Failed to save evaluation after multiple attempts");
        }
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s before retry
      }
    }
  } catch (error) {
    console.error("Error evaluating subtask:", error);

    // Determine error type and send appropriate response
    if (error.message === "Failed to save evaluation after multiple attempts") {
      return res.status(500).json({
        success: false,
        message: "Database error while saving evaluation",
        error: "DB_SAVE_ERROR",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided",
        error: "VALIDATION_ERROR",
        details: error.errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while evaluating the subtask",
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};

const getMarketAnalysis = async (req, res) => {
  try {
    const { skill } = req.query;
    if (!skill) {
      return res.status(400).json({
        success: false,
        message: "Skill parameter is required",
      });
    }

    const analysis = await MarketAnalysis.findOne({
      skill: new RegExp(skill, "i"), // Case insensitive search
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "No market data found for this skill",
      });
    }

    return res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("Error fetching market analysis:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch market analysis",
    });
  }
};

// Add missing skills to roadmap and increment interaction count
const addMissingSkills = async (req, res) => {
  try {
    const userId = req.user._id;
    const { skills } = req.body; // expects an array of skills
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ success: false, message: "No skills provided" });
    }
    const roadmap = await Roadmap.findOne({ userId });
    if (!roadmap) {
      return res.status(404).json({ success: false, message: "Roadmap not found" });
    }
    // Add only unique new skills
    roadmap.missingSkills = Array.from(new Set([...(roadmap.missingSkills || []), ...skills]));
    updateRoadmap(userId); // Increment interaction count
    await roadmap.save();
    return res.status(200).json({
      success: true,
      updated: false,
      missingSkills: roadmap.missingSkills,
      interactionCount: roadmap.interactionCount,
    });
  } catch (error) {
    console.error("Failed to add missing skills:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

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

module.exports = {
  generateRoadmap,
  get,
  getAllCareerPaths,
  modify,
  evaluateSubtask,
  getMarketAnalysis,
  addMissingSkills,
};
