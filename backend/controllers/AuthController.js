const UserModel = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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
    res.status(201).json({ message: "SignedUp Successfully!", success: true });
  } catch (err) {
    res
      .status(500)
      .json({ message: `Internel Server Error: ` + err, success: false });
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
    const jwtToken = jwt.sign(
      { email: user.email, _id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res
      .status(201)
      .json({
        message: "LoggedIn Successfully!",
        jwtToken,
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
module.exports = {
  signup,
  login,
};
