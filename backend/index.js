const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const AuthRouter = require("./routes/AuthRouter");
const SkillsRouter = require("./routes/SkillsRouter");
require("./models/db");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

let dev_env = false;

  // app.use(
  //   cors({
  //     origin: dev_env ? "http://localhost:5173" : "https://employify.vercel.app",
  //     methods: ["GET", "POST"],
  //     credentials: true,
  //     allowedHeaders: 'Content-Type,Authorization' 
  //   })
  // );
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://employify.vercel.app"); // Replace with frontend URL
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
    next();
  });
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(require("cookie-parser")());

app.use("/auth", AuthRouter);
app.use("/skills", SkillsRouter);

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
