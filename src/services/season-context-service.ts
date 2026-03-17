import { GeoLocation } from "../core/types";
import { getSunset } from "./astronomy-authority-client";
import { getLocalSunsetUtc as getApproxLocalSunsetUtc } from "../sunset/sunset";
import { getSeasonEvents } from "./season-events-service";

export interface SeasonContext {
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
}

type SeasonEventKey =
  | "spring_equinox"
  | "summer_solstice"
  | "autumn_equinox"
  | "winter_solstice";

interface SeasonEventPoint {
  key: SeasonEventKey;
  utc: Date;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function diffDaysFloor(later: Date, earlier: Date): number {
  return Math.floor((later.getTime() - earlier.getTime()) / MS_PER_DAY);
}

function diffDaysCeil(later: Date, earlier: Date): number {
  return Math.ceil((later.getTime() - earlier.getTime()) / MS_PER_DAY);
}

function buildSeasonFromPreviousEvent(event: SeasonEventKey): "spring" | "summer" | "autumn" | "winter" {
  switch (event) {
    case "spring_equinox":
      return "spring";
    case "summer_solstice":
      return "summer";
    case "autumn_equinox":
      return "autumn";
    case "winter_solstice":
      return "winter";
  }
}

async function resolveSunsetUtc(date: Date, location: GeoLocation): Promise<Date> {
  try {
    const data = await getSunset(date, location.latitude, location.longitude);
    return new Date(data.sunsetUTC);
  } catch {
    return getApproxLocalSunsetUtc(date, location);
  }
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

  throw new Error("Unable to resolve observable sunset transition for season event.");
}

function resolveAstronomicalContext(
  target: Date,
  allEvents: SeasonEventPoint[]
) {
  let previousEvent = allEvents[0];
  let nextEvent = allEvents[allEvents.length - 1];

  for (let i = 0; i < allEvents.length; i++) {
    const event = allEvents[i];

    if (event.utc.getTime() <= target.getTime()) {
      previousEvent = event;
    }

    if (event.utc.getTime() > target.getTime()) {
      nextEvent = event;
      break;
    }
  }

  const sincePrev = diffDaysFloor(target, previousEvent.utc);
  const untilNext = diffDaysCeil(nextEvent.utc, target);

  const nearestSeasonEvent =
    Math.abs(target.getTime() - previousEvent.utc.getTime()) <=
    Math.abs(nextEvent.utc.getTime() - target.getTime())
      ? previousEvent.key
      : nextEvent.key;

  return {
    season: buildSeasonFromPreviousEvent(previousEvent.key),
    nearestSeasonEvent,
    previousSeasonEvent: previousEvent.key,
    nextSeasonEvent: nextEvent.key,
    daysSincePreviousSeasonEvent: sincePrev,
    daysUntilNextSeasonEvent: untilNext,
  };
}

async function resolveObservableContext(
  target: Date,
  allEvents: SeasonEventPoint[],
  location: GeoLocation
) {
  const observableEvents = await Promise.all(
    allEvents.map(async (event) => ({
      key: event.key,
      utc: await resolveObservableTransitionUtc(event.utc, location),
    }))
  );

  let previousEvent = observableEvents[0];
  let nextEvent = observableEvents[observableEvents.length - 1];

  for (let i = 0; i < observableEvents.length; i++) {
    const event = observableEvents[i];

    if (event.utc.getTime() <= target.getTime()) {
      previousEvent = event;
    }

    if (event.utc.getTime() > target.getTime()) {
      nextEvent = event;
      break;
    }
  }

  const sincePrev = diffDaysFloor(target, previousEvent.utc);
  const untilNext = diffDaysCeil(nextEvent.utc, target);

  return {
    observableSeason: buildSeasonFromPreviousEvent(previousEvent.key),
    observablePreviousSeasonEvent: previousEvent.key,
    observableNextSeasonEvent: nextEvent.key,
    daysSinceObservablePreviousSeasonEvent: sincePrev,
    daysUntilObservableNextSeasonEvent: untilNext,
  };
}

export async function getSeasonContext(
  target: Date,
  location: GeoLocation
): Promise<SeasonContext> {
  const year = target.getUTCFullYear();

  const previousYearEvents = await getSeasonEvents(year - 1);
  const currentYearEvents = await getSeasonEvents(year);
  const nextYearEvents = await getSeasonEvents(year + 1);

  const allEvents: SeasonEventPoint[] = [
    {
      key: "spring_equinox",
      utc: new Date(previousYearEvents.events.spring_equinox.utc),
    },
    {
      key: "summer_solstice",
      utc: new Date(previousYearEvents.events.summer_solstice.utc),
    },
    {
      key: "autumn_equinox",
      utc: new Date(previousYearEvents.events.autumn_equinox.utc),
    },
    {
      key: "winter_solstice",
      utc: new Date(previousYearEvents.events.winter_solstice.utc),
    },
    {
      key: "spring_equinox",
      utc: new Date(currentYearEvents.events.spring_equinox.utc),
    },
    {
      key: "summer_solstice",
      utc: new Date(currentYearEvents.events.summer_solstice.utc),
    },
    {
      key: "autumn_equinox",
      utc: new Date(currentYearEvents.events.autumn_equinox.utc),
    },
    {
      key: "winter_solstice",
      utc: new Date(currentYearEvents.events.winter_solstice.utc),
    },
    {
      key: "spring_equinox",
      utc: new Date(nextYearEvents.events.spring_equinox.utc),
    },
  ];

  const astronomical = resolveAstronomicalContext(target, allEvents);
  const observable = await resolveObservableContext(target, allEvents, location);

  return {
    seasonMode: "observable",

    season: astronomical.season,
    nearestSeasonEvent: astronomical.nearestSeasonEvent,
    previousSeasonEvent: astronomical.previousSeasonEvent,
    nextSeasonEvent: astronomical.nextSeasonEvent,
    daysSincePreviousSeasonEvent: astronomical.daysSincePreviousSeasonEvent,
    daysUntilNextSeasonEvent: astronomical.daysUntilNextSeasonEvent,

    observableSeason: observable.observableSeason,
    observablePreviousSeasonEvent: observable.observablePreviousSeasonEvent,
    observableNextSeasonEvent: observable.observableNextSeasonEvent,
    daysSinceObservablePreviousSeasonEvent: observable.daysSinceObservablePreviousSeasonEvent,
    daysUntilObservableNextSeasonEvent: observable.daysUntilObservableNextSeasonEvent,

    displaySeason: observable.observableSeason,
    displayPreviousSeasonEvent: observable.observablePreviousSeasonEvent,
    displayNextSeasonEvent: observable.observableNextSeasonEvent,
  };
}
