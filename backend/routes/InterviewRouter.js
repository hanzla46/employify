const {
  startInterview,
  continueInterview,
  checkInterviewSession,
  getAllInterviews,
  getSuggestedInterview,
} = require("../controllers/InterviewController");
const ensureAuthenticated = require("../middlewares/Auth");
const { upload } = require("../middlewares/uploadMulter");
const router = require("express").Router();
router.post("/start", ensureAuthenticated, startInterview);
router.post(
  "/continue",
  ensureAuthenticated,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  continueInterview
);
router.get("/get-all-interviews", ensureAuthenticated, getAllInterviews);
router.get("/suggested-interview", ensureAuthenticated, getSuggestedInterview);
router.get("/check-session", ensureAuthenticated, checkInterviewSession);
module.exports = router;
