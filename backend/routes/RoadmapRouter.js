const {generateRoadmap} = require("../controllers/RoadmapController");
const router = require("express").Router();
const ensureAuthenticated = require("../middlewares/Auth");
router.get("/get", ensureAuthenticated, generateRoadmap);
module.exports = router;