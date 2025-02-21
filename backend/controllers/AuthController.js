const UserModel = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateToken = (user) => {
  return jwt.sign(
    { email: user.email, _id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (user) {
      return res.status(409).json({ message: "User already exists!" });
    }
    const userModel = new UserModel({ name, email, password });
    userModel.password = await bcrypt.hash(password, 10);
    await userModel.save();
    const savedUser = await UserModel.findOne({ email });
    const token = generateToken(savedUser);
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
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
    res
      .status(500)
      .json({ message: `Internal Server Error: ` + err, success: false });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(403)
        .json({ message: "User not found!", success: false });
    }
    const isPassEqual = await bcrypt.compare(password, user.password);
    if (!isPassEqual) {
      return res
        .status(403)
        .json({ message: "Email or Password is wrong!", success: false });
    }
    const token = generateToken(user);
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
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
    res
      .status(500)
      .json({ message: `Internel Server Error: ` + err, success: false });
  }
};

const logout = async (req, res) => {
  res.clearCookie("jwt", { httpOnly: true, secure: true, sameSite: "strict" });
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
        message: "Not authenticated",
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
  signup,
  login,
  logout,
  getMe,
};
