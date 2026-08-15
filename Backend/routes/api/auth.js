const router = require("express").Router();
const { login, register } = require("../../controllers/auth");
const { authRateLimit } = require("../../middleware/rateLimits");

router.post("/register", authRateLimit, register);
router.post("/login", authRateLimit, login);

module.exports = router;
