import { MemoryCache } from "../cache/memory-cache";
import {
  getSeasonEvents as getAuthoritySeasonEvents,
  SeasonEventsAuthorityResponse,
} from "./astronomy-authority-client";
import { SeasonEventsResponse } from "../utils/season-events-types";

const seasonEventsCache = new MemoryCache<SeasonEventsResponse>(24 * 60 * 60 * 1000);

function cacheKey(year: number): string {
  return `season-events:${year}`;
}

function buildFallbackSeasonEvents(year: number): SeasonEventsResponse {
  return {
    year,
    events: {
      spring_equinox: {
        utc: new Date(Date.UTC(year, 2, 20, 0, 0, 0)).toISOString(),
        eventType: "spring_equinox",
      },
      summer_solstice: {
        utc: new Date(Date.UTC(year, 5, 21, 0, 0, 0)).toISOString(),
        eventType: "summer_solstice",
      },
      autumn_equinox: {
        utc: new Date(Date.UTC(year, 8, 22, 0, 0, 0)).toISOString(),
        eventType: "autumn_equinox",
      },
      winter_solstice: {
        utc: new Date(Date.UTC(year, 11, 21, 0, 0, 0)).toISOString(),
        eventType: "winter_solstice",
      },
    },
    source: {
      authority: "HPC-Engine-fallback",
      kernel: "placeholder",
    },
  };
}

function mapAuthorityResponse(data: SeasonEventsAuthorityResponse): SeasonEventsResponse {
  return {
    year: data.year,
    events: {
      spring_equinox: data.events.spring_equinox,
      summer_solstice: data.events.summer_solstice,
      autumn_equinox: data.events.autumn_equinox,
      winter_solstice: data.events.winter_solstice,
    },
    source: {
      authority: "HPC-Astronomy-Authority",
      kernel: data.kernel,
    },
  };
}

export async function getSeasonEvents(year: number): Promise<SeasonEventsResponse> {
  const key = cacheKey(year);
  const cached = seasonEventsCache.get(key);

  if (cached) {
    return cached;
  }

  let response: SeasonEventsResponse;

  try {
    const authorityData = await getAuthoritySeasonEvents(year);
    response = mapAuthorityResponse(authorityData);
  } catch {
    console.warn("Season events authority unavailable, falling back to placeholder seasonal markers.");
    response = buildFallbackSeasonEvents(year);
  }

  seasonEventsCache.set(key, response);
  return response;
}
