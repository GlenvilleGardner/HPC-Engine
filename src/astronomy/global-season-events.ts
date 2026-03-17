import { getSeasonEvents, getSubsolarPoint, getSunset } from "../services/astronomy-authority-client";

export type GlobalSeasonEventKey =
  | "spring_equinox"
  | "summer_solstice"
  | "autumn_equinox"
  | "winter_solstice";

export interface GlobalSeasonEventDetail {
  eventKey: GlobalSeasonEventKey;
  eventUtc: Date;
  eventLatitude: number;
  eventLongitude: number;
  observableWindowStartUtc: Date;
  observableWindowEndUtc: Date;
  observableTransitionUtc: Date;
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

async function resolveSunsetUtc(date: Date, latitude: number, longitude: number): Promise<Date> {
  const data = await getSunset(date, latitude, longitude);
  return new Date(data.sunsetUTC);
}

async function resolveGlobalEventDetail(
  eventKey: GlobalSeasonEventKey,
  eventUtc: Date
): Promise<GlobalSeasonEventDetail> {
  const subsolar = await getSubsolarPoint(eventUtc);
  const eventLatitude = subsolar.subsolarLatitude;
  const eventLongitude = subsolar.subsolarLongitude;

  const eventDayUtc = startOfUtcDay(eventUtc);

  const sampleDays = [
    addUtcDays(eventDayUtc, -1),
    eventDayUtc,
    addUtcDays(eventDayUtc, 1),
  ];

  const sampledSunsets = await Promise.all(
    sampleDays.map((day) => resolveSunsetUtc(day, eventLatitude, eventLongitude))
  );

  const sunsets = sortDatesAscending(sampledSunsets);

  for (let i = 0; i < sunsets.length - 1; i++) {
    const start = sunsets[i];
    const end = sunsets[i + 1];

    if (
      eventUtc.getTime() >= start.getTime() &&
      eventUtc.getTime() < end.getTime()
    ) {
      return {
        eventKey,
        eventUtc,
        eventLatitude,
        eventLongitude,
        observableWindowStartUtc: start,
        observableWindowEndUtc: end,
        observableTransitionUtc: end,
      };
    }
  }

  throw new Error(`Unable to resolve global observable window for ${eventKey}.`);
}

export async function getGlobalSeasonEvents(year: number): Promise<GlobalSeasonEventDetail[]> {
  const seasonEvents = await getSeasonEvents(year);

  const items: Array<{ key: GlobalSeasonEventKey; utc: Date }> = [
    {
      key: "spring_equinox",
      utc: new Date(seasonEvents.events.spring_equinox.utc),
    },
    {
      key: "summer_solstice",
      utc: new Date(seasonEvents.events.summer_solstice.utc),
    },
    {
      key: "autumn_equinox",
      utc: new Date(seasonEvents.events.autumn_equinox.utc),
    },
    {
      key: "winter_solstice",
      utc: new Date(seasonEvents.events.winter_solstice.utc),
    },
  ];

  return Promise.all(items.map((item) => resolveGlobalEventDetail(item.key, item.utc)));
}
