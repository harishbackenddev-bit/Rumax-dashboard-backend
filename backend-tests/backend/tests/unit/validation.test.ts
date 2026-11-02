import { describe, it, expect } from "vitest";
import { clientSignupSchema, passswordResetSchema } from "src/validation/client-user";
import { adminUserLoginSchema } from "src/validation/admin-user";
import { formatZodErrors } from "src/validation/format-zod-errors";

describe("clientSignupSchema", () => {
  const valid = { email: "a@b.com", password: "12345678", name: "Ann" };

  it("accepts a valid payload and defaults accountType", () => {
    const r = clientSignupSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.accountType).toBe("individual");
  });

  it("rejects invalid email", () => {
    expect(clientSignupSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
  });

  it("rejects password shorter than 8 chars", () => {
    const r = clientSignupSchema.safeParse({ ...valid, password: "1234567" });
    expect(r.success).toBe(false);
    if (!r.success) expect(formatZodErrors(r.error)[0]).toEqual({
      name: "password",
      message: "Password must be at least 8 characters",
    });
  });

  it("rejects unknown keys (strict)", () => {
    expect(clientSignupSchema.safeParse({ ...valid, extra: 1 }).success).toBe(false);
  });
});

describe("passswordResetSchema", () => {
  it("rejects when new password equals current password", () => {
    const r = passswordResetSchema.safeParse({ currentPassword: "abc", newPassword: "abc" });
    expect(r.success).toBe(false);
  });
  it("accepts different passwords", () => {
    expect(passswordResetSchema.safeParse({ currentPassword: "abc", newPassword: "xyz" }).success).toBe(true);
  });
});

describe("adminUserLoginSchema", () => {
  it("requires valid email + password", () => {
    expect(adminUserLoginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
    expect(adminUserLoginSchema.safeParse({ email: "bad", password: "x" }).success).toBe(false);
  });
});
