import { getSolarLongitude } from "./astronomy-authority-client";
import { getSeasonContext } from "./season-context-service";
import { GeoLocation } from "../core/types";

export interface SolarProgressContext {
  seasonMode: "astronomical" | "observable";

  displaySeason: "spring" | "summer" | "autumn" | "winter";
  displayPreviousSeasonEvent: "spring_equinox" | "summer_solstice" | "autumn_equinox" | "winter_solstice";
  displayNextSeasonEvent: "spring_equinox" | "summer_solstice" | "autumn_equinox" | "winter_solstice";

  solarLongitude: number;
  seasonProgressPercent: number;
  daysIntoDisplaySeason: number;
  daysRemainingInDisplaySeason: number;
  agriculturalPhase:
    | "early-growth"
    | "mid-growth"
    | "late-growth"
    | "harvest-prep"
    | "dormant";
}

const SEASON_START_LONGITUDE: Record<"spring" | "summer" | "autumn" | "winter", number> = {
  spring: 0,
  summer: 90,
  autumn: 180,
  winter: 270,
};

const SEASON_END_LONGITUDE: Record<"spring" | "summer" | "autumn" | "winter", number> = {
  spring: 90,
  summer: 180,
  autumn: 270,
  winter: 360,
};

function normalizeLongitude(value: number): number {
  let result = value % 360;
  if (result < 0) result += 360;
  return result;
}

function getSeasonProgressPercent(
  displaySeason: "spring" | "summer" | "autumn" | "winter",
  solarLongitude: number
): number {
  const normalized = normalizeLongitude(solarLongitude);

  if (displaySeason === "winter") {
    const adjusted = normalized < 270 ? normalized + 360 : normalized;
    return Math.max(0, Math.min(100, ((adjusted - 270) / 90) * 100));
  }

  const start = SEASON_START_LONGITUDE[displaySeason];
  const end = SEASON_END_LONGITUDE[displaySeason];
  return Math.max(0, Math.min(100, ((normalized - start) / (end - start)) * 100));
}

function getAgriculturalPhase(
  displaySeason: "spring" | "summer" | "autumn" | "winter",
  seasonProgressPercent: number
): SolarProgressContext["agriculturalPhase"] {
  if (displaySeason === "winter") {
    return "dormant";
  }

  if (displaySeason === "spring") {
    if (seasonProgressPercent < 35) return "early-growth";
    if (seasonProgressPercent < 75) return "mid-growth";
    return "late-growth";
  }

  if (displaySeason === "summer") {
    if (seasonProgressPercent < 35) return "mid-growth";
    if (seasonProgressPercent < 75) return "late-growth";
    return "harvest-prep";
  }

  if (displaySeason === "autumn") {
    if (seasonProgressPercent < 50) return "harvest-prep";
    return "dormant";
  }

  return "dormant";
}

export async function getSolarProgressContext(
  target: Date,
  location: GeoLocation
): Promise<SolarProgressContext> {
  const solarData = await getSolarLongitude(target);
  const solarLongitude = solarData.solarLongitude;

  const seasonContext = await getSeasonContext(target, location);
  const displaySeason = seasonContext.displaySeason;
  const displayPreviousSeasonEvent = seasonContext.displayPreviousSeasonEvent;
  const displayNextSeasonEvent = seasonContext.displayNextSeasonEvent;

  const seasonProgressPercent = getSeasonProgressPercent(displaySeason, solarLongitude);

  return {
    seasonMode: seasonContext.seasonMode,
    displaySeason,
    displayPreviousSeasonEvent,
    displayNextSeasonEvent,
    solarLongitude,
    seasonProgressPercent,
    daysIntoDisplaySeason: seasonContext.daysSinceObservablePreviousSeasonEvent,
    daysRemainingInDisplaySeason: seasonContext.daysUntilObservableNextSeasonEvent,
    agriculturalPhase: getAgriculturalPhase(displaySeason, seasonProgressPercent),
  };
}
