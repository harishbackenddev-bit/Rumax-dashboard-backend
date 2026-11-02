import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { mockRes, catchApiError } from "../helpers/mockRes";

// ---- mocks (hoisted) ----
const { usersModel, adminModel, sendPasswordResetEmail } = vi.hoisted(() => {
  const usersModel: any = vi.fn();
  usersModel.findOne = vi.fn();
  usersModel.findById = vi.fn();
  usersModel.findByIdAndUpdate = vi.fn();
  const adminModel: any = { findOne: vi.fn(), findById: vi.fn() };
  return { usersModel, adminModel, sendPasswordResetEmail: vi.fn() };
});

vi.mock("src/models/user/user-schema", () => ({ usersModel }));
vi.mock("src/models/admin/admin-schema", () => ({ adminModel }));
vi.mock("src/utils/mails/mail", () => ({ sendPasswordResetEmail }));
vi.mock("src/utils/mails/token", () => ({
  generatePasswordResetToken: vi.fn(),
  generatePasswordResetTokenByPhone: vi.fn(),
  getPasswordResetTokenByToken: vi.fn(),
}));
vi.mock("src/utils/sms/sms", () => ({ generatePasswordResetTokenByPhoneWithTwilio: vi.fn() }));

import {
  signupService, loginService, userdataServive, forgotPasswordService,
  verifyPasswordResetService, updateAPasswordService, updateAUserService,
} from "src/services/user/user";

const res = mockRes();
// `.select("+password")` chain helper
const withSelect = (value: any) => ({ select: vi.fn().mockResolvedValue(value) });

beforeEach(() => vi.clearAllMocks());

describe("signupService", () => {
  it("rejects when email already exists", async () => {
    usersModel.findOne.mockResolvedValue({ _id: "1" });
    const err = await catchApiError(() => signupService({ email: "A@b.com" }, res));
    expect(err).toMatchObject({ message: "Email already exists", code: 400 });
    expect(usersModel.findOne).toHaveBeenCalledWith({ email: "a@b.com" });
  });

  it("normalises email, hashes password (= email), saves and returns a 7d JWT", async () => {
    usersModel.findOne.mockResolvedValue(null);
    let saved: any;
    usersModel.mockImplementation(function (this: any, payload: any) {
      saved = payload;
      this.save = vi.fn().mockResolvedValue({ _id: "u1", email: payload.email, phoneNumber: "123", ...payload });
    });

    const out: any = await signupService({ email: "  New@User.com ", name: "N", password: "ignored" }, res);

    expect(out.success).toBe(true);
    expect(saved.email).toBe("new@user.com");
    // documents current behaviour: password becomes the (hashed) email, submitted password ignored
    expect(bcrypt.compareSync("new@user.com", saved.password)).toBe(true);
    expect(saved.identifier).toMatch(/^\d{3}$/);
    const decoded: any = jwt.verify(out.token, "test-secret");
    expect(decoded).toMatchObject({ id: "u1", email: "new@user.com" });
    expect(decoded.exp - decoded.iat).toBe(7 * 24 * 3600);
  });
});

