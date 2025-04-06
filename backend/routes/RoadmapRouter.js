const {generateRoadmap} = require("../controllers/RoadmapController");
const upload = require("../middlewares/uploadMulter");
const router = require("express").Router();
const ensureAuthenticated = require("../middlewares/Auth");
router.post("/get", ensureAuthenticated, upload.single("video"), generateRoadmap);
module.exports = router;