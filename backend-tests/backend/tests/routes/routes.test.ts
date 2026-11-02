import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

// --- keep side effects (disk dirs, DB, mail) out of the test run ---
vi.mock("src/config/multer", () => {
  const pass = (_q: any, _s: any, n: any) => n();
  return {
    upload: { single: () => pass }, handleMulterError: (e: any) => ({ success: false, message: e.message }),
    deleteFile: vi.fn(),
  };
});
vi.mock("src/config/multerConfig", () => {
  const pass = (_q: any, _s: any, n: any) => n();
  const single = { single: () => pass };
  return {
    uploadProfile: single, uploadDocument: single, uploadCertificate: single,
    uploadMultipleDocuments: pass,
  };
});
vi.mock("src/utils/email-service", () => ({ sendStatusUpdateEmail: vi.fn(), sendDocumentRequestEmail: vi.fn() }));
vi.mock("src/utils/mails/mail", () => ({ sendPasswordResetEmail: vi.fn() }));
vi.mock("src/utils/mails/token", () => ({}));
vi.mock("src/utils/sms/sms", () => ({}));

// --- mock the service layer; routes + controllers + checkAuth are real ---
vi.mock("src/services/user/user");
vi.mock("src/services/admin/admin-service");
vi.mock("src/services/admin/candidate-service");
vi.mock("src/services/website/website");

import * as userSvc from "src/services/user/user";
import * as adminSvc from "src/services/admin/admin-service";
import * as candSvc from "src/services/admin/candidate-service";
import * as webSvc from "src/services/website/website";
import { makeApp } from "../helpers/makeApp";

const app = makeApp();
const token = () => jwt.sign({ id: "u1" }, "test-secret", { expiresIn: "1h" });
const bearer = () => ({ Authorization: `Bearer ${token()}` });
const apiError = (message: string, code: number) => new Error(JSON.stringify({ success: false, message, code }));

beforeEach(() => vi.clearAllMocks());

describe("Auth routes (/api/auth, /api)", () => {
  it("POST /api/auth/login -> 200 with service result", async () => {
    vi.mocked(userSvc.loginService).mockResolvedValue({ success: true, token: "t", data: { role: "user" } } as any);
    const r = await request(app).post("/api/auth/login").send({ email: "a@b.com", password: "x" });
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ success: true, token: "t" });
    expect(userSvc.loginService).toHaveBeenCalledWith({ email: "a@b.com", password: "x" }, expect.anything());
  });

  it("POST /api/auth/login maps thrown API errors to their status code", async () => {
    vi.mocked(userSvc.loginService).mockRejectedValue(apiError("Invalid password", 401));
    const r = await request(app).post("/api/auth/login").send({ email: "a@b.com", password: "bad" });
    expect(r.status).toBe(401);
    expect(r.body).toEqual({ success: false, message: "Invalid password" });
  });

  it("unexpected (non-API) errors become 500", async () => {
    vi.mocked(userSvc.loginService).mockRejectedValue(new Error("kaboom"));
    const r = await request(app).post("/api/auth/login").send({});
    expect(r.status).toBe(500);
  });

  it("POST /api/auth/register -> 201", async () => {
    vi.mocked(userSvc.signupService).mockResolvedValue({ success: true, token: "t" } as any);
    const r = await request(app).post("/api/auth/register").send({ name: "A", email: "a@b.com" });
    expect(r.status).toBe(201);
  });

  it("GET /api/auth/me without token -> 401", async () => {
    const r = await request(app).get("/api/auth/me");
    expect(r.status).toBe(401);
    expect(userSvc.userdataServive).not.toHaveBeenCalled();
  });

  it("GET /api/auth/me with token passes the user id to the service", async () => {
    vi.mocked(userSvc.userdataServive).mockResolvedValue({ success: true, data: { _id: "u1" } } as any);
    const r = await request(app).get("/api/auth/me").set(bearer());
    expect(r.status).toBe(200);
    expect(userSvc.userdataServive).toHaveBeenCalledWith({ userId: "u1" }, expect.anything());
  });

  it("PATCH /api/auth/update-profile is protected and forwards the body", async () => {
    expect((await request(app).patch("/api/auth/update-profile").send({ theme: "dark" })).status).toBe(401);
    vi.mocked(userSvc.updateAUserService).mockResolvedValue({ success: true } as any);
    const r = await request(app).patch("/api/auth/update-profile").set(bearer()).send({ theme: "dark" });
    expect(r.status).toBe(200);
    expect(userSvc.updateAUserService).toHaveBeenCalledWith({ userId: "u1", body: { theme: "dark" } }, expect.anything());
  });

  it("POST /api/auth/change-password requires a token", async () => {
    expect((await request(app).post("/api/auth/change-password").send({})).status).toBe(401);
  });
});

