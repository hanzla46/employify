const Profile = require("../models/ProfileModel");
const Roadmap = require("../models/RoadmapModel");
const MarketAnalysis = require("../models/MarketAnalysisModel");
const {
  generateRoadmapAI,
  generateSubtaskSourcesAI,
  modifyRoadmapAI,
  getCareerPathsAI,
  evaluateSubtaskAI,
} = require("../Services/RoadmapAI.js");
const { updateRoadmap, updateUserProfile } = require("../Services/DynamicUpdates.js");

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
    const roadmapData = await generateRoadmapAI(profile, selectedPath);
    const { tasks } = roadmapData;
    console.log(roadmapData);
    const roadmap = new Roadmap({ userId: user._id, tasks: tasks, changes: [] });
    await roadmap.save();
    res.status(200).json({
      success: true,
      data: {
        tasks: tasks,
      },
      changes: [],
    });
    setImmediate(async () => {
      const allSubtasks = [];
      for (const task of tasks) {
        for (const subtask of task.subtasks) {
          allSubtasks.push({ taskId: task.id, subtaskId: subtask.id, task, subtask });
        }
      }
      const profileForSources = { ...profile._doc };
      await Promise.all(
        allSubtasks.map(async ({ taskId, subtaskId, task, subtask }) => {
          try {
            const sources = await generateSubtaskSourcesAI(profileForSources, task, subtask);
            await Roadmap.updateOne(
              { userId: user._id, "tasks.id": taskId },
              { $set: { "tasks.$[task].subtasks.$[subtask].sources": sources } },
              { arrayFilters: [{ "task.id": taskId }, { "subtask.id": subtaskId }] }
            );
            console.log("sources updated: ", taskId, subtaskId);
          } catch (err) {
            console.log("something went wrong for " + subtaskId, err);
          }
        })
      );
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
    const roadmapData = await modifyRoadmapAI(roadmap, query);
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
    const CareerPaths = await getCareerPathsAI(profile);
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

    let analysis = await evaluateSubtaskAI(subtask, task, text, req.file);

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

module.exports = {
  generateRoadmap,
  get,
  getAllCareerPaths,
  modify,
  evaluateSubtask,
  getMarketAnalysis,
  addMissingSkills,
};
