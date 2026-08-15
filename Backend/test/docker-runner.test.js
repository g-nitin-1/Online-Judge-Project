const assert = require("node:assert/strict");
const test = require("node:test");
const {
  DockerRunner,
  dockerArguments,
  normalizeOutput
} = require("../Judge/DockerRunner");

test("normalizes platform line endings and trailing whitespace", () => {
  assert.equal(normalizeOutput("one\r\ntwo\r\n"), "one\ntwo");
});

test("Docker invocation includes required isolation controls", () => {
  const config = {
    imageEnv: "TEST_JUDGE_IMAGE",
    image: "example/runtime:fixed",
    command: ["runtime", "/submission/Main"]
  };
  const args = dockerArguments({
    config,
    containerName: "judge-test",
    sourceDirectory: "/tmp/judge-test"
  });

  assert.deepEqual(args.slice(0, 3), ["run", "--rm", "--name"]);
  assert.ok(args.includes("none"), "networking must be disabled");
  assert.ok(args.includes("ALL"), "all Linux capabilities must be dropped");
  assert.ok(args.includes("no-new-privileges"));
  assert.ok(args.includes("--read-only"));
  assert.ok(args.includes("--pids-limit"));
  assert.ok(args.includes("example/runtime:fixed"));
});

test(
  "executes supported languages in isolated containers",
  { skip: process.env.RUN_DOCKER_TESTS !== "1", timeout: 30000 },
  async () => {
    const runner = new DockerRunner();
    const programs = [
      {
        language: "javascript",
        solution: `
          const fs = require("node:fs");
          let filesystemBlocked = false;
          try { fs.writeFileSync("/owned", "unsafe"); } catch { filesystemBlocked = true; }
          const input = Number(fs.readFileSync(0, "utf8").trim());
          console.log(filesystemBlocked ? input * 2 : "unsafe");
        `
      },
      {
        language: "python",
        solution: "print(int(input()) * 2)"
      },
      {
        language: "java",
        solution: `
          import java.util.Scanner;
          class Main {
            public static void main(String[] args) {
              Scanner input = new Scanner(System.in);
              System.out.println(input.nextInt() * 2);
            }
          }
        `
      }
    ];

    for (const program of programs) {
      const result = await runner.run({
        ...program,
        testCases: [{ input: "21\n", expectedOutput: "42" }]
      });
      assert.deepEqual(result, { status: "pass", message: "1 test case(s) passed" });
    }
  }
);

test(
  "terminates programs that exceed the time limit",
  { skip: process.env.RUN_DOCKER_TESTS !== "1", timeout: 15000 },
  async () => {
    const runner = new DockerRunner();
    runner.timeoutMs = 300;
    const result = await runner.run({
      language: "javascript",
      solution: "while (true) {}",
      testCases: [{ input: "", expectedOutput: "" }]
    });
    assert.deepEqual(result, { status: "error", message: "Time limit exceeded" });
  }
);
