const {
  startInterview,
  continueInterview,
} = require("../controllers/InterviewController.js");
const { ensureAuthenticated } = require("../middlewares/Auth");
const router = require("express").Router();
router.get("/start", ensureAuthenticated, (req, res) => {
  res.status(201).json({ success: true, message: "Starting interview!!!" });
});
router.get("/continue", ensureAuthenticated, (req, res) => {
  res.status(201).json({ success: true, message: "Continue interview!!!" });
});
module.exports = router;
