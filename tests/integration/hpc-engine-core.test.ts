/**
 * HPC Engine Core Integration Tests
 *
 * IMPORTANT — TWO CATEGORIES OF TESTS:
 *
 * 1. STRUCTURALLY INVARIANT TESTS (always true regardless of year)
 *    These tests verify properties that are permanent by mathematical proof.
 *    They do not depend on Gregorian dates.
 *    Examples:
 *      - Passover is always Wednesday (W(14) = (14-1) mod 7 = 6)
 *      - Day of Atonement is always Sabbath (W(10) = (10-1) mod 7 = 2)
 *      - New Year is always Thursday (W(1) = (1-1) mod 7 = 0)
 *      - Month 13 always has 29 days (standard) or 30 days (adjustment)
 *
 * 2. GREGORIAN-TO-HPC MAPPING TESTS (year-specific snapshots)
 *    These tests verify that a specific Gregorian date in a specific year
 *    maps to the correct HPC date. They are correct for the stated year
 *    but will NOT hold for other years because the Gregorian calendar
 *    has variable month lengths, irregular leap days, and no annual
 *    grid reset. The Gregorian and HPC grids are completely independent.
 *    Examples:
 *      - April 3, 2026 → Abib 14 (true only for 2026)
 *      - September 14, 2026 → Ethnaim 10 (true only for 2026)
 *
 *    To test a different year, calculate the correct Gregorian date
 *    for that year by querying the engine first.
 *
 * Author: Glenville Gardner
 * Engine: Heliocentric Precision Calendar (HPC)
 * Epoch: March 20, 2019 (Wednesday, supermoon)
 */

import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../../src/server";

const JERUSALEM = "latitude=31.7683&longitude=35.2137";
const TIMEOUT = 20000;

// ─────────────────────────────────────────────────────────────────────────────
// Year Boundary Classification
// ─────────────────────────────────────────────────────────────────────────────

describe("HPC Year Boundary Classification", () => {
  it("2019 should be STANDARD — epoch anchor", async () => {
    const res = await request(app).get(
      `/hpc/year-boundary?year=2019&${JERUSALEM}`
    );
    expect(res.status).toBe(200);
    expect(res.body.yearType).toBe("STANDARD");
    expect(res.body.classification).toBe("STANDARD_YEAR");
  }, TIMEOUT);

  it("2024 should be EQUINOX_ADJUSTMENT", async () => {
    const res = await request(app).get(
      `/hpc/year-boundary?year=2024&${JERUSALEM}`
    );
    expect(res.status).toBe(200);
    expect(res.body.yearType).toBe("EQUINOX_ADJUSTMENT");
    expect(res.body.classification).toBe("ADJUSTMENT_YEAR");
  }, TIMEOUT);

  it("2026 should be STANDARD", async () => {
    const res = await request(app).get(
      `/hpc/year-boundary?year=2026&${JERUSALEM}`
    );
    expect(res.status).toBe(200);
    expect(res.body.yearType).toBe("STANDARD");
  }, TIMEOUT);

  it("2028 should be EQUINOX_ADJUSTMENT", async () => {
    const res = await request(app).get(
      `/hpc/year-boundary?year=2028&${JERUSALEM}`
    );
    expect(res.status).toBe(200);
    expect(res.body.yearType).toBe("EQUINOX_ADJUSTMENT");
  }, TIMEOUT);
});

// ─────────────────────────────────────────────────────────────────────────────
// Calendar Day Resolution
// ─────────────────────────────────────────────────────────────────────────────

