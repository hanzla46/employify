const {
  signup,
  login,
  getMe,
  logout,
} = require("../controllers/AuthController");
const {
  signupValidation,
  loginValidation,
} = require("../middlewares/AuthValidation");

const router = require("express").Router();

router.post("/signup", signupValidation, signup);
router.post("/login", loginValidation, login);
router.get("/me", getMe);
router.post("/logout", logout);

module.exports = router;
