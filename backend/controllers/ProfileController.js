const Profile = require("../models/ProfileModel.js");
const add = async (req, res) => {
    const userId = req.user._id;
    const {hardSkills, softSkills, jobs, projects} = req.body;
    const profile = new Profile({
        userId, hardSkills, softSkills, jobs, projects
    });
    await profile.save();
    res.status(200).json({ message: "profile added", success: true });
}
const update = async (req, res) => {
    res.status(201).json({ message: "profile updated" });
}
module.exports = { add, update };