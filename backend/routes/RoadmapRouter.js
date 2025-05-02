const { generateRoadmap, get, getAllCareerPaths, modify } = require("../controllers/RoadmapController");

const router = require("express").Router();
const ensureAuthenticated = require("../middlewares/Auth");
router.post("/generate", ensureAuthenticated, generateRoadmap);
router.get("/get", ensureAuthenticated, get);
router.get("/career-paths", ensureAuthenticated, getAllCareerPaths);
router.get("/modify", ensureAuthenticated, modify);
module.exports = router;
