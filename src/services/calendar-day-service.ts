import { gregorianToHpc } from "../calendar/convert";
import { resolveHpcYearBoundaryUtc } from "../astronomy/year-boundary";
import { resolveGlobalHpcYearBoundaryUtc } from "../astronomy/global-season-boundary";
import { getSeasonContext } from "./season-context-service";
import { getSolarProgressContext } from "./solar-progress-service";

export interface CalendarDayRequest {
  isoDate: string;
  latitude: number;
  longitude: number;
}

export interface CalendarDayResponse {
  inputIsoDate: string;
  hpcYear: number | null;
  hpcMonth: number | null;
  hpcDay: number | null;
  weekday: string | null;
  gregorianReferenceLabel: string | null;
  boundaryYear: number;
  boundarySunsetUtc: string;
  classification: string;
  yearType: string;

  seasonMode: "astronomical" | "observable";

  season: "spring" | "summer" | "autumn" | "winter";
  nearestSeasonEvent: "spring_equinox" | "summer_solstice" | "autumn_equinox" | "winter_solstice";
  previousSeasonEvent: "spring_equinox" | "summer_solstice" | "autumn_equinox" | "winter_solstice";
  nextSeasonEvent: "spring_equinox" | "summer_solstice" | "autumn_equinox" | "winter_solstice";
  daysSincePreviousSeasonEvent: number;
  daysUntilNextSeasonEvent: number;

  observableSeason: "spring" | "summer" | "autumn" | "winter";
  observablePreviousSeasonEvent: "spring_equinox" | "summer_solstice" | "autumn_equinox" | "winter_solstice";
  observableNextSeasonEvent: "spring_equinox" | "summer_solstice" | "autumn_equinox" | "winter_solstice";
  daysSinceObservablePreviousSeasonEvent: number;
  daysUntilObservableNextSeasonEvent: number;

  displaySeason: "spring" | "summer" | "autumn" | "winter";
  displayPreviousSeasonEvent: "spring_equinox" | "summer_solstice" | "autumn_equinox" | "winter_solstice";
  displayNextSeasonEvent: "spring_equinox" | "summer_solstice" | "autumn_equinox" | "winter_solstice";

  solarLongitude: number;
  seasonProgressPercent: number;
  daysIntoDisplaySeason: number;
  daysRemainingInDisplaySeason: number;
  agriculturalPhase: "early-growth" | "mid-growth" | "late-growth" | "harvest-prep" | "dormant";
}

export async function getCalendarDay(
  request: CalendarDayRequest
): Promise<CalendarDayResponse> {
  const target = new Date(request.isoDate);

  const location = {
    latitude: request.latitude,
    longitude: request.longitude
  };

  const hpc = await gregorianToHpc(target, location);
  const boundaryYear = target.getUTCFullYear();

  const globalBoundary = await resolveGlobalHpcYearBoundaryUtc(boundaryYear);
  const localBoundary = await resolveHpcYearBoundaryUtc(boundaryYear, location);

  const seasonContext = await getSeasonContext(target, location);
  const solarProgress = await getSolarProgressContext(target, location);

  return {
    inputIsoDate: request.isoDate,
    hpcYear: hpc.hpcYear ?? null,
    hpcMonth: hpc.hpcMonth ?? null,
    hpcDay: hpc.hpcDay ?? null,
    weekday: hpc.weekday ?? null,
    gregorianReferenceLabel: hpc.gregorianReferenceLabel ?? null,
    boundaryYear,
    boundarySunsetUtc: localBoundary.boundarySunsetUtc.toISOString(),
    classification: globalBoundary.classification,
    yearType: globalBoundary.yearType,

    seasonMode: seasonContext.seasonMode,

    season: seasonContext.season,
    nearestSeasonEvent: seasonContext.nearestSeasonEvent,
    previousSeasonEvent: seasonContext.previousSeasonEvent,
    nextSeasonEvent: seasonContext.nextSeasonEvent,
    daysSincePreviousSeasonEvent: seasonContext.daysSincePreviousSeasonEvent,
    daysUntilNextSeasonEvent: seasonContext.daysUntilNextSeasonEvent,

    observableSeason: seasonContext.observableSeason,
    observablePreviousSeasonEvent: seasonContext.observablePreviousSeasonEvent,
    observableNextSeasonEvent: seasonContext.observableNextSeasonEvent,
    daysSinceObservablePreviousSeasonEvent: seasonContext.daysSinceObservablePreviousSeasonEvent,
    daysUntilObservableNextSeasonEvent: seasonContext.daysUntilObservableNextSeasonEvent,

    displaySeason: seasonContext.observableSeason,
    displayPreviousSeasonEvent: seasonContext.observablePreviousSeasonEvent,
    displayNextSeasonEvent: seasonContext.observableNextSeasonEvent,

    solarLongitude: solarProgress.solarLongitude,
    seasonProgressPercent: solarProgress.seasonProgressPercent,
    daysIntoDisplaySeason: solarProgress.daysIntoDisplaySeason,
    daysRemainingInDisplaySeason: solarProgress.daysRemainingInDisplaySeason,
    agriculturalPhase: solarProgress.agriculturalPhase
  };
}