describe("loginService", () => {
  const hash = bcrypt.hashSync("secret123", 4);

  it("404 when no user and no admin found", async () => {
    usersModel.findOne.mockReturnValue(withSelect(null));
    adminModel.findOne.mockReturnValue(withSelect(null));
    const err = await catchApiError(() => loginService({ email: "x@y.com", password: "p" }, res));
    expect(err).toMatchObject({ message: "User not found", code: 404 });
  });

  it("401 on wrong password", async () => {
    usersModel.findOne.mockReturnValue(withSelect({ _id: "1", email: "x@y.com", password: hash, toObject: () => ({}) }));
    const err = await catchApiError(() => loginService({ email: "x@y.com", password: "wrong" }, res));
    expect(err).toMatchObject({ message: "Invalid password", code: 401 });
  });

  it("logs in a normal user, strips password, role=user", async () => {
    usersModel.findOne.mockReturnValue(withSelect({
      _id: "1", email: "x@y.com", password: hash,
      toObject: () => ({ _id: "1", email: "x@y.com", name: "X", password: hash }),
    }));
    const out: any = await loginService({ email: " X@Y.com ", password: "secret123" }, res);
    expect(out.success).toBe(true);
    expect(out.data.password).toBeUndefined();
    expect(out.data.role).toBe("user");
    expect((jwt.verify(out.token, "test-secret") as any).role).toBe("user");
  });

  it("falls back to the admin collection with role=admin", async () => {
    usersModel.findOne.mockReturnValue(withSelect(null));
    adminModel.findOne.mockReturnValue(withSelect({
      _id: "a1", email: "admin@y.com", password: hash,
      toObject: () => ({ _id: "a1", email: "admin@y.com", password: hash }),
    }));
    const out: any = await loginService({ email: "admin@y.com", password: "secret123" }, res);
    expect(out.data.role).toBe("admin");
    expect((jwt.verify(out.token, "test-secret") as any).role).toBe("admin");
  });
});

describe("userdataServive (GET /me)", () => {
  it("returns user when found in users", async () => {
    usersModel.findById.mockResolvedValue({ _id: "1" });
    const out: any = await userdataServive({ userId: "1" }, res);
    expect(out).toMatchObject({ success: true, data: { _id: "1" } });
    expect(adminModel.findById).not.toHaveBeenCalled();
  });

  it("falls back to admin collection", async () => {
    usersModel.findById.mockResolvedValue(null);
    adminModel.findById.mockResolvedValue({ _id: "a" });
    const out: any = await userdataServive({ userId: "a" }, res);
    expect(out.data).toEqual({ _id: "a" });
  });

  it("404 when found nowhere", async () => {
    usersModel.findById.mockResolvedValue(null);
    adminModel.findById.mockResolvedValue(null);
    expect(await catchApiError(() => userdataServive({ userId: "z" }, res))).toMatchObject({ code: 404 });
  });
});

