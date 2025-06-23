const LinkedInPost = require("../models/LinkedInPostModel");
const axios = require("axios");

// Generate a new LinkedIn post using an external service and save to DB
exports.createLinkedInPost = async (req, res) => {
  try {
    const { text, roadmapTask, mediaUrl } = req.body;
    const user = req.user._id;

    // Optionally: Call external service to generate post (mocked here)
    // const response = await axios.post("EXTERNAL_SERVICE_URL", { ... });
    // const { text, mediaUrl } = response.data;

    const post = await LinkedInPost.create({
      user,
      text,
      mediaUrl,
      roadmapTask,
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: "Failed to create LinkedIn post", error: err.message });
  }
};

// Get the latest LinkedIn post for the user
exports.getLatestLinkedInPost = async (req, res) => {
  try {
    const user = req.user._id;
    const post = await LinkedInPost.findOne({ user }).sort({ createdAt: -1 });
    if (!post) return res.status(404).json({ message: "No post found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch post", error: err.message });
  }
};
