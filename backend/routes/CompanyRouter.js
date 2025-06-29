const express = require("express");
const router = express.Router();
const CompanyController = require("../controllers/CompanyController");

// GET /api/company?name=CompanyName
router.get("/", CompanyController.getCompanyData);

module.exports = router;
