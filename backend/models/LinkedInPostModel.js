const mongoose = require("mongoose");

const LinkedInPostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  mediaUrl: { type: String }, // Optional: URL to image/video
  createdAt: { type: Date, default: Date.now },
  roadmapTask: { type: String }, // Optional: which task triggered this post
});

module.exports = mongoose.model("LinkedInPost", LinkedInPostSchema);
