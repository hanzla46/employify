const {
  generateRoadmap,
  updateRoadmap,
  get,
  getAllCareerPaths,
  modify,
  evaluateSubtask,
  getMarketAnalysis,
  addMissingSkills,
} = require("../controllers/RoadmapController");
const router = require("express").Router();
const { fileUpload } = require("../middlewares/uploadMulter");
const ensureAuthenticated = require("../middlewares/Auth");

router.post("/generate", ensureAuthenticated, generateRoadmap);
router.post("/update", ensureAuthenticated, updateRoadmap);
router.get("/get", ensureAuthenticated, get);
router.get("/career-paths", ensureAuthenticated, getAllCareerPaths);
router.get("/modify", ensureAuthenticated, modify);
router.get("/market-analysis", ensureAuthenticated, getMarketAnalysis);
router.post("/evaluate-subtask", ensureAuthenticated, fileUpload.single("file"), evaluateSubtask);
router.post("/add-missing-skills", ensureAuthenticated, addMissingSkills);

module.exports = router;
