const mongoose = require("mongoose");

const SubtaskSchema = new mongoose.Schema(
  {
    id: Number,
    name: String,
    buttonText: String,
    sources: { type: String, default: "" },
    completed: { type: Boolean, default: false },
    evaluation: {
      text: String,
      fileUrl: String,
      analysis: String,
      submittedAt: Date,
    },
  },
  { _id: false }
);

const PositionSchema = new mongoose.Schema(
  {
    x: Number,
    y: Number,
  },
  { _id: false }
);

const TaskSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    name: String,
    description: String,
    position: PositionSchema,
    subtasks: [SubtaskSchema],
    dependencies: [Number],
    category: String,
    difficulty: String,
    estimated_time: String,
    priority: String,
    tag: { type: String, default: "existing" },
  },
  { _id: false }
);

const RoadmapSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tasks: [TaskSchema],
  changes: [String],
  missingSkills: [String], // New field to store missing skills added from job page
  interactionCount: { type: Number, default: 0 }, // Track user interactions for roadmap update batching
});

const Roadmap = mongoose.model("Roadmap", RoadmapSchema);
module.exports = Roadmap;