describe("HPC Calendar Day Resolution", () => {
  it("Passover 2026 — Abib 14 Wednesday", async () => {
    const res = await request(app).get(
      `/hpc/calendar-day?isoDate=2026-04-03T12:00:00Z&${JERUSALEM}`
    );
    expect(res.status).toBe(200);
    expect(res.body.hpcMonth).toBe(1);
    expect(res.body.hpcDay).toBe(14);
    expect(res.body.weekday).toBe("Wednesday");
    expect(res.body.monthName).toBe("Abib");
  }, TIMEOUT);

  it("Passover 2026 — feastDay object present", async () => {
    const res = await request(app).get(
      `/hpc/calendar-day?isoDate=2026-04-03T12:00:00Z&${JERUSALEM}`
    );
    expect(res.status).toBe(200);
    expect(res.body.feastDay).not.toBeNull();
    expect(res.body.feastDay.name).toBe("Passover");
    expect(res.body.feastDay.weekday).toBe("Wednesday");
    expect(res.body.feastDay.dssAgreement).toBe("full");
  }, TIMEOUT);

  it("Firstfruits 2026 — Abib 18 Sunday", async () => {
    const res = await request(app).get(
      `/hpc/calendar-day?isoDate=2026-04-07T12:00:00Z&${JERUSALEM}`
    );
    expect(res.status).toBe(200);
    expect(res.body.hpcMonth).toBe(1);
    expect(res.body.hpcDay).toBe(18);
    expect(res.body.weekday).toBe("Sunday");
    expect(res.body.feastDay.name).toBe("Day of Firstfruits");
  }, TIMEOUT);

  it("Day of Atonement 2026 — Ethnaim 10 Sabbath", async () => {
    const res = await request(app).get(
      `/hpc/calendar-day?isoDate=2026-09-14T12:00:00Z&${JERUSALEM}`
    );
    expect(res.status).toBe(200);
    expect(res.body.hpcMonth).toBe(7);
    expect(res.body.hpcDay).toBe(10);
    expect(res.body.weekday).toBe("Sabbath");
    expect(res.body.feastDay.name).toBe("Day of Atonement");
  }, TIMEOUT);

  it("Non feast day returns null feastDay", async () => {
    const res = await request(app).get(
      `/hpc/calendar-day?isoDate=2026-04-05T12:00:00Z&${JERUSALEM}`
    );
    expect(res.status).toBe(200);
    expect(res.body.feastDay).toBeNull();
  }, TIMEOUT);

  it("Month 13 — Adar II / Telma", async () => {
    const res = await request(app).get(
      `/hpc/calendar-day?isoDate=2026-03-18T12:00:00Z&${JERUSALEM}`
    );
    expect(res.status).toBe(200);
    expect(res.body.hpcMonth).toBe(13);
    expect(res.body.monthName).toBe("Adar II / Telma");
  }, TIMEOUT);
});

// ─────────────────────────────────────────────────────────────────────────────
// Feast Days
// ─────────────────────────────────────────────────────────────────────────────

describe("HPC Feast Day Service", () => {
  it("Passover always Wednesday — W(14) = (14-1) mod 7 = 6", async () => {
    const res = await request(app).get("/hpc/feast-day?month=1&day=14");
    expect(res.status).toBe(200);
    expect(res.body.feastDay.weekday).toBe("Wednesday");
  }, TIMEOUT);

  it("Day of Atonement always Sabbath — W(10) = (10-1) mod 7 = 2", async () => {
    const res = await request(app).get("/hpc/feast-day?month=7&day=10");
    expect(res.status).toBe(200);
    expect(res.body.feastDay.weekday).toBe("Sabbath");
  }, TIMEOUT);

  it("Firstfruits always Sunday — W(18) = (18-1) mod 7 = 3", async () => {
    const res = await request(app).get("/hpc/feast-day?month=1&day=18");
    expect(res.status).toBe(200);
    expect(res.body.feastDay.weekday).toBe("Sunday");
  }, TIMEOUT);

  it("New Year always Thursday — W(1) = (1-1) mod 7 = 0", async () => {
    const res = await request(app).get("/hpc/feast-day?month=1&day=1");
    expect(res.status).toBe(200);
    expect(res.body.feastDay.weekday).toBe("Thursday");
  }, TIMEOUT);

  it("Full feast calendar returns 10 feast days", async () => {
    const res = await request(app).get("/hpc/feast-days?year=2026");
    expect(res.status).toBe(200);
    expect(res.body.feastDays).toHaveLength(10);
  }, TIMEOUT);
});

// ─────────────────────────────────────────────────────────────────────────────
// Zadok Priestly Courses
// ─────────────────────────────────────────────────────────────────────────────

