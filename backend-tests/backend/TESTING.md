# Backend tests (Vitest + Supertest)

## Setup (backend project root, next to `src/`)
1. Copy `tests/` and `vitest.config.ts` here.
2. Install dev deps:
   `npm i -D vitest supertest @vitest/coverage-v8 @types/supertest`
   (project uses **zod v3** — keep it: `formatZodErrors` uses `error.errors`)
3. Add scripts to package.json:
   ```json
   "test": "vitest run",
   "test:watch": "vitest",
   "test:coverage": "vitest run --coverage"
   ```
4. Run: `npm test`

No database / .env needed: all Mongoose models, mail, SMS and uploads are mocked.

## One required source fix
`src/routes/admin.ts` imports `upload` twice (line 2 and line 35). Delete line 35:
`import { upload } from "../config/multer";`  (TypeScript: "Duplicate identifier")

## Layout
- `tests/unit/` – error handler, checkAuth, utils/queryBuilder, zod validation, user / job / candidate services
- `tests/routes/routes.test.ts` – HTTP tests (routes + controllers + checkAuth real, services mocked)
- `tests/routes/security.test.ts` – desired-auth tests for unprotected endpoints
- `tests/helpers/` – `mockRes`, `catchApiError`, `makeApp`

## `it.fails` = known bugs
14 tests use `it.fails`. They pass while the bug exists and start FAILING once you fix it —
then change `it.fails` -> `it`.
- Services wrap their own 400/404 errors in a second try/catch -> client gets 500 and a JSON-string
  message (password reset, createJob, deleteJob, updateCandidateStatus ...).
- Candidate list/get/delete/status and all upload routes have no `checkAuth`.
