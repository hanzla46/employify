const ensureAuthenticated = require("../middlewares/Auth");
const { generateColdMessage,generateLinkedInPost } = require("../controllers/ConnectController");
const router = require("express").Router();
router.get("/cold-message", ensureAuthenticated, generateColdMessage);
router.post("/linkedin-post", ensureAuthenticated, generateLinkedInPost);
module.exports = router;
