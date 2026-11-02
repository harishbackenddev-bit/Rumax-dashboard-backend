import { describe, it, expect, vi } from "vitest";
import { queryBuilder, checkValidAdminRole } from "src/utils";
import { mockRes } from "../helpers/mockRes";

describe("queryBuilder", () => {
  it("returns empty query and sort when nothing is given", () => {
    expect(queryBuilder({})).toEqual({ query: {}, sort: {} });
  });

  it("builds a case-insensitive $or regex for description over the given keys", () => {
    const { query } = queryBuilder({ description: "john" }, ["name", "email"]);
    expect(query).toEqual({
      $or: [
        { name: { $regex: "john", $options: "i" } },
        { email: { $regex: "john", $options: "i" } },
      ],
    });
  });

  it("defaults the searched key to 'name'", () => {
    const { query } = queryBuilder({ description: "x" });
    expect(query).toEqual({ $or: [{ name: { $regex: "x", $options: "i" } }] });
  });

  it("builds ascending / descending sort", () => {
    expect(queryBuilder({ order: "asc", orderColumn: "createdAt" }).sort).toEqual({ createdAt: 1 });
    expect(queryBuilder({ order: "desc", orderColumn: "createdAt" }).sort).toEqual({ createdAt: -1 });
  });

  it("ignores sort if only one of order/orderColumn is provided", () => {
    expect(queryBuilder({ order: "asc" }).sort).toEqual({});
    expect(queryBuilder({ orderColumn: "name" }).sort).toEqual({});
  });
});

describe("checkValidAdminRole", () => {
  it("403 when role header is not admin", () => {
    const res = mockRes();
    const next = vi.fn();
    checkValidAdminRole({ headers: { role: "user" } } as any, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next when role header is admin", () => {
    const res = mockRes();
    const next = vi.fn();
    checkValidAdminRole({ headers: { role: "admin" } } as any, res, next);
    expect(next).toHaveBeenCalled();
  });
});
