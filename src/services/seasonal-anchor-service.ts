/**
 * seasonal-anchor-service.ts
 *
 * Resolves all four solar seasonal anchors for a given HPC year and
 * maps each to its precise HPC calendar position.
 *
 * The four anchors are:
 *   Spring Equinox  — Year boundary anchor (always Wednesday in HPC)
 *   Summer Solstice — Always in Month 4 or 5
 *   Autumn Equinox  — Always in Month 7 (Ethnaim)
 *   Winter Solstice — Always in Month 10 (Tebeth)
 *
 * Because the HPC grid resets annually and every month starts Thursday,
 * these anchors fall on predictable HPC dates and weekdays every year.
 */

import { getSeasonEvents } from "./astronomy-authority-client";
import { resolveGlobalHpcYearBoundaryUtc } from "../astronomy/global-season-boundary";
import { resolveHpcYearBoundaryUtc } from "../astronomy/year-boundary";
import { getMonthFullName } from "../calendar/month-names";
import { GeoLocation } from "../core/types";
import { MemoryCache } from "../cache/memory-cache";

export interface SeasonalAnchor {
  eventType: "spring_equinox" | "summer_solstice" | "autumn_equinox" | "winter_solstice";
  utc: string;
  hpcYear: number;
  hpcMonth: number;
  hpcDay: number;
  monthName: string;
  weekday: string;
  dayOfYear: number;
}

export interface SeasonalAnchorResponse {
  gregorianYear: number;
  hpcYear: number;
  yearType: string;
  kernel: string;
  anchors: {
    springEquinox: SeasonalAnchor;
    summerSolstice: SeasonalAnchor;
    autumnEquinox: SeasonalAnchor;
    winterSolstice: SeasonalAnchor;
  };
}

const anchorCache = new MemoryCache<SeasonalAnchorResponse>(60 * 60 * 1000);

const WEEKDAY_NAMES = [
  "Thursday", "Friday", "Sabbath",
  "Sunday", "Monday", "Tuesday", "Wednesday"
];

function getWeekdayFromDay(day: number): string {
  return WEEKDAY_NAMES[(day - 1) % 7];
}

function getMonthAndDay(dayOfYear: number): { month: number; day: number } {
  const month = Math.floor((dayOfYear - 1) / 28) + 1;
  const day = ((dayOfYear - 1) % 28) + 1;
  return { month: Math.min(month, 13), day };
}

function getDayOfYear(
  eventUtc: string,
  boundaryUtc: string
): number {
  const eventMs = new Date(eventUtc).getTime();
  const boundaryMs = new Date(boundaryUtc).getTime();
  const elapsedDays = Math.floor((eventMs - boundaryMs) / 86400000);
  return Math.max(1, elapsedDays + 1);
}

export async function getSeasonalAnchors(
  gregorianYear: number,
  location: GeoLocation
): Promise<SeasonalAnchorResponse> {
  const cacheKey = `${gregorianYear}:${location.latitude.toFixed(4)}:${location.longitude.toFixed(4)}`;
  const cached = anchorCache.get(cacheKey);
  if (cached) return cached;

  const [seasonEvents, globalBoundary, localBoundary] = await Promise.all([
    getSeasonEvents(gregorianYear),
    resolveGlobalHpcYearBoundaryUtc(gregorianYear),
    resolveHpcYearBoundaryUtc(gregorianYear, location)
  ]);

  // HPC year number
  const hpcYear = 6037 + (gregorianYear - 2019) + 1;

  const boundaryUtc = localBoundary.boundarySunsetUtc.toISOString();

  function buildAnchor(
    eventType: SeasonalAnchor["eventType"],
    utc: string
  ): SeasonalAnchor {
    const dayOfYear = getDayOfYear(utc, boundaryUtc);
    const { month, day } = getMonthAndDay(dayOfYear);
    return {
      eventType,
      utc,
      hpcYear,
      hpcMonth: month,
      hpcDay: day,
      monthName: getMonthFullName(month),
      weekday: getWeekdayFromDay(day),
      dayOfYear
    };
  }

  const response: SeasonalAnchorResponse = {
    gregorianYear,
    hpcYear,
    yearType: globalBoundary.yearType,
    kernel: seasonEvents.kernel ?? "de440.bsp",
    anchors: {
      springEquinox: buildAnchor(
        "spring_equinox",
        seasonEvents.events.spring_equinox.utc
      ),
      summerSolstice: buildAnchor(
        "summer_solstice",
        seasonEvents.events.summer_solstice.utc
      ),
      autumnEquinox: buildAnchor(
        "autumn_equinox",
        seasonEvents.events.autumn_equinox.utc
      ),
      winterSolstice: buildAnchor(
        "winter_solstice",
        seasonEvents.events.winter_solstice.utc
      )
    }
  };

  anchorCache.set(cacheKey, response);
  return response;
}