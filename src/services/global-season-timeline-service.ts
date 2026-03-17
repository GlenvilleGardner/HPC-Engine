import { getGlobalSeasonEvents, GlobalSeasonEventDetail, GlobalSeasonEventKey } from "../astronomy/global-season-events";

export interface GlobalSeasonTimelineContext {
  eventKey: GlobalSeasonEventKey | null;
  previousEventKey: GlobalSeasonEventKey;
  nextEventKey: GlobalSeasonEventKey;

  previousEventUtc: string;
  nextEventUtc: string;

  previousObservableTransitionUtc: string;
  nextObservableTransitionUtc: string;

  astronomicalEventPassed: boolean;
  hoursSinceAstronomicalEvent: number | null;
  daysUntilAstronomicalEvent: number | null;
  hoursUntilAstronomicalEvent: number | null;

  observableTransitionPassed: boolean;
  hoursSinceObservableTransition: number | null;
  daysUntilObservableTransition: number | null;
  hoursUntilObservableTransition: number | null;
}

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;

function diffDaysCeil(later: Date, earlier: Date): number {
  return Math.ceil((later.getTime() - earlier.getTime()) / MS_PER_DAY);
}

function diffHoursCeil(later: Date, earlier: Date): number {
  return Math.ceil((later.getTime() - earlier.getTime()) / MS_PER_HOUR);
}

function diffHoursFloor(later: Date, earlier: Date): number {
  return Math.floor((later.getTime() - earlier.getTime()) / MS_PER_HOUR);
}

export async function getGlobalSeasonTimelineContext(
  target: Date
): Promise<GlobalSeasonTimelineContext> {
  const year = target.getUTCFullYear();

  const previousYearEvents = await getGlobalSeasonEvents(year - 1);
  const currentYearEvents = await getGlobalSeasonEvents(year);
  const nextYearEvents = await getGlobalSeasonEvents(year + 1);

  const allEvents: GlobalSeasonEventDetail[] = [
    ...previousYearEvents,
    ...currentYearEvents,
    ...nextYearEvents,
  ].sort((a, b) => a.eventUtc.getTime() - b.eventUtc.getTime());

  let previousEvent = allEvents[0];
  let nextEvent = allEvents[allEvents.length - 1];

  for (let i = 0; i < allEvents.length; i++) {
    const event = allEvents[i];

    if (event.observableTransitionUtc.getTime() <= target.getTime()) {
      previousEvent = event;
    }

    if (event.observableTransitionUtc.getTime() > target.getTime()) {
      nextEvent = event;
      break;
    }
  }

  const astronomicalEventPassed = nextEvent.eventUtc.getTime() <= target.getTime();
  const observableTransitionPassed = nextEvent.observableTransitionUtc.getTime() <= target.getTime();

  return {
    eventKey: astronomicalEventPassed ? nextEvent.eventKey : previousEvent.eventKey,
    previousEventKey: previousEvent.eventKey,
    nextEventKey: nextEvent.eventKey,

    previousEventUtc: previousEvent.eventUtc.toISOString(),
    nextEventUtc: nextEvent.eventUtc.toISOString(),

    previousObservableTransitionUtc: previousEvent.observableTransitionUtc.toISOString(),
    nextObservableTransitionUtc: nextEvent.observableTransitionUtc.toISOString(),

    astronomicalEventPassed,
    hoursSinceAstronomicalEvent: astronomicalEventPassed
      ? diffHoursFloor(target, nextEvent.eventUtc)
      : null,
    daysUntilAstronomicalEvent: astronomicalEventPassed
      ? null
      : diffDaysCeil(nextEvent.eventUtc, target),
    hoursUntilAstronomicalEvent: astronomicalEventPassed
      ? null
      : diffHoursCeil(nextEvent.eventUtc, target),

    observableTransitionPassed,
    hoursSinceObservableTransition: observableTransitionPassed
      ? diffHoursFloor(target, nextEvent.observableTransitionUtc)
      : null,
    daysUntilObservableTransition: observableTransitionPassed
      ? null
      : diffDaysCeil(nextEvent.observableTransitionUtc, target),
    hoursUntilObservableTransition: observableTransitionPassed
      ? null
      : diffHoursCeil(nextEvent.observableTransitionUtc, target),
  };
}
