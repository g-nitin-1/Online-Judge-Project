const Question = require("../models/question");
const { DockerRunner } = require("../Judge/DockerRunner");
const Submission = require("../models/submission");

const supportedLanguages = new Set(["java", "javascript", "python"]);
const dockerRunner = new DockerRunner();
let activeJobs = 0;

async function submission_run(req, res, next) {
  try {
    if (process.env.JUDGE_ENGINE !== "docker") {
      return res.status(503).json({
        error: "Code execution is disabled until an isolated judge worker is configured"
      });
    }

    const questionname = String(req.body.uniquename || "").trim();
    const language = String(req.body.language || "").toLowerCase();
    const solution = String(req.body.solution || "");

    if (!questionname || !supportedLanguages.has(language)) {
      return res.status(400).json({ error: "Invalid question or language" });
    }
    if (!solution || solution.length > 100000) {
      return res.status(400).json({ error: "Solution must contain 1 to 100000 characters" });
    }
    const question = await Question.findOne({ uniquename: questionname }).select("+testCases");
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const maximumJobs = Number(process.env.JUDGE_MAX_CONCURRENT) || 2;
    if (activeJobs >= maximumJobs) {
      return res.status(429).json({ error: "Judge capacity is currently full; try again shortly" });
    }

    activeJobs += 1;
    try {
      const submission = await Submission.create({
        username: req.user._id,
        questionname,
        language,
        solution,
        status: "initial",
        timesubmitted: new Date()
      });

      const startedAt = Date.now();
      let result;
      try {
        result = await dockerRunner.run({
          language,
          solution,
          testCases: question.testCases
        });
      } catch (error) {
        result = { status: "error", message: "Judge worker failed" };
        console.error("Judge worker failed:", error);
      }

      submission.status = result.status === "pass" || result.status === "fail" ? result.status : "error";
      submission.runtime = Date.now() - startedAt;
      submission.timeupdated = new Date();
      await submission.save();

      res.json(result);
    } finally {
      activeJobs -= 1;
    }
  } catch (error) {
    next(error);
  }
}

async function getSubmissions(req, res, next) {
  try {
    const submissions = await Submission.find({
      username: req.user._id,
      questionname: req.params.filter,
      status: { $ne: "initial" }
    }).sort({ timesubmitted: "desc" });

    res.json(submissions);
  } catch (error) {
    next(error);
  }
}

module.exports = { submission_run, getSubmissions };
