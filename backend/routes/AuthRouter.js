const { signup, login, getMe, logout, sendOtp } = require("../controllers/AuthController");
const { signupValidation, loginValidation, OtpEmailValidation } = require("../middlewares/AuthValidation");

const router = require("express").Router();

router.post("/signup", signupValidation, signup);
router.get("/send-otp", OtpEmailValidation, sendOtp);
router.post("/login", loginValidation, login);
router.get("/me", getMe);
router.post("/logout", logout);

module.exports = router;
