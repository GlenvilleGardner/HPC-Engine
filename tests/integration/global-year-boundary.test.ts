import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../../src/server";

describe("HPC Global Year Boundary", () => {
  it(
    "should return one canonical global structural boundary for the year",
    async () => {
      const res = await request(app).get(
        "/hpc/global-year-boundary?year=2026"
      );

      expect(res.status).toBe(200);

      const body = res.body;

      expect(body.equinoxUtc).toBeDefined();
      expect(body.eventLatitude).toBeDefined();
      expect(body.eventLongitude).toBeDefined();
      expect(body.observableWindowStartUtc).toBeDefined();
      expect(body.observableWindowEndUtc).toBeDefined();
      expect(body.classification).toBeDefined();
      expect(body.yearType).toBeDefined();
      expect(body.boundarySunsetUtc).toBeDefined();
      expect(typeof body.usedNextDaySunset).toBe("boolean");
    },
    20000
  );
});