describe("Admin routes - auth guard", () => {
  const protectedRoutes: [string, string][] = [
    ["get", "/api/admin/dashboard"], ["get", "/api/admin/roles"], ["post", "/api/admin/roles"],
    ["get", "/api/admin/users"], ["post", "/api/admin/users"], ["delete", "/api/admin/user/1"],
    ["post", "/api/admin/jobs"], ["put", "/api/admin/job/1"], ["delete", "/api/admin/job/1"],
    ["post", "/api/admin/jobs/1/publish"], ["post", "/api/admin/candidates/apply"],
    ["post", "/api/admin/candidate/1/photo"], ["delete", "/api/admin/candidate/1/photo"],
  ];
  it.each(protectedRoutes)("%s %s -> 401 without token", async (method, url) => {
    const r = await (request(app) as any)[method](url);
    expect(r.status).toBe(401);
  });
});

describe("Admin routes - jobs", () => {
  it("GET /api/admin/jobs is public and forwards query params", async () => {
    vi.mocked(adminSvc.getAllJobsService).mockResolvedValue({ success: true, data: [] } as any);
    const r = await request(app).get("/api/admin/jobs?status=Open&page=2&location=London");
    expect(r.status).toBe(200);
    expect(adminSvc.getAllJobsService).toHaveBeenCalledWith(expect.objectContaining({ status: "Open", page: "2", location: "London" }));
  });

  it("GET /api/admin/job/:id is public", async () => {
    vi.mocked(adminSvc.getJobInfoService).mockResolvedValue({ success: true, data: { _id: "j1" } } as any);
    const r = await request(app).get("/api/admin/job/j1");
    expect(r.status).toBe(200);
    expect(adminSvc.getJobInfoService).toHaveBeenCalledWith("j1", expect.anything());
  });

  it("POST /api/admin/jobs creates a job as the logged in user", async () => {
    vi.mocked(adminSvc.createJobService).mockResolvedValue({ success: true } as any);
    const body = { jobTitle: "Carer" };
    const r = await request(app).post("/api/admin/jobs").set(bearer()).send(body);
    expect([200, 201]).toContain(r.status);
    expect(adminSvc.createJobService).toHaveBeenCalledWith(body, "u1", expect.anything());
  });

  it("GET /api/admin/jobs/stats is not shadowed by /jobs/:id style routes", async () => {
    vi.mocked(adminSvc.getJobStatsService).mockResolvedValue({ success: true, data: { total: 1 } } as any);
    const r = await request(app).get("/api/admin/jobs/stats");
    expect(r.status).toBe(200);
    expect(r.body.data.total).toBe(1);
  });
});

