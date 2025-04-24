const {fetchJobsJSearch, getJobs} = require("../controllers/FetchJobsController");
const router = require("express").Router();
router.get("/fetchJSearch", fetchJobsJSearch);
router.get("/getJobs", getJobs);
module.exports = router;