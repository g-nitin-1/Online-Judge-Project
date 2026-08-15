const express = require('express');
const router = express.Router()
const {create_question,question_all,GetOne} = require('../../controllers/questions')
const auth = require('../../middleware/auth')
const admin = require('../../middleware/admin')

router.post("/",auth,admin,create_question) // Create
router.get("/",question_all) // GetAll
router.get("/:id",GetOne) // GetONE




module.exports = router;
