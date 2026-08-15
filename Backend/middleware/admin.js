function admin(req, res, next) {
  if (req.user.role !== "ROLE_ADMIN") {
    return res.status(403).json({ error: "Administrator access is required" });
  }
  next();
}

module.exports = admin;
