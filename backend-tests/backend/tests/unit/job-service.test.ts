import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockRes, catchApiError } from "../helpers/mockRes";

const m = vi.hoisted(() => {
  const jobModel: any = vi.fn();
  jobModel.findOne = vi.fn();
  jobModel.countDocuments = vi.fn();
  return { jobModel };
});

vi.mock("src/models/job/job-schema", () => ({ jobModel: m.jobModel }));
vi.mock("src/models/job/application-schema", () => ({ applicationModel: {} }));
vi.mock("src/models/candidate/candidate-schema", () => ({ candidateModel: {} }));
vi.mock("src/models/admin/admin-schema", () => ({ adminModel: {} }));
vi.mock("src/models/user/user-schema", () => ({ usersModel: {} }));
vi.mock("src/models/roles/roles-schema", () => ({ roleModel: {} }));
vi.mock("src/models/password-token-schema", () => ({ passwordResetTokenModel: {} }));
vi.mock("src/utils/mails/mail", () => ({ sendPasswordResetEmail: vi.fn() }));
vi.mock("src/utils/mails/token", () => ({
  generatePasswordResetToken: vi.fn(), getPasswordResetTokenByToken: vi.fn(), generatePasswordResetTokenByPhone: vi.fn(),
}));
vi.mock("src/utils/sms/sms", () => ({ generatePasswordResetTokenByPhoneWithTwilio: vi.fn() }));

import {
  createJobService, deleteJobService, publishJobService, getJobStatsService,
} from "src/services/admin/admin-service";

const res = mockRes();
const { jobModel } = m;

const validJob = {
  jobTitle: "  Care Assistant ", availability: "Full Time", experience: "1+ Years", contractType: "Permanent",
  locations: ["London"], salaryMin: "20000", salaryMax: "30000", deadline: "2026-12-31",
};

// capture what's passed to `new jobModel(...)`
const captureNewJob = () => {
  const ref: { data?: any; save?: any } = {};
  jobModel.mockImplementation(function (this: any, data: any) {
    ref.data = data;
    Object.assign(this, data);
    this.save = ref.save = vi.fn().mockResolvedValue(true);
  });
  return ref;
};

beforeEach(() => vi.clearAllMocks());

describe("createJobService", () => {
  it("creates a Draft with sensible defaults and trims the title", async () => {
    const ref = captureNewJob();
    const out: any = await createJobService(validJob, "admin-1", res);

    expect(out).toMatchObject({ success: true, message: "Draft saved successfully!" });
    expect(ref.save).toHaveBeenCalledOnce();
    expect(ref.data).toMatchObject({
      jobTitle: "Care Assistant",
      status: "Draft",
      autoShortlistScore: 75,
      requireResume: true,
      requireDBS: true,
      requireReferences: true,
      requireCoverLetter: false,
      requireDrivingLicence: false,
      startDate: null,
      notes: null,
      responsibilities: [],
      createdBy: "admin-1",
    });
  });

  it("returns the 'published' message when status is Open", async () => {
    captureNewJob();
    const out: any = await createJobService({ ...validJob, status: "Open" }, "admin-1", res);
    expect(out.message).toBe("Job published successfully!");
    expect(out.data.status).toBe("Open");
  });

  it("respects explicit false for requireResume / requireDBS", async () => {
    const ref = captureNewJob();
    await createJobService({ ...validJob, requireResume: false, requireDBS: false }, "a", res);
    expect(ref.data.requireResume).toBe(false);
    expect(ref.data.requireDBS).toBe(false);
  });

  it.each(["jobTitle", "availability", "experience", "contractType", "salaryMin", "salaryMax", "deadline"])(
    "rejects when %s is missing (and never saves)", async (field) => {
      const ref = captureNewJob();
      const payload: any = { ...validJob };
      delete payload[field];
      const err = await catchApiError(() => createJobService(payload, "a", res));
      expect(err.message).toContain("Missing required fields");
      expect(ref.save).toBeUndefined();
    });

  it("rejects when locations is empty", async () => {
    const err = await catchApiError(() => createJobService({ ...validJob, locations: [] }, "a", res));
    expect(err.message).toContain("Missing required fields");
  });

  it("propagates database save errors", async () => {
    jobModel.mockImplementation(function (this: any) { this.save = vi.fn().mockRejectedValue(new Error("db down")); });
    const err = await catchApiError(() => createJobService(validJob, "a", res));
    expect(err.message).toContain("db down");
  });

  // KNOWN BUG (same pattern as password reset): validation errors are re-wrapped by the
  // function's own catch -> client gets 500 + JSON-string message instead of 400.
  it.fails("missing fields -> HTTP 400 with a clean message", async () => {
    const err = await catchApiError(() => createJobService({ ...validJob, jobTitle: "" }, "a", res));
    expect(err).toMatchObject({ code: 400, message: "Missing required fields. Please fill in all required fields." });
  });
});

