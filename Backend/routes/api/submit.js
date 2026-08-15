
const express = require('express');
const router = express.Router()
const { submission_run, getSubmissions } = require('../../controllers/submission')
const auth = require('../../middleware/auth')
const { submissionRateLimit } = require('../../middleware/rateLimits')
// questions

router.post("/run",submissionRateLimit,auth,submission_run);
router.get('/submissions/:filter', auth, getSubmissions)



module.exports = router;
