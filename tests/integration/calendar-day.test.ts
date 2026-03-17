import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../../src/server";

describe("HPC Calendar Day", () => {
  it(
    "should return coherent HPC date output using global structural year logic",
    async () => {
      const res = await request(app).get(
        "/hpc/calendar-day?isoDate=2026-03-21T12:00:00Z&latitude=40.743&longitude=-74.0324"
      );

      expect(res.status).toBe(200);

      const body = res.body;

      expect(body.hpcYear).toBeDefined();
      expect(body.hpcMonth).toBeDefined();
      expect(body.hpcDay).toBeDefined();
      expect(body.weekday).toBeDefined();

      expect(body.classification).toBeDefined();
      expect(body.yearType).toBeDefined();

      expect(body.boundarySunsetUtc).toBeDefined();
    },
    20000
  );
});
