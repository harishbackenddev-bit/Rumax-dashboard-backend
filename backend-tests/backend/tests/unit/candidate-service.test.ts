import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockRes, catchApiError } from "../helpers/mockRes";

const m = vi.hoisted(() => {
  const candidateModel: any = { findOne: vi.fn() };
  const applicationModel: any = vi.fn();
  applicationModel.findOne = vi.fn();
  return { candidateModel, applicationModel };
});

vi.mock("src/models/candidate/candidate-schema", () => ({ candidateModel: m.candidateModel }));
vi.mock("src/models/job/application-schema", () => ({ applicationModel: m.applicationModel }));
vi.mock("src/utils/email-service", () => ({
  sendStatusUpdateEmail: vi.fn(), sendDocumentRequestEmail: vi.fn(),
}));
vi.mock("src/config/multer", () => ({ deleteFile: vi.fn() }));

import {
  applyForJobService, deleteCandidateService, updateCandidateStatusService,
} from "src/services/admin/candidate-service";

const res = mockRes();
const { candidateModel, applicationModel } = m;
beforeEach(() => vi.clearAllMocks());

describe("applyForJobService", () => {
  const payload = { candidateId: "c1", jobId: "j1", jobTitle: "Carer", coverLetter: "hi" };

  it("rejects when candidate profile doesn't exist", async () => {
    candidateModel.findOne.mockResolvedValue(null);
    const err = await catchApiError(() => applyForJobService(payload, res));
    expect(err.message).toContain("Candidate profile not found");
  });

  it("requires jobId", async () => {
    candidateModel.findOne.mockResolvedValue({ _id: "c1" });
    const err = await catchApiError(() => applyForJobService({ ...payload, jobId: null }, res));
    expect(err.message).toContain("Job ID is required");
  });

  it("requires jobTitle", async () => {
    candidateModel.findOne.mockResolvedValue({ _id: "c1" });
    const err = await catchApiError(() => applyForJobService({ ...payload, jobTitle: "" }, res));
    expect(err.message).toContain("Job Title is required");
  });

  it("blocks duplicate applications for the same job", async () => {
    candidateModel.findOne.mockResolvedValue({ _id: "c1" });
    applicationModel.findOne.mockResolvedValue({ _id: "app1" });
    const err = await catchApiError(() => applyForJobService(payload, res));
    expect(err.message).toContain("You have already applied for this position");
    expect(applicationModel.findOne).toHaveBeenCalledWith({ candidateId: "c1", jobId: "j1", isDeleted: false });
  });

  it("creates a Pending application with defaults", async () => {
    candidateModel.findOne.mockResolvedValue({ _id: "c1" });
    applicationModel.findOne.mockResolvedValue(null);
    let created: any;
    applicationModel.mockImplementation(function (this: any, d: any) {
      created = d; Object.assign(this, d); this.save = vi.fn().mockResolvedValue(true);
    });

    const out: any = await applyForJobService(payload, res);

    expect(out.success).toBe(true);
    expect(created).toMatchObject({
      candidateId: "c1", jobId: "j1", jobTitle: "Carer", coverLetter: "hi",
      status: "Pending", additionalNotes: "", expectedSalary: "", noticePeriod: "",
      createdBy: "c1", updatedBy: "c1", jobSnapshot: {},
    });
    expect(created.applicationDate).toBeInstanceOf(Date);
  });
});

describe("deleteCandidateService", () => {
  it("soft-deletes an existing candidate", async () => {
    const c: any = { isDeleted: false, save: vi.fn().mockResolvedValue(true) };
    candidateModel.findOne.mockResolvedValue(c);
    const out: any = await deleteCandidateService("c1", res);
    expect(candidateModel.findOne).toHaveBeenCalledWith({ _id: "c1", isDeleted: false });
    expect(c.isDeleted).toBe(true);
    expect(c.save).toHaveBeenCalled();
    expect(out.success).toBe(true);
  });

  it("rejects when candidate not found", async () => {
    candidateModel.findOne.mockResolvedValue(null);
    expect((await catchApiError(() => deleteCandidateService("x", res))).message).toContain("Candidate not found");
  });
});

describe("updateCandidateStatusService", () => {
  const makeCandidate = () => ({
    status: "Active", appliedDate: "2026-03-05T10:00:00.000Z",
    save: vi.fn().mockResolvedValue(true),
    toObject() { return { status: this.status, appliedDate: this.appliedDate }; },
  });

  it.each(["Active", "In Review", "Interview Scheduled", "Offer Sent", "Hired", "Rejected"])(
    "accepts valid status '%s'", async (status) => {
      const c: any = makeCandidate();
      candidateModel.findOne.mockResolvedValue(c);
      const out: any = await updateCandidateStatusService("c1", status, res);
      expect(c.status).toBe(status);
      expect(c.save).toHaveBeenCalled();
      expect(out.message).toBe(`Candidate status updated to "${status}"`);
      expect(out.data.appliedDate).toBe("2026-03-05");
    });

  it("rejects an invalid status and does not save", async () => {
    const c: any = makeCandidate();
    candidateModel.findOne.mockResolvedValue(c);
    const err = await catchApiError(() => updateCandidateStatusService("c1", "Banana", res));
    expect(err.message).toContain("Invalid status");
    expect(c.save).not.toHaveBeenCalled();
  });

  it("rejects when candidate not found", async () => {
    candidateModel.findOne.mockResolvedValue(null);
    expect((await catchApiError(() => updateCandidateStatusService("x", "Hired", res))).message).toContain("Candidate not found");
  });

  it.fails("candidate not found -> HTTP 404 (currently wrapped to 500)", async () => {
    candidateModel.findOne.mockResolvedValue(null);
    expect((await catchApiError(() => updateCandidateStatusService("x", "Hired", res))).code).toBe(404);
  });
});
