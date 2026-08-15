const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const User = require("../models/user");

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const error = new Error("JWT_SECRET is not configured");
    error.status = 503;
    throw error;
  }

  return jwt.sign({ id: user.id, role: user.role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "12h"
  });
}

function publicUser(user, token) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    token
  };
}

async function register(req, res, next) {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "A valid email is required" });
    }
    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({ error: "Password must be 8 to 72 characters" });
    }
    if (await User.exists({ email })) {
      return res.status(409).json({ error: "An account already exists for this email" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    res.status(201).json(publicUser(user, signToken(user)));
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json(publicUser(user, signToken(user)));
  } catch (error) {
    next(error);
  }
}

module.exports = { login, register };
