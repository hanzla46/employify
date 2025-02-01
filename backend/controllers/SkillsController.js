const getSkills = async (req, res) => {
  res.status(200).json({ skills: req.name + " is a god skill" });
};

module.exports = { getSkills };
