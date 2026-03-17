export type SeasonEventType =
  | "spring_equinox"
  | "summer_solstice"
  | "autumn_equinox"
  | "winter_solstice";

export interface SeasonEventRecord {
  utc: string;
  eventType: SeasonEventType;
}

export interface SeasonEventsMap {
  spring_equinox: SeasonEventRecord;
  summer_solstice: SeasonEventRecord;
  autumn_equinox: SeasonEventRecord;
  winter_solstice: SeasonEventRecord;
}

export interface SeasonEventsResponse {
  year: number;
  events: SeasonEventsMap;
  source?: {
    authority: string;
    kernel?: string;
  };
}
