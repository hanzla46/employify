const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

// ✅ CORS Middleware Fix
app.use(
  cors({
    origin: "https://employify.vercel.app", // ✅ Frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Force CORS Headers for All Requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://employify.vercel.app");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).json({ success: true }); // ✅ Fix preflight error
  }

  next();
});

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
