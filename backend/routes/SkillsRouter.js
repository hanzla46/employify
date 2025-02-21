const router = require("express").Router();
const ensureAuthenticated = require("../middlewares/Auth");
router.get("/", ensureAuthenticated, (req, res) => {
  console.log("1st step");
  res.status(200).json({ skills: req.user.name + " has a good skill" });
});

module.exports = router;
