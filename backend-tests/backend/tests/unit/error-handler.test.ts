import { describe, it, expect } from "vitest";
import { errorResponseHandler, errorParser } from "src/lib/errors/error-response-handler";

describe("errorResponseHandler / errorParser", () => {
  it("throws a JSON string error carrying message and code", () => {
    try {
      errorResponseHandler("Boom", 404, {} as any);
      throw new Error("should not reach");
    } catch (e: any) {
      expect(JSON.parse(e.message)).toEqual({ success: false, message: "Boom", code: 404 });
    }
  });

  it("defaults code to 500", () => {
    try {
      errorResponseHandler("Oops", undefined, {} as any);
    } catch (e: any) {
      expect(JSON.parse(e.message).code).toBe(500);
    }
  });

  it("errorParser round-trips the thrown error", () => {
    try {
      errorResponseHandler("Not found", 404, {} as any);
    } catch (e) {
      expect(errorParser(e)).toMatchObject({ message: "Not found", code: 404 });
    }
  });

  it("errorParser falls back to 500 for non-JSON errors", () => {
    expect(errorParser(new Error("plain error"))).toEqual({
      code: 500,
      message: "An unexpected error occurred in parser",
    });
  });
});
