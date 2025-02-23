const jwt = require("jsonwebtoken");

const ensureAuthenticated = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized: Token expired" });
    }
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = ensureAuthenticated;
