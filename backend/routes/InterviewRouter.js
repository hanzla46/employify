const {startInterview, continueInterview} = require("../controllers/InterviewController");
const {ensureAuthenticated} = require("../middlewares/Auth");
const router = require("express").Router();
router.post("/start", ensureAuthenticated, startInterview);
router.post("/continue", ensureAuthenticated, continueInterview);
module.exports = router;