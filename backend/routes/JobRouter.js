const { fetchJobsJSearch, autoFetchJobs } = require("../controllers/FetchJobsController");
const { getJobs, generateCL, generateResume } = require("../controllers/JobsController");
const ensureAuthenticated = require("../middlewares/Auth");
const router = require("express").Router();
router.get("/fetchJSearch", fetchJobsJSearch);
router.get("/getJobs", ensureAuthenticated, getJobs);
router.get("/generateCoverLetter", ensureAuthenticated, generateCL);
router.get("/generateResume", ensureAuthenticated, generateResume);

module.exports = router;
