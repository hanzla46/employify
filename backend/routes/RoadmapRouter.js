const {generateRoadmap, get} = require("../controllers/RoadmapController");

const router = require("express").Router();
const ensureAuthenticated = require("../middlewares/Auth");
router.get("/generate", ensureAuthenticated, generateRoadmap);
router.get("/get", ensureAuthenticated, get);
module.exports = router;