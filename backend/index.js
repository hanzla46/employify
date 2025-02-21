const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

// ✅ Force CORS Headers for All Requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://employify.vercel.app"); // ✅ Your frontend URL
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // ✅ Fix preflight error
  }
  next();
});
app.use(
  cors({
    origin: "https://employify.vercel.app", // ✅ Frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(require("cookie-parser")());
app.use("/auth", require("./routes/AuthRouter"));
app.use("/skills", require("./routes/SkillsRouter"));

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
