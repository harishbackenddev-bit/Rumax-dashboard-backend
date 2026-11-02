import { describe, it, expect, vi } from "vitest";
import jwt from "jsonwebtoken";
import { checkAuth } from "src/middleware/check-auth";
import { mockRes } from "../helpers/mockRes";

const run = async (authorization?: string) => {
  const req: any = { headers: authorization ? { authorization } : {} };
  const res = mockRes();
  const next = vi.fn();
  await checkAuth(req, res, next);
  return { req, res, next };
};

describe("checkAuth middleware", () => {
  it("401 when Authorization header is missing", async () => {
    const { res, next } = await run();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Unauthorized token missing" });
    expect(next).not.toHaveBeenCalled();
  });

  it("401 for a malformed / invalid token", async () => {
    const { res, next } = await run("Bearer not-a-jwt");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Unauthorized token invalid or expired" });
    expect(next).not.toHaveBeenCalled();
  });

  it("401 for a token signed with the wrong secret", async () => {
    const bad = jwt.sign({ id: "1" }, "other-secret");
    const { res } = await run(`Bearer ${bad}`);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("401 for an expired token", async () => {
    const expired = jwt.sign({ id: "1" }, "test-secret", { expiresIn: -10 });
    const { res } = await run(`Bearer ${expired}`);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("calls next() and sets req.currentUser for a valid token", async () => {
    const token = jwt.sign({ id: "user-123" }, "test-secret", { expiresIn: "1h" });
    const { req, res, next } = await run(`Bearer ${token}`);
    expect(next).toHaveBeenCalledOnce();
    expect(req.currentUser).toBe("user-123");
    expect(res.status).not.toHaveBeenCalled();
  });
});
