const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const { spawn } = require("node:child_process");

const languageConfig = {
  javascript: {
    imageEnv: "JUDGE_NODE_IMAGE",
    image: "node:20-alpine",
    filename: "Main.js",
    command: ["node", "/submission/Main.js"]
  },
  python: {
    imageEnv: "JUDGE_PYTHON_IMAGE",
    image: "python:3.12-alpine",
    filename: "main.py",
    command: ["python3", "/submission/main.py"]
  },
  java: {
    imageEnv: "JUDGE_JAVA_IMAGE",
    image: "eclipse-temurin:21-jdk-alpine",
    filename: "Main.java",
    command: [
      "sh",
      "-c",
      "javac -d /tmp/classes /submission/Main.java && java -cp /tmp/classes Main"
    ]
  }
};

function normalizeOutput(value) {
  return String(value).replace(/\r\n/g, "\n").trimEnd();
}

function dockerArguments({ config, containerName, sourceDirectory }) {
  const memory = process.env.JUDGE_MEMORY || "128m";
  const cpus = process.env.JUDGE_CPUS || "0.5";

  return [
    "run",
    "--rm",
    "--name", containerName,
    "--network", "none",
    "--memory", memory,
    "--memory-swap", memory,
    "--cpus", cpus,
    "--pids-limit", "64",
    "--read-only",
    "--cap-drop", "ALL",
    "--security-opt", "no-new-privileges",
    "--user", "65534:65534",
    "--ulimit", "nofile=64:64",
    "--tmpfs", "/tmp:rw,nosuid,nodev,size=32m,mode=1777",
    "--mount", `type=bind,source=${sourceDirectory},target=/submission,readonly`,
    "-i",
    process.env[config.imageEnv] || config.image,
    ...config.command
  ];
}

class DockerRunner {
  constructor({ spawnImpl = spawn } = {}) {
    this.spawn = spawnImpl;
    this.timeoutMs = Number(process.env.JUDGE_TIMEOUT_MS) || 5000;
    this.outputLimit = Number(process.env.JUDGE_OUTPUT_LIMIT_BYTES) || 65536;
  }

  async removeContainer(containerName) {
    await new Promise(resolve => {
      const cleanup = this.spawn("docker", ["rm", "-f", containerName], {
        stdio: "ignore"
      });
      cleanup.on("error", resolve);
      cleanup.on("close", resolve);
    });
  }

  runContainer(args, input, containerName) {
    return new Promise((resolve, reject) => {
      const child = this.spawn("docker", args, { stdio: ["pipe", "pipe", "pipe"] });
      const stdout = [];
      const stderr = [];
      let outputSize = 0;
      let finished = false;
      let timer;

      const finish = async (error, result) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        if (error?.cleanup) await this.removeContainer(containerName);
        if (error) reject(error);
        else resolve(result);
      };

      const collect = target => chunk => {
        outputSize += chunk.length;
        if (outputSize > this.outputLimit) {
          child.kill("SIGKILL");
          finish(Object.assign(new Error("Output limit exceeded"), { cleanup: true }));
          return;
        }
        target.push(chunk);
      };

      child.stdout.on("data", collect(stdout));
      child.stderr.on("data", collect(stderr));
      child.on("error", error => finish(error));
      child.on("close", code => finish(null, {
        code,
        stdout: Buffer.concat(stdout).toString("utf8"),
        stderr: Buffer.concat(stderr).toString("utf8")
      }));

      timer = setTimeout(() => {
        child.kill("SIGKILL");
        finish(Object.assign(new Error("Time limit exceeded"), { cleanup: true }));
      }, this.timeoutMs);

      child.stdin.end(input);
    });
  }

  async run({ language, solution, testCases }) {
    const config = languageConfig[language];
    if (!config) return { status: "error", message: "Unsupported language" };
    if (!Array.isArray(testCases) || testCases.length === 0) {
      return { status: "error", message: "No test cases are configured" };
    }

    const runtimeDirectory = path.join(__dirname, "temp");
    await fs.mkdir(runtimeDirectory, { recursive: true });
    const sourceDirectory = await fs.mkdtemp(path.join(runtimeDirectory, "online-judge-"));
    try {
      await fs.writeFile(path.join(sourceDirectory, config.filename), solution, {
        encoding: "utf8",
        mode: 0o444
      });

      for (let index = 0; index < testCases.length; index += 1) {
        const testCase = testCases[index];
        const containerName = `online-judge-${crypto.randomUUID()}`;
        const args = dockerArguments({ config, containerName, sourceDirectory });

        let result;
        try {
          result = await this.runContainer(args, String(testCase.input || ""), containerName);
        } catch (error) {
          return { status: "error", message: error.message };
        }

        if (result.code !== 0) {
          return {
            status: "error",
            message: normalizeOutput(result.stderr) || "Program exited with an error"
          };
        }

        const actual = normalizeOutput(result.stdout);
        const expected = normalizeOutput(testCase.expectedOutput);
        if (actual !== expected) {
          return {
            status: "fail",
            message: `Wrong answer on hidden test case ${index + 1}`
          };
        }
      }

      return { status: "pass", message: `${testCases.length} test case(s) passed` };
    } finally {
      await fs.rm(sourceDirectory, { recursive: true, force: true });
    }
  }
}

module.exports = { DockerRunner, dockerArguments, normalizeOutput };
