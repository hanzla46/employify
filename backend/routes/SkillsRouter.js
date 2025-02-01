const SkillsRouter = require("express").Router();
const ensureAuthenticated = require("../middlewares/Auth");
const getSkills = require("../controllers/SkillsController");
SkillsRouter.get("/getSkills", ensureAuthenticated, (req, res) => {
  res.status(200).json({ skills: req.user.name + " has a good skill" });
});

module.exports = SkillsRouter;
