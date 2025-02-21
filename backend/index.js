const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const AuthRouter = require("./routes/AuthRouter");
const SkillsRouter = require("./routes/SkillsRouter");
require("./models/db");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

// ✅ Proper CORS setup
app.use(
  cors({
    origin: "http://localhost:5173", // Adjust this if needed
    credentials: true, // Allow cookies and authentication
  })
);

// ✅ Express JSON Parser (no need for bodyParser)
app.use(express.json());
app.use(require("cookie-parser")());
// ✅ Define Routes AFTER Middleware
app.use("/auth", AuthRouter);
app.use("/skills", SkillsRouter);

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
