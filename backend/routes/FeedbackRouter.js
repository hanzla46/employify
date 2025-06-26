const { get, add } = require("../controllers/FeedbackController");
const ensureAuthenticated = require("../middlewares/Auth");
const router = require("express").Router();

router.get("/get", get);
router.post("/add", ensureAuthenticated, add);
module.exports = router;
