const {fetchJobsJSearch, getJobs} = require("../controllers/FetchJobsController");
const ensureAuthenticated = require("../middlewares/Auth");
const router = require("express").Router();
router.get("/fetchJSearch", fetchJobsJSearch);
router.get("/getJobs", ensureAuthenticated, getJobs);
module.exports = router;