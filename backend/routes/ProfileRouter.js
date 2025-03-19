 import {add, update} from '../controllers/ProfileController';
 import ensureAuthenticated from '../middlewares/Auth';
 const router = require("express").Router();
 router.post("/add", ensureAuthenticated, add);
 router.post("/update", ensureAuthenticated, update);
 module.exports = router;