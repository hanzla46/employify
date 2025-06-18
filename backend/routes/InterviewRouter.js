const { startInterview, continueInterview } = require("../controllers/InterviewController");
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
module.exports = router;
