const {generateRoadmap, get,getAllCareerPaths} = require("../controllers/RoadmapController");

const router = require("express").Router();
const ensureAuthenticated = require("../middlewares/Auth");
router.post("/generate", ensureAuthenticated, generateRoadmap);
router.get("/get", ensureAuthenticated, get);
router.get("/career-paths", ensureAuthenticated,getAllCareerPaths);
module.exports = router;