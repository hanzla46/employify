const mongoose = require("mongoose");
require("dotenv").config();
const mongo_url = process.env.MONGODB_URL;
mongoose.connect(mongo_url).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log("Error connecting to MongoDB", err);
})