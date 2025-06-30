const express = require("express");
const router = express.Router();
const CompanyController = require("../controllers/CompanyController");
const getCompanyEmails = CompanyController.getCompanyEmails;
const getCompanyData = CompanyController.getCompanyData;
const ensureAuthenticated = require("../middlewares/Auth");
// GET /api/company?name=CompanyName
router.get("/", ensureAuthenticated, getCompanyData);
router.get("/get-company-emails", ensureAuthenticated, getCompanyEmails);
module.exports = router;