describe("forgotPasswordService", () => {
  it("404 when user does not exist", async () => {
    usersModel.findOne.mockResolvedValue(null);
    expect(await catchApiError(() => forgotPasswordService({ email: "no@one.com" }, res))).toMatchObject({ code: 404 });
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("emails a reset link containing a 1h JWT", async () => {
    usersModel.findOne.mockResolvedValue({ _id: "u1" });
    const out: any = await forgotPasswordService({ email: "Me@x.com" }, res);
    expect(out.success).toBe(true);
    const [to, link] = sendPasswordResetEmail.mock.calls[0];
    expect(to).toBe("Me@x.com");
    expect(link.startsWith("http://localhost:5173/reset-password?token=")).toBe(true);
    const token = link.split("token=")[1];
    const decoded: any = jwt.verify(token, "test-secret");
    expect(decoded.id).toBe("u1");
    expect(decoded.exp - decoded.iat).toBe(3600);
  });
});

describe("verifyPasswordResetService", () => {
  const goodToken = () => jwt.sign({ id: "u1" }, "test-secret", { expiresIn: "1h" });
  const call = (p: any) => catchApiError(() => verifyPasswordResetService(p, res));

  // KNOWN BUG: the outer try/catch re-wraps the inner error, so the client gets
  // status 500 and message = a JSON *string* instead of the clean 400 message.
  // These use `it.fails`: they pass while the bug exists and will FAIL once it is
  // fixed -> then just change `it.fails` to `it`.
  it.fails("missing token -> 400 'Token and new password are required'", async () => {
    const e = await call({ newPassword: "12345678" });
    expect(e).toMatchObject({ code: 400, message: "Token and new password are required" });
  });

  it.fails("mismatching passwords -> 400 clean message", async () => {
    const e = await call({ token: goodToken(), newPassword: "12345678", confirmPassword: "different" });
    expect(e).toMatchObject({ code: 400, message: "Passwords do not match" });
  });

  it.fails("password < 8 chars -> 400 clean message", async () => {
    const e = await call({ token: goodToken(), newPassword: "short", confirmPassword: "short" });
    expect(e).toMatchObject({ code: 400, message: "Password must be at least 8 characters" });
  });

  it.fails("invalid token -> 400 clean message", async () => {
    const e = await call({ token: "garbage", newPassword: "12345678", confirmPassword: "12345678" });
    expect(e).toMatchObject({ code: 400, message: "Invalid reset link. Please request a new one." });
  });

  it.fails("expired token -> 400 clean message", async () => {
    const expired = jwt.sign({ id: "u1" }, "test-secret", { expiresIn: -5 });
    const e = await call({ token: expired, newPassword: "12345678", confirmPassword: "12345678" });
    expect(e).toMatchObject({ code: 400, message: "Reset link has expired. Please request a new one." });
  });

  it("current behaviour: validation errors still reject (as wrapped 500)", async () => {
    const e = await call({ token: goodToken(), newPassword: "12345678", confirmPassword: "different" });
    expect(e.code).toBe(500);
    expect(e.message).toContain("Passwords do not match");
  });

  it("updates the password hash on success", async () => {
    const user: any = { password: "old", save: vi.fn().mockResolvedValue(true) };
    usersModel.findById.mockResolvedValue(user);
    const out: any = await verifyPasswordResetService(
      { token: goodToken(), newPassword: "newpass123", confirmPassword: "newpass123" }, res);
    expect(out.success).toBe(true);
    expect(user.save).toHaveBeenCalled();
    expect(bcrypt.compareSync("newpass123", user.password)).toBe(true);
  });
});

describe("updateAPasswordService", () => {
  it("404 if user missing", async () => {
    usersModel.findById.mockReturnValue(withSelect(null));
    expect(await catchApiError(() => updateAPasswordService(
      { userId: "1", body: { currentPassword: "a", newPassword: "b" } }, res))).toMatchObject({ code: 404 });
  });

  it("400 if current password is wrong", async () => {
    usersModel.findById.mockReturnValue(withSelect({ password: bcrypt.hashSync("right", 4) }));
    const e = await catchApiError(() => updateAPasswordService(
      { userId: "1", body: { currentPassword: "wrong", newPassword: "newpassword" } }, res));
    expect(e).toMatchObject({ message: "Current password is incorrect", code: 400 });
  });

  it("stores a new bcrypt hash on success", async () => {
    usersModel.findById.mockReturnValue(withSelect({ password: bcrypt.hashSync("right", 4) }));
    usersModel.findByIdAndUpdate.mockResolvedValue({});
    const out: any = await updateAPasswordService(
      { userId: "1", body: { currentPassword: "right", newPassword: "brandnew1" } }, res);
    expect(out.success).toBe(true);
    const [id, update] = usersModel.findByIdAndUpdate.mock.calls[0];
    expect(id).toBe("1");
    expect(bcrypt.compareSync("brandnew1", update.password)).toBe(true);
  });
});

describe("updateAUserService", () => {
  it("404 when user not found", async () => {
    usersModel.findById.mockResolvedValue(null);
    expect(await catchApiError(() => updateAUserService({ userId: "x", body: {} }, res))).toMatchObject({ code: 404 });
  });

  it("updates with the body and returns the new doc", async () => {
    usersModel.findById.mockResolvedValue({ _id: "1" });
    usersModel.findByIdAndUpdate.mockResolvedValue({ _id: "1", theme: "dark" });
    const out: any = await updateAUserService({ userId: "1", body: { theme: "dark" } }, res);
    expect(usersModel.findByIdAndUpdate).toHaveBeenCalledWith("1", { theme: "dark" }, { new: true });
    expect(out.data.theme).toBe("dark");
  });
});
