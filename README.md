
# Online Judge

A full-stack programming assessment platform where users can register, browse coding problems, write solutions in a browser-based editor, and evaluate JavaScript, Python, or Java programs against private test cases.

The project demonstrates secure untrusted-code execution, REST API design, JWT authentication, MongoDB persistence, responsive React interfaces, and automated integration testing.

## Engineering highlights

- Executes untrusted programs inside short-lived, isolated Docker containers.
- Applies CPU, memory, process, runtime, output, filesystem, privilege, and network restrictions.
- Keeps question test cases private and returns only verdicts to participants.
- Supports JavaScript, Python, and Java stdin/stdout programs.
- Uses JWT authentication and role-based authorization for administrative operations.
- Records submission verdicts, source code, language, runtime, and timestamps.
- Includes MongoDB-backed API tests and live Docker execution tests.
- Uses Vite route-level code splitting for a faster frontend development and build workflow.
- Runs backend tests, live Docker judge tests, and frontend production builds in CI.

## Features

### Participants

- Account registration and login
- Public problem list with difficulty, frequency, and rating
- Problem-specific starter code for each supported language
- Ace-powered code editor with syntax highlighting and autocompletion
- Accepted, wrong-answer, compilation/runtime-error, and time-limit results
- Personal submission history with previous source code and runtime

### Administrators

- Role-protected question creation API
- Private test-case management through the question model
- Configurable starter code, hints, difficulty, rating, and problem metadata
- Command-line administrator account provisioning

## Architecture

```text
┌────────────────────┐       HTTP / JSON       ┌────────────────────┐
│ React + Vite client│ ───────────────────────▶│ Express REST API   │
│ Ace code editor    │◀─────────────────────── │ JWT authorization  │
└────────────────────┘                         └─────────┬──────────┘
                                                      │
                                          ┌───────────┴───────────┐
                                          │                       │
                                          ▼                       ▼
                                  ┌──────────────┐       ┌────────────────┐
                                  │   MongoDB    │       │ Docker judge   │
                                  │ users, tasks │       │ isolated runs  │
                                  │ submissions  │       │ private tests  │
                                  └──────────────┘       └────────────────┘
```

A submission is authenticated, validated, persisted, and executed against the selected problem's private test cases. Each test starts a new container using a fixed runtime command. The container receives the source through a read-only mount and test input through standard input.

## Security model

Judge execution is disabled by default. When `JUDGE_ENGINE=docker` is explicitly configured, containers run with:

- networking disabled;
- a read-only root filesystem and source mount;
- an unprivileged user;
- all Linux capabilities dropped;
- `no-new-privileges` enabled;
- CPU, memory, process, file-descriptor, time, and output limits;
- automatic container and temporary-source cleanup.

Authentication endpoints and submissions are rate-limited, API responses use security headers, JWT secrets are validated during startup, and private test cases are excluded from participant-facing queries.

For a larger public deployment, the Docker judge should run on separate worker infrastructure behind a queue. Runtime images should also be pinned by digest.

## Technology stack

| Area       | Technologies                                                            |
| ---------- | ----------------------------------------------------------------------- |
| Frontend   | React 18, Vite, React Router, Axios, Material UI, Bootstrap, Ace Editor |
| Backend    | Node.js, Express, Mongoose, JWT, bcrypt, Helmet                         |
| Database   | MongoDB                                                                 |
| Judge      | Docker, Node.js, Python, Eclipse Temurin Java                           |
| Testing    | Node test runner, MongoDB Memory Server, live Docker integration tests  |
| Automation | GitHub Actions, npm audit                                               |

## Project structure

```text
Online-Judge-Project/
├── Backend/
│   ├── Judge/              # Docker-isolated execution engine
│   ├── controllers/        # Authentication, questions, submissions
│   ├── middleware/         # JWT, roles, and rate limits
│   ├── models/             # User, question, and submission schemas
│   ├── routes/             # REST API endpoints
│   ├── scripts/            # Administrator provisioning
│   └── test/               # API, database, and Docker tests
├── frontend/
│   ├── public/             # Static browser assets
│   └── src/                # React components, API clients, and utilities
└── .github/workflows/      # Continuous integration
```

