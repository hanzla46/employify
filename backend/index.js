const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
require("./models/db");
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;
const url = process.env.FRONTEND_URL;
// ✅
app.use(
  cors({
    origin: url, // Only allow frontend origin
    credentials: true, // Required for cookies
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  })
);

app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", url);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.sendStatus(200);
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use((req, res, next) => {
  console.log(`Request received:: ${req.method} ${req.path}`);
  next();
});
// ✅
app.use("/auth", require("./routes/AuthRouter"));
app.use("/skills", require("./routes/SkillsRouter"));
app.use("/interview", require("./routes/InterviewRouter"));
app.use("/profile", require("./routes/ProfileRouter"));

// ✅
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});