const { add, update , check} = require("../controllers/ProfileController");
const ensureAuthenticated = require("../middlewares/Auth");
const router = require("express").Router();
router.post("/add", ensureAuthenticated, add);
router.post("/update", ensureAuthenticated, update);
router.get("/check", ensureAuthenticated, check);
module.exports = router;
