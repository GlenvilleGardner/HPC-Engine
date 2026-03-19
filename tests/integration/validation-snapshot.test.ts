import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../../src/server";

describe("HPC Validation Snapshot", () => {
  it(
    "should separate global structure from local observation",
    async () => {
      const res = await request(app).get(
        "/hpc/validation-snapshot?isoDate=2026-03-21T12:00:00Z&latitude=40.743&longitude=-74.0324"
      );

      expect(res.status).toBe(200);

      const body = res.body;

      expect(body.globalBoundary.yearType).toBeDefined();
      expect(body.globalBoundary.classification).toBeDefined();

      expect(body.localObservation.yearType).toBeUndefined();
      expect(body.localObservation.classification).toBeUndefined();

      expect(body.calendarDay.yearType).toBeDefined();
    },
    40000
  );
});
