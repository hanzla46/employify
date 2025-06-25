const UserModel = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const FormData = require("form-data");
const Otp = require("../models/OtpModel");
const generateToken = (user) => {
  return jwt.sign({ email: user.email, _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};
const sendOtp = async (req, res) => {
  const existingOtp = await Otp.findOne({ email: req.query.email });
  let random;
  if (existingOtp) {
    random = existingOtp.code;
  } else {
    random = Math.floor(100000 + Math.random() * 900000);
    const otp = new Otp({ email: req.query.email, code: random });
    otp.save();
  }
  const data = {
    service_id: "service_mzj71bg",
    template_id: "template_nvfoxdm",
    user_id: "Y4K8B2V9KyBRz_jiN",
    template_params: {
      email: req.query.email,
      code: random,
    },
    accessToken: process.env.EMAILJS_PRIVATE_KEY,
  };
  try {
    const emailjsResponse = await axios.post("https://api.emailjs.com/api/v1.0/email/send", data, {
      headers: { "Content-Type": "application/json" },
    });
    res.status(200).json({ message: "Otp sent successfully", success: true });
    console.log("SUCCESS!", emailjsResponse.status, emailjsResponse.statusText);
  } catch (err) {
    res.status(500).json({ message: "Failed to send otp", success: false });
    console.error("FAILED...", err.response?.data || err.message);
  }
};
const signup = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;
    console.log("signup params: " + name, email, password, otp);
    const user = await UserModel.findOne({ email });
    if (user) {
      return res.status(409).json({ message: "User already exists!!" });
    }
    const existingOtp = await Otp.findOne({ email: email });
    if (!existingOtp) return res.status(409).json({ message: "Generate an otp first" });
    console.log("existing otp: " + existingOtp);
    if (String(otp) !== String(existingOtp.code)) return res.status(409).json({ message: "Otp verification failed" });
    const userModel = new UserModel({ name, email, password });
    userModel.password = await bcrypt.hash(password, 10);
    await userModel.save();
    const savedUser = await UserModel.findOne({ email });
    const token = generateToken(savedUser);
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      message: "SignedUp Successfully!",
      token,
      email,
      name: savedUser.name,
      success: true,
    });
  } catch (err) {
    res.status(500).json({ message: `Internal Server Error: ` + err, success: false });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(403).json({ message: "User not found!", success: false });
    }
    const isPassEqual = await bcrypt.compare(password, user.password);
    if (!isPassEqual) {
      return res.status(403).json({ message: "Email or Password is wrong!", success: false });
    }
    const token = generateToken(user);
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      message: "LoggedIn Successfully!",
      token,
      email,
      name: user.name,
      success: true,
    });
  } catch (err) {
    res.status(500).json({ message: `Internel Server Error: ` + err, success: false });
  }
};

const logout = async (req, res) => {
  res.clearCookie("jwt", { httpOnly: true, secure: true, sameSite: "none" });
  res.status(200).json({ message: "Logged out successfully", success: true });
};

const getMe = async (req, res) => {
  try {
    console.log("reached auth check");
    const token = req.cookies.jwt;
    if (!token) {
      console.log("no token");
      console.log(token);
      return res.status(401).json({
        success: false,
      });
    }
    console.log(token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({
        message: "Invalid token",
        success: false,
      });
    }
    const email = decoded.email;
    const user = await UserModel.findOne({ email });
    res.status(200).json({
      data: { email: user.email, name: user.name, id: decoded._id },
      success: true,
    });
  } catch (err) {
    console.error("Auth Error:", err.message);
    res.status(401).json({
      message: "Authentication failed",
      error: err.message,
      success: false,
    });
  }
};
module.exports = {
  sendOtp,
  signup,
  login,
  logout,
  getMe,
};
