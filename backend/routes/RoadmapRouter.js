const {generateRoadmap, get} = require("../controllers/RoadmapController");
// const upload = require("../middlewares/uploadMulter");
const fileUpload = require("../middlewares/multiple.uploadMulter");
const uploadFields = fileUpload.fields([
    { name: 'file1', maxCount: 1 },
    { name: 'file2', maxCount: 1 }
]);
const router = require("express").Router();
const ensureAuthenticated = require("../middlewares/Auth");
router.post("/generate", ensureAuthenticated, uploadFields, generateRoadmap);
router.get("/get", ensureAuthenticated, get);
module.exports = router;