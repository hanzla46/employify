const { fileUpload } = require("../middlewares/uploadMulter");
const { add, check, getSubskills } = require("../controllers/ProfileController");
const ensureAuthenticated = require("../middlewares/Auth");
// Accept a single resume file (field name: 'resume')
const uploadResume = fileUpload.single("resume");
const router = require("express").Router();
router.post("/add", ensureAuthenticated, uploadResume, add);
router.get("/check", ensureAuthenticated, check);
router.get("/subskills/:skillName", ensureAuthenticated, getSubskills);

module.exports = router;