describe("Admin routes - candidates", () => {
  it("GET /api/admin/candidates forwards filters", async () => {
    vi.mocked(candSvc.getAllCandidatesService).mockResolvedValue({ success: true, data: [] } as any);
    const r = await request(app).get("/api/admin/candidates?status=Hired&search=bob");
    expect(r.status).toBe(200);
    expect(candSvc.getAllCandidatesService).toHaveBeenCalledWith(expect.objectContaining({ status: "Hired", search: "bob" }));
  });

  it("GET /api/admin/candidates/standby hits the standby handler", async () => {
    vi.mocked(candSvc.getAllstandbyCandidatesService).mockResolvedValue({ success: true, data: [] } as any);
    const r = await request(app).get("/api/admin/candidates/standby?role=carer");
    expect(r.status).toBe(200);
    expect(candSvc.getAllstandbyCandidatesService).toHaveBeenCalled();
  });

  it("POST /api/admin/candidates is public (profile creation)", async () => {
    vi.mocked(candSvc.createCandidateService).mockResolvedValue({ success: true, data: { _id: "c1", token: "t" } } as any);
    const r = await request(app).post("/api/admin/candidates").send({ email: "a@b.com" });
    expect([200, 201]).toContain(r.status);
    expect(r.body.data.token).toBe("t");
  });

  it("POST /api/admin/candidates/apply with a token calls applyForJobService", async () => {
    vi.mocked(candSvc.applyForJobService).mockResolvedValue({ success: true } as any);
    const r = await request(app).post("/api/admin/candidates/apply").set(bearer()).send({ candidateId: "c1", jobId: "j1" });
    expect([200, 201]).toContain(r.status);
    expect(candSvc.applyForJobService).toHaveBeenCalledWith({ candidateId: "c1", jobId: "j1" }, expect.anything());
  });

  it("PATCH /api/admin/candidate/:id/status is wired to the update handler", async () => {
    vi.mocked(candSvc.updateCandidateService).mockResolvedValue({ success: true } as any);
    const r = await request(app).patch("/api/admin/candidate/c1/status").send({ status: "Hired" });
    expect(r.status).toBe(200);
    expect(candSvc.updateCandidateService).toHaveBeenCalledWith("c1", { status: "Hired" }, expect.anything());
  });

  it("DELETE /api/admin/candidate/:id -> maps service 404", async () => {
    vi.mocked(candSvc.deleteCandidateService).mockRejectedValue(apiError("Candidate not found", 404));
    const r = await request(app).delete("/api/admin/candidate/zzz");
    expect(r.status).toBe(404);
    expect(r.body.message).toBe("Candidate not found");
  });
});

describe("Website form routes (public)", () => {
  const forms: [string, keyof typeof webSvc][] = [
    ["investigator-guide", "saveInvestigatorGuideService"],
    ["callback", "saveCallbackService"],
    ["feasibility", "saveFeasibilityService"],
    ["trial-support", "saveTrialSupportService"],
    ["domiciliary-assessment", "saveDomiciliaryAssessmentService"],
    ["training-booking", "saveTrainingBookingService"],
    ["feedback", "saveFeedbackService"],
    ["enquiry", "saveEnquiryService"],
    ["referral", "saveReferralService"],
    ["care-readiness", "saveCareReadinessService"],
    ["funding-pathway", "saveFundingPathwayService"],
    ["care-cost", "saveCareCostService"],
  ];

  it.each(forms)("POST /api/website/%s/save works without auth and passes the body through", async (path, fn) => {
    vi.mocked((webSvc as any)[fn]).mockResolvedValue({ success: true, message: "saved" });
    const body = { fullName: "A B", email: "a@b.com" };
    const r = await request(app).post(`/api/website/${path}/save`).send(body);
    expect(r.status).toBeLessThan(300);
    expect(r.body.success).toBe(true);
    expect((webSvc as any)[fn]).toHaveBeenCalledWith(body, expect.anything(), expect.anything());
  });

  it("returns the service error status for a bad form", async () => {
    vi.mocked(webSvc.saveCallbackService).mockRejectedValue(apiError("Missing required fields", 400));
    const r = await request(app).post("/api/website/callback/save").send({});
    expect(r.status).toBe(400);
    expect(r.body.message).toBe("Missing required fields");
  });

  it("only POST is allowed (GET -> 404)", async () => {
    expect((await request(app).get("/api/website/callback/save")).status).toBe(404);
  });
});
