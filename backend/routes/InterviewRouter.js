const {
  startInterview,
  continueInterview,
} = require("../controllers/InterviewController");
const ensureAuthenticated = require("../middlewares/Auth");
const upload = require("../middlewares/uploadMulter");
const router = require("express").Router();
router.get("/start", ensureAuthenticated, startInterview);
router.post(
  "/continue",
  ensureAuthenticated,
  upload.single("video"),
  continueInterview
);
module.exports = router;
