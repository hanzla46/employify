const { startInterview, continueInterview } = require("../controllers/InterviewController");
const ensureAuthenticated= require("../middlewares/Auth");
const router = require("express").Router();
router.get("/start", ensureAuthenticated, startInterview);
router.get("/continue", ensureAuthenticated, continueInterview);
module.exports = router;