const ensureAuthenticated = require("../middlewares/Auth");
const { generateColdMessage } = require("../controllers/ConnectController");
const router = require("express").Router();
router.get("/cold-message", ensureAuthenticated, generateColdMessage);
module.exports = router;
