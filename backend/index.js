const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

// ✅ CORS Middleware Fix
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Routes
app.use("/auth", require("./routes/AuthRouter"));
app.use("/skills", require("./routes/SkillsRouter"));

// ✅ Start Server
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
