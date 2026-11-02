// Runs before every test file
import { vi, beforeEach } from "vitest";

process.env.JWT_SECRET = "test-secret";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.NODE_ENV = "test";

// source code logs a lot; keep test output clean (re-applied each test because restoreMocks resets spies)
beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});