## Getting started

### Prerequisites

- Node.js 20.19 or newer
- npm
- MongoDB
- Docker, if code execution is enabled

### Installation

```bash
git clone <repository-url>
cd Online-Judge-Project
npm ci --prefix Backend
npm ci --prefix frontend
```

Copy the environment templates:

```bash
cp Backend/.env.example Backend/.env
cp frontend/.env.example frontend/.env
```

Replace `JWT_SECRET` in `Backend/.env` with a long, randomly generated value. The default development URLs are:

- Frontend: `http://localhost:3000`
- API: `http://localhost:5000`
- API health check: `http://localhost:5000/health`

### Create an administrator

Provide credentials as environment variables so the password is not saved in shell history:

```bash
ADMIN_EMAIL=admin@example.com \
ADMIN_PASSWORD='replace-with-a-strong-password' \
npm run create-admin --prefix Backend
```

### Enable the Docker judge

Install the supported runtime images:

```bash
docker pull node:20-alpine
docker pull python:3.12-alpine
docker pull eclipse-temurin:21-jdk-alpine
```

Set the following value in `Backend/.env`:

```dotenv
JUDGE_ENGINE=docker
```

Submitted solutions must be complete stdin/stdout programs. Java solutions must declare `class Main`.

### Run the application

Start the API and frontend in separate terminals:

```bash
npm start --prefix Backend
npm start --prefix frontend
```

## Question test-case format

Questions require between 1 and 50 private test cases:

```json
{
  "title": "Double a number",
  "uniquename": "double-a-number",
  "testCases": [
    {
      "input": "21\n",
      "expectedOutput": "42\n"
    }
  ]
}
```

Test-case input and expected output are not included in participant-facing question responses or wrong-answer results.

## API overview

| Method   | Endpoint                              | Access        | Purpose                              |
| -------- | ------------------------------------- | ------------- | ------------------------------------ |
| `GET`  | `/health`                           | Public        | API health check                     |
| `POST` | `/api/auth/register`                | Public        | Create an account                    |
| `POST` | `/api/auth/login`                   | Public        | Authenticate and receive a JWT       |
| `GET`  | `/api/questions`                    | Public        | List problems                        |
| `GET`  | `/api/questions/:uniquename`        | Public        | Retrieve one problem                 |
| `POST` | `/api/questions`                    | Administrator | Create a problem and private tests   |
| `POST` | `/api/submit/run`                   | Authenticated | Judge a submission                   |
| `GET`  | `/api/submit/submissions/:question` | Authenticated | Retrieve personal submission history |

Protected endpoints expect the header:

```http
Authorization: Bearer <token>
```

## Testing and quality checks

Run the normal backend suite:

```bash
npm test --prefix Backend
```

Run the complete suite, including live JavaScript, Python, and Java containers:

```bash
RUN_DOCKER_TESTS=1 npm test --prefix Backend
```

Build the production frontend and audit both dependency trees (currently zero reported vulnerabilities):

```bash
npm run build --prefix frontend
npm audit --prefix Backend
npm audit --prefix frontend
```

The current test suite covers authentication, duplicate registration, invalid login, JWT authorization, administrator access, private question creation, end-to-end Docker submissions, history persistence, runtime isolation, and time-limit enforcement.

## Current status and roadmap

The core local workflow is functional and covered by automated tests. Planned improvements include:

- Visual administrator interface for creating and editing problems
- Dedicated queue and remote judge workers for horizontal scaling
- Contest support, leaderboards, and submission analytics
- Additional languages and customizable resource limits per problem
- Browser-level end-to-end testing
- Production deployment manifests and observability

## License

This project currently uses the ISC license declared in its package metadata.
