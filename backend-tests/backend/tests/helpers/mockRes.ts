import { vi } from "vitest";

/** Minimal Express-like Response mock */
export const mockRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
};

/** Run an async fn that is expected to throw errorResponseHandler and return the parsed payload */
export const catchApiError = async (fn: () => Promise<any>) => {
  try {
    await fn();
  } catch (e: any) {
    return JSON.parse(e.message) as { success: false; message: string; code: number };
  }
  throw new Error("Expected function to throw an API error but it did not");
};
