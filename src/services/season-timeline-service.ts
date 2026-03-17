import { GeoLocation } from "../core/types";
import { getSeasonContext } from "./season-context-service";
import { getSeasonEvents } from "./season-events-service";
import { getSunset } from "./astronomy-authority-client";
import { getLocalSunsetUtc as getApproxLocalSunsetUtc } from "../sunset/sunset";

export interface SeasonTimelineContext {
  seasonMode: "astronomical" | "observable";

  displaySeason: "spring" | "summer" | "autumn" | "winter";
  displayPreviousSeasonEvent: "spring_equinox" | "summer_solstice" | "autumn_equinox" | "winter_solstice";
  displayNextSeasonEvent: "spring_equinox" | "summer_solstice" | "autumn_equinox" | "winter_solstice";

  previousSeasonEventUtc: string;
  nextSeasonEventUtc: string;

  observablePreviousTransitionUtc: string;
  observableNextTransitionUtc: string;

  astronomicalEventPassed: boolean;
  hoursSinceAstronomicalEvent: number | null;
  daysUntilAstronomicalEvent: number | null;
  hoursUntilAstronomicalEvent: number | null;

  observableTransitionPending: boolean;
  daysUntilObservableNextTransition: number;
  hoursUntilObservableNextTransition: number;
}

type SeasonEventKey =
  | "spring_equinox"
  | "summer_solstice"
  | "autumn_equinox"
  | "winter_solstice";

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;

interface SeasonEventLookup {
  key: SeasonEventKey;
  utc: Date;
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0, 0, 0, 0
  ));
}

function addUtcDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function sortDatesAscending(dates: Date[]): Date[] {
  return [...dates].sort((a, b) => a.getTime() - b.getTime());
}

async function resolveSunsetUtc(date: Date, location: GeoLocation): Promise<Date> {
  try {
    const data = await getSunset(date, location.latitude, location.longitude);
    return new Date(data.sunsetUTC);
  } catch {
    return getApproxLocalSunsetUtc(date, location);
  }
}

async function resolveObservableTransitionUtc(eventUtc: Date, location: GeoLocation): Promise<Date> {
  const eventDayUtc = startOfUtcDay(eventUtc);

  const sampleDays = [
    addUtcDays(eventDayUtc, -1),
    eventDayUtc,
    addUtcDays(eventDayUtc, 1),
  ];

  const sampledSunsets = await Promise.all(
    sampleDays.map((day) => resolveSunsetUtc(day, location))
  );

  const sunsets = sortDatesAscending(sampledSunsets);

  for (let i = 0; i < sunsets.length - 1; i++) {
    const windowStart = sunsets[i];
    const windowEnd = sunsets[i + 1];

    if (
      eventUtc.getTime() >= windowStart.getTime() &&
      eventUtc.getTime() < windowEnd.getTime()
    ) {
      return windowEnd;
    }
  }

  throw new Error("Unable to resolve observable season transition.");
}

function diffDaysCeil(later: Date, earlier: Date): number {
  return Math.ceil((later.getTime() - earlier.getTime()) / MS_PER_DAY);
}

function diffHoursCeil(later: Date, earlier: Date): number {
  return Math.ceil((later.getTime() - earlier.getTime()) / MS_PER_HOUR);
}

function diffHoursFloor(later: Date, earlier: Date): number {
  return Math.floor((later.getTime() - earlier.getTime()) / MS_PER_HOUR);
}

function getEventUtc(
  yearEvents: Awaited<ReturnType<typeof getSeasonEvents>>,
  key: SeasonEventKey
): Date {
  return new Date(yearEvents.events[key].utc);
}

export async function getSeasonTimelineContext(
  target: Date,
  location: GeoLocation
): Promise<SeasonTimelineContext> {
  const seasonContext = await getSeasonContext(target, location);
  const year = target.getUTCFullYear();

  const previousYearEvents = await getSeasonEvents(year - 1);
  const currentYearEvents = await getSeasonEvents(year);
  const nextYearEvents = await getSeasonEvents(year + 1);

  const astronomicalEvents: SeasonEventLookup[] = [
    { key: "spring_equinox", utc: getEventUtc(previousYearEvents, "spring_equinox") },
    { key: "summer_solstice", utc: getEventUtc(previousYearEvents, "summer_solstice") },
    { key: "autumn_equinox", utc: getEventUtc(previousYearEvents, "autumn_equinox") },
    { key: "winter_solstice", utc: getEventUtc(previousYearEvents, "winter_solstice") },
    { key: "spring_equinox", utc: getEventUtc(currentYearEvents, "spring_equinox") },
    { key: "summer_solstice", utc: getEventUtc(currentYearEvents, "summer_solstice") },
    { key: "autumn_equinox", utc: getEventUtc(currentYearEvents, "autumn_equinox") },
    { key: "winter_solstice", utc: getEventUtc(currentYearEvents, "winter_solstice") },
    { key: "spring_equinox", utc: getEventUtc(nextYearEvents, "spring_equinox") },
  ];

  const previousAstronomicalCandidates = astronomicalEvents.filter(
    (event) =>
      event.key === seasonContext.displayPreviousSeasonEvent &&
      event.utc.getTime() <= target.getTime()
  );
  const previousAstronomicalEvent = previousAstronomicalCandidates[previousAstronomicalCandidates.length - 1];

  if (!previousAstronomicalEvent) {
    throw new Error("Unable to resolve previous season timeline event boundary.");
  }

  const nextAstronomicalEvent = astronomicalEvents.find(
    (event) =>
      event.key === seasonContext.displayNextSeasonEvent &&
      event.utc.getTime() > previousAstronomicalEvent.utc.getTime()
  );

  if (!nextAstronomicalEvent) {
    throw new Error("Unable to resolve next season timeline event boundary.");
  }

  const observablePreviousTransitionUtc = await resolveObservableTransitionUtc(previousAstronomicalEvent.utc, location);
  const observableNextTransitionUtc = await resolveObservableTransitionUtc(nextAstronomicalEvent.utc, location);

  const astronomicalEventPassed = nextAstronomicalEvent.utc.getTime() <= target.getTime();
  const observableTransitionPending = observableNextTransitionUtc.getTime() > target.getTime();

  return {
    seasonMode: seasonContext.seasonMode,
    displaySeason: seasonContext.displaySeason,
    displayPreviousSeasonEvent: seasonContext.displayPreviousSeasonEvent,
    displayNextSeasonEvent: seasonContext.displayNextSeasonEvent,

    previousSeasonEventUtc: previousAstronomicalEvent.utc.toISOString(),
    nextSeasonEventUtc: nextAstronomicalEvent.utc.toISOString(),

    observablePreviousTransitionUtc: observablePreviousTransitionUtc.toISOString(),
    observableNextTransitionUtc: observableNextTransitionUtc.toISOString(),

    astronomicalEventPassed,
    hoursSinceAstronomicalEvent: astronomicalEventPassed
      ? diffHoursFloor(target, nextAstronomicalEvent.utc)
      : null,
    daysUntilAstronomicalEvent: astronomicalEventPassed
      ? null
      : diffDaysCeil(nextAstronomicalEvent.utc, target),
    hoursUntilAstronomicalEvent: astronomicalEventPassed
      ? null
      : diffHoursCeil(nextAstronomicalEvent.utc, target),

    observableTransitionPending,
    daysUntilObservableNextTransition: diffDaysCeil(observableNextTransitionUtc, target),
    hoursUntilObservableNextTransition: diffHoursCeil(observableNextTransitionUtc, target),
  };
}
