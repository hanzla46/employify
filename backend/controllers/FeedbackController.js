const Feedback = require("../models/FeedbackModel.js");
const User = require("../models/User.js");
// @desc    Get all feedbacks
const get = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json({ feedbacks });
  } catch (err) {
    console.error("🔥 GET Feedbacks Error:", err);
    res.status(500).json({ message: "Server error, bro." });
  }
};

// @desc    Submit new feedback
const add = async (req, res) => {
  const { name, email, comment, rating } = req.body;

  if (!name || !email || !comment || !rating) {
    return res.status(400).json({ message: "Fill the damn fields 😤" });
  }

  try {
    const user = await User.findOne({ _id: req.user._id });
    const feedback = new Feedback({ name, email, comment, rating, user: user._id });
    await feedback.save();
    res.status(201).json({ feedback, success: true, message: "Feedback submitted successfully! 🎉" });
  } catch (err) {
    console.error("🔥 POST Feedback Error:", err);
    res.status(500).json({ success: false, message: "Couldn’t drop that feedback 🫠" });
  }
};
module.exports = { get, add };
