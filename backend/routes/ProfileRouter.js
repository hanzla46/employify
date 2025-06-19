const { fileUpload } = require("../middlewares/uploadMulter");
const { add, check, getSubskills } = require("../controllers/ProfileController");
const ensureAuthenticated = require("../middlewares/Auth");
const uploadFields = fileUpload.fields([
  { name: "file1", maxCount: 1 },
  { name: "file2", maxCount: 1 },
]);
const router = require("express").Router();
router.post("/add", ensureAuthenticated, add);
router.get("/check", ensureAuthenticated, check);
router.get("/subskills/:skillName", ensureAuthenticated, getSubskills);

module.exports = router;
