const mongoose = require("mongoose");
const SkillSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  skills: [
    {
      name: { type: String, required: true }, 
      level: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
        required: true,
      },
      experienceYears: { type: Number, required: true, min: 0 },
    },
  ],
});

const Skill = mongoose.model("Skill", SkillSchema);
module.exports = Skill;