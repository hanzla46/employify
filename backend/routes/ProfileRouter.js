const { add, check, getQuestions} = require("../controllers/ProfileController");
const ensureAuthenticated = require("../middlewares/Auth");
const router = require("express").Router();
router.post("/add", ensureAuthenticated, add);
router.get("/check", ensureAuthenticated, check);
router.get("/getQuestions", ensureAuthenticated, getQuestions);

module.exports = router;
