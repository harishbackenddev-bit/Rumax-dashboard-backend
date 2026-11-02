import { describe, it, expect, vi } from "vitest";
import request from "supertest";

vi.mock("src/config/multer", () => ({ upload: { single: () => (_q: any, _s: any, n: any) => n() }, handleMulterError: (e: any) => e, deleteFile: vi.fn() }));
vi.mock("src/config/multerConfig", () => {
  const pass = (_q: any, _s: any, n: any) => n();
  const single = { single: () => pass };
  return { uploadProfile: single, uploadDocument: single, uploadCertificate: single, uploadMultipleDocuments: pass };
});
vi.mock("src/utils/email-service", () => ({}));
vi.mock("src/utils/mails/mail", () => ({}));
vi.mock("src/utils/mails/token", () => ({}));
vi.mock("src/utils/sms/sms", () => ({}));
vi.mock("src/services/user/user");
vi.mock("src/services/admin/admin-service");
vi.mock("src/services/admin/candidate-service");
vi.mock("src/services/website/website");

import { makeApp } from "../helpers/makeApp";
const app = makeApp();

/**
 * SECURITY GAPS found while writing tests (see API docs, section 3).
 * These describe the DESIRED behaviour and use `it.fails`: they pass today because the
 * routes are unprotected. Once you add `checkAuth` to the routes, they start failing ->
 * change `it.fails` to `it`.
 */
describe("endpoints that should require authentication", () => {
  it.fails("GET /api/admin/candidates -> 401 without token", async () => {
    expect((await request(app).get("/api/admin/candidates")).status).toBe(401);
  });
  it.fails("GET /api/admin/candidate/:id -> 401 without token", async () => {
    expect((await request(app).get("/api/admin/candidate/1")).status).toBe(401);
  });
  it.fails("DELETE /api/admin/candidate/:id -> 401 without token", async () => {
    expect((await request(app).delete("/api/admin/candidate/1")).status).toBe(401);
  });
  it.fails("PATCH /api/admin/candidate/:id/status -> 401 without token", async () => {
    expect((await request(app).patch("/api/admin/candidate/1/status").send({ status: "Hired" })).status).toBe(401);
  });
  it.fails("DELETE /api/delete-document -> 401 without token", async () => {
    expect((await request(app).delete("/api/delete-document").send({ filePath: "/x" })).status).toBe(401);
  });
  it.fails("POST /api/upload-document -> 401 without token", async () => {
    expect((await request(app).post("/api/upload-document")).status).toBe(401);
  });
});
