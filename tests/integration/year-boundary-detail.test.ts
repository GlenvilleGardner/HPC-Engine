import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../../src/server";

describe("HPC Year Boundary Detail", () => {
  it(
    "should expose global structural fields and local timing-only fields",
    async () => {
      const res = await request(app).get(
        "/hpc/year-boundary-detail?year=2026&latitude=40.743&longitude=-74.0324"
      );

      expect(res.status).toBe(200);

      const body = res.body;

      expect(body.globalBoundary.classification).toBeDefined();
      expect(body.globalBoundary.yearType).toBeDefined();

      expect(body.localObservation.boundarySunsetUtc).toBeDefined();
      expect(body.localObservation.observableWindowStartUtc).toBeDefined();
      expect(body.localObservation.observableWindowEndUtc).toBeDefined();

      expect(body.localObservation.classification).toBeUndefined();
      expect(body.localObservation.yearType).toBeUndefined();
    },
    20000
  );
});
