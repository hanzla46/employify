const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");


require("./models/db");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

let dev_env = false; 

// ✅ Move CORS to the top
app.use(
  cors({
    origin: "*", 
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const AuthRouter = require("./routes/AuthRouter");
const SkillsRouter = require("./routes/SkillsRouter");
// ✅ Ensure CORS is before the routes
app.use("/auth", AuthRouter);
app.use("/skills", SkillsRouter);

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
