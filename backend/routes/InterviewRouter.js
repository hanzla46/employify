const {startInterview, continueInterview} = require("../controllers/InterviewController.js");
const {ensureAuthenticated} = require("../middlewares/Auth");
const router = require("express").Router();
router.post("/start", ensureAuthenticated, (req,res) =>{
    res.status(201).json({success: true, message: "starting interview..."});
});
router.post("/continue", ensureAuthenticated, continueInterview);
module.exports = router;