describe("HPC Zadok Priestly Calendar", () => {
  it("All 24 courses returned", async () => {
    const res = await request(app).get("/hpc/zadok/courses");
    expect(res.status).toBe(200);
    expect(res.body.courses).toHaveLength(24);
    expect(res.body.courses[0].name).toBe("Jehoiarib");
    expect(res.body.courses[23].name).toBe("Maaziah");
  }, TIMEOUT);

  it("Abib 1 is festival week — Passover/Unleavened Bread", async () => {
    const res = await request(app).get(
      "/hpc/zadok?hpcYear=6045&hpcMonth=1&hpcDay=1"
    );
    expect(res.status).toBe(200);
    expect(res.body.isFestivalWeek).toBe(true);
    expect(res.body.activeCourse).toBeNull();
    expect(res.body.festivalName).toBe("Passover / Unleavened Bread");
  }, TIMEOUT);

  it("Sivan 1 — Course of Abijah serving (week 9)", async () => {
    const res = await request(app).get(
      "/hpc/zadok?hpcYear=6045&hpcMonth=3&hpcDay=1"
    );
    expect(res.status).toBe(200);
    expect(res.body.weekOfYear).toBe(9);
    expect(res.body.activeCourse.name).toBe("Abijah");
  }, TIMEOUT);

  it("Nativity calculation — Abijah course confirmed", async () => {
    const res = await request(app).get("/hpc/zadok/nativity?hpcYear=6045");
    expect(res.status).toBe(200);
    expect(res.body.zechariasCourse.name).toBe("Abijah");
    expect(res.body.nativityWeekday).toBe("Thursday");
  }, TIMEOUT);
});

// ─────────────────────────────────────────────────────────────────────────────
// Seasonal Anchors
// ─────────────────────────────────────────────────────────────────────────────

describe("HPC Seasonal Anchors", () => {
  it("Spring equinox lands on Abib 1 Thursday", async () => {
    const res = await request(app).get(
      `/hpc/seasonal-anchors?year=2026&${JERUSALEM}`
    );
    expect(res.status).toBe(200);
    expect(res.body.anchors.springEquinox.hpcMonth).toBe(1);
    expect(res.body.anchors.springEquinox.hpcDay).toBe(1);
    expect(res.body.anchors.springEquinox.weekday).toBe("Thursday");
  }, TIMEOUT);

  it("Autumn equinox lands in Month 7 (Ethnaim)", async () => {
    const res = await request(app).get(
      `/hpc/seasonal-anchors?year=2026&${JERUSALEM}`
    );
    expect(res.status).toBe(200);
    expect(res.body.anchors.autumnEquinox.hpcMonth).toBe(7);
    expect(res.body.anchors.autumnEquinox.monthName).toBe("Ethnaim");
  }, TIMEOUT);

  it("Winter solstice lands in Month 10 (Tebeth)", async () => {
    const res = await request(app).get(
      `/hpc/seasonal-anchors?year=2026&${JERUSALEM}`
    );
    expect(res.status).toBe(200);
    expect(res.body.anchors.winterSolstice.hpcMonth).toBe(10);
    expect(res.body.anchors.winterSolstice.monthName).toBe("Tebeth");
  }, TIMEOUT);
});

// ─────────────────────────────────────────────────────────────────────────────
// Year Structure
// ─────────────────────────────────────────────────────────────────────────────

describe("HPC Year Structure", () => {
  it("Standard year — Month 13 has 29 days", async () => {
    const res = await request(app).get(
      `/hpc/year-structure?year=2026&${JERUSALEM}`
    );
    expect(res.status).toBe(200);
    expect(res.body.yearType).toBe("STANDARD");
    const month13 = res.body.months.find((m: { month: number }) => m.month === 13);
    expect(month13.days).toBe(29);
  }, TIMEOUT);

  it("Adjustment year — Month 13 has 30 days", async () => {
    const res = await request(app).get(
      `/hpc/year-structure?year=2024&${JERUSALEM}`
    );
    expect(res.status).toBe(200);
    expect(res.body.yearType).toBe("EQUINOX_ADJUSTMENT");
    const month13 = res.body.months.find((m: { month: number }) => m.month === 13);
    expect(month13.days).toBe(30);
  }, TIMEOUT);

  it("All months 1-12 have exactly 28 days", async () => {
    const res = await request(app).get(
      `/hpc/year-structure?year=2026&${JERUSALEM}`
    );
    expect(res.status).toBe(200);
    const months1to12 = res.body.months.filter((m: { month: number }) => m.month <= 12);
    expect(months1to12).toHaveLength(12);
    months1to12.forEach((m: { days: number }) => {
      expect(m.days).toBe(28);
    });
  }, TIMEOUT);

  it("Year always starts on Thursday", async () => {
    const res = await request(app).get(
      `/hpc/year-structure?year=2026&${JERUSALEM}`
    );
    expect(res.status).toBe(200);
    expect(res.body.weekdayStart).toBe("Thursday");
  }, TIMEOUT);
});