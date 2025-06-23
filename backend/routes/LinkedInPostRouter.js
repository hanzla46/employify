const express = require("express");
const router = express.Router();
const { createLinkedInPost, getLatestLinkedInPost } = require("../controllers/LinkedInPostController");
const { ensureAuthenticated } = require("../middlewares/Auth");

// Create a new LinkedIn post (user must be authenticated)
router.post("/", ensureAuthenticated, createLinkedInPost);

// Get the latest LinkedIn post for the user
router.get("/latest", ensureAuthenticated, getLatestLinkedInPost);

module.exports = router;
