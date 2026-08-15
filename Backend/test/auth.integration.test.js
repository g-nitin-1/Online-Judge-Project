const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { app } = require("../index");
const User = require("../models/user");

let mongo;
let server;
let baseUrl;
let authToken;

before(async () => {
  process.env.JWT_SECRET = "integration-test-secret-that-is-long-enough";
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await new Promise(resolve => {
    server = app.listen(0, "127.0.0.1", () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise(resolve => server.close(resolve));
  await mongoose.disconnect();
  await mongo.stop();
});

async function post(path, body, token) {
  return fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
}

test("registration, login, duplicate handling, and authorization", async () => {
  const account = {
    name: "Test User",
    email: "person@example.com",
    password: "correct horse battery staple"
  };

  const registration = await post("/api/auth/register", account);
  assert.equal(registration.status, 201);
  const registeredUser = await registration.json();
  assert.equal(registeredUser.email, account.email);
  assert.equal(registeredUser.role, "ROLE_MEMBER");
  assert.ok(registeredUser.token);
  assert.equal(registeredUser.passwordHash, undefined);

  const duplicate = await post("/api/auth/register", account);
  assert.equal(duplicate.status, 409);

  const invalidLogin = await post("/api/auth/login", {
    email: account.email,
    password: "incorrect password"
  });
  assert.equal(invalidLogin.status, 401);

  const login = await post("/api/auth/login", {
    email: account.email,
    password: account.password
  });
  assert.equal(login.status, 200);
  const loggedInUser = await login.json();
  assert.ok(loggedInUser.token);
  authToken = loggedInUser.token;

  const adminOnly = await post("/api/questions", {}, loggedInUser.token);
  assert.equal(adminOnly.status, 403);

  const disabledJudge = await post("/api/submit/run", {}, loggedInUser.token);
  assert.equal(disabledJudge.status, 503);
});

test(
  "administrator creates a private-test question and submits through Docker",
  { skip: process.env.RUN_DOCKER_TESTS !== "1", timeout: 20000 },
  async () => {
    await User.updateOne({ email: "person@example.com" }, { role: "ROLE_ADMIN" });
    const question = await post(
      "/api/questions",
      {
        sequence: 1,
        title: "Double a number",
        uniquename: "double-a-number",
        description: "Read an integer and print twice its value.",
        difficulty: 10,
        frequency: 100,
        rating: 3,
        jsmain: "const fs = require('node:fs');\nconst n = Number(fs.readFileSync(0, 'utf8'));\nconsole.log(n * 2);",
        testCases: [
          { input: "21\n", expectedOutput: "42\n" },
          { input: "-4\n", expectedOutput: "-8\n" }
        ]
      },
      authToken
    );
    assert.equal(question.status, 200);

    process.env.JUDGE_ENGINE = "docker";
    try {
      const submission = await post(
        "/api/submit/run",
        {
          uniquename: "double-a-number",
          language: "javascript",
          solution: "const fs=require('node:fs');const n=Number(fs.readFileSync(0,'utf8'));console.log(n*2);"
        },
        authToken
      );
      assert.equal(submission.status, 200);
      assert.deepEqual(await submission.json(), {
        status: "pass",
        message: "2 test case(s) passed"
      });

      const history = await fetch(`${baseUrl}/api/submit/submissions/double-a-number`, {
        headers: { authorization: `Bearer ${authToken}` }
      });
      assert.equal(history.status, 200);
      const submissions = await history.json();
      assert.equal(submissions.length, 1);
      assert.equal(submissions[0].status, "pass");
    } finally {
      process.env.JUDGE_ENGINE = "disabled";
    }
  }
);
