const {
  generateRoadmap,
  get,
  getAllCareerPaths,
  modify,
  evaluateSubtask,
} = require("../controllers/RoadmapController");
const router = require("express").Router();
const { fileUpload } = require("../middlewares/uploadMulter");
const ensureAuthenticated = require("../middlewares/Auth");

router.post("/generate", ensureAuthenticated, generateRoadmap);
router.get("/get", ensureAuthenticated, get);
router.get("/career-paths", ensureAuthenticated, getAllCareerPaths);
router.get("/modify", ensureAuthenticated, modify);
router.post("/evaluate-subtask", ensureAuthenticated, fileUpload.single("file"), evaluateSubtask);

module.exports = router;
