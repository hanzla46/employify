const mongoose = require("mongoose");

const SubtaskSchema = new mongoose.Schema(
  {
    id: Number,
    name: String,
    buttonText: String,
    sources: String,
    completed: { type: Boolean, default: false },
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
});

const Roadmap = mongoose.model("Roadmap", RoadmapSchema);
module.exports = Roadmap;