describe("deleteJobService (soft delete)", () => {
  it("marks the job deleted + Archived", async () => {
    const job: any = { isDeleted: false, status: "Open", save: vi.fn().mockResolvedValue(true) };
    jobModel.findOne.mockResolvedValue(job);
    const out: any = await deleteJobService("job1", res);
    expect(jobModel.findOne).toHaveBeenCalledWith({ _id: "job1", isDeleted: false });
    expect(job).toMatchObject({ isDeleted: true, status: "Archived" });
    expect(job.save).toHaveBeenCalled();
    expect(out.success).toBe(true);
  });

  it("rejects when job not found", async () => {
    jobModel.findOne.mockResolvedValue(null);
    const err = await catchApiError(() => deleteJobService("nope", res));
    expect(err.message).toContain("Job not found");
  });

  it.fails("job not found -> HTTP 404", async () => {
    jobModel.findOne.mockResolvedValue(null);
    const err = await catchApiError(() => deleteJobService("nope", res));
    expect(err.code).toBe(404);
  });
});

describe("publishJobService", () => {
  const completeJob = () => ({
    jobTitle: "T", availability: "Full Time", experience: "1+ Years", contractType: "Permanent",
    locations: ["London"], salaryMin: "1", salaryMax: "2", deadline: "2026-12-31", notes: "n",
    responsibilities: [{ id: "1", text: "r" }], requirements: [{ id: "1", text: "q" }],
    teamMembers: [{ id: "1" }], status: "Draft", publishedAt: null as any, save: vi.fn().mockResolvedValue(true),
  });

  it("sets status Open and publishedAt when everything is filled in", async () => {
    const job: any = completeJob();
    jobModel.findOne.mockResolvedValue(job);
    const out: any = await publishJobService("j1", res);
    expect(job.status).toBe("Open");
    expect(job.publishedAt).toBeInstanceOf(Date);
    expect(job.save).toHaveBeenCalled();
    expect(out.message).toBe("Job published successfully!");
  });

  it.each([
    ["notes", { notes: "" }],
    ["responsibilities", { responsibilities: [] }],
    ["requirements", { requirements: [] }],
    ["teamMembers", { teamMembers: [] }],
    ["locations", { locations: [] }],
  ])("refuses to publish when %s is missing", async (_n, patch) => {
    const job: any = { ...completeJob(), ...patch };
    jobModel.findOne.mockResolvedValue(job);
    const err = await catchApiError(() => publishJobService("j1", res));
    expect(err.message).toContain("Cannot publish job");
    expect(job.save).not.toHaveBeenCalled();
    expect(job.status).toBe("Draft");
  });
});

describe("getJobStatsService", () => {
  it("returns counts per status", async () => {
    jobModel.countDocuments
      .mockResolvedValueOnce(10).mockResolvedValueOnce(4).mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2).mockResolvedValueOnce(1);
    const out: any = await getJobStatsService();
    expect(out).toEqual({ success: true, data: { total: 10, open: 4, draft: 3, closed: 2, paused: 1 } });
  });

  it("returns success:false (does not throw) on DB failure", async () => {
    jobModel.countDocuments.mockRejectedValue(new Error("boom"));
    const out: any = await getJobStatsService();
    expect(out).toMatchObject({ success: false, message: "boom", data: null });
  });
});
