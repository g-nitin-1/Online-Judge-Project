const { rateLimit } = require("express-rate-limit");

const common = {
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ error: "Too many requests; try again later" })
};

const authRateLimit = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 30
});

const submissionRateLimit = rateLimit({
  ...common,
  windowMs: 60 * 1000,
  limit: 20
});

module.exports = { authRateLimit, submissionRateLimit };
