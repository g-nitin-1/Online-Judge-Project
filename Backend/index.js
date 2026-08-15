require("dotenv").config();

const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const routes = require("./routes");

const app = express();

app.disable("x-powered-by");
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:3000" }));
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "256kb" }));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(routes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.status ? err.message : "Internal server error"
  });
});

async function start() {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/onlineJudge";
  const port = Number(process.env.PORT) || 5000;

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters");
  }
  if (!new Set(["disabled", "docker"]).has(process.env.JUDGE_ENGINE || "disabled")) {
    throw new Error("JUDGE_ENGINE must be either disabled or docker");
  }

  mongoose.set("sanitizeFilter", true);
  await mongoose.connect(mongoUri);
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

if (require.main === module) {
  start().catch(error => {
    console.error("Unable to start server:", error.message);
    process.exitCode = 1;
  });
}

module.exports = { app, start };
