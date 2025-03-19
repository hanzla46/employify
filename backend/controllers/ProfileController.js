const add = async (req, res) => {
    res.status(201).json({ message: "profile added" });
}
const update = async (req, res) => {
    res.status(201).json({ message: "profile updated" });
}
module.exports = { add, update };