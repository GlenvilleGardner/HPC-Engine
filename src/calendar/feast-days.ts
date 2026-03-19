import { HPCYearType } from "../core/types";
/**
 * HPC FEAST DAY DATING PRINCIPLE
 *
 * HPC feast days are fixed calendar dates determined entirely by the
 * Torah's explicit day-of-month assignments. They do not follow lunar
 * phases, lunar observation, or any lunisolar calculation.
 *
 * The moon plays no role in determining when HPC feast days occur.
 * If a feast day coincides with a lunar phase that is noted as an
 * astronomical alignment only — it does not govern the date.
 *
 * The HPC calendar honors the Torah's plain statement of dates:
 *   Passover        = 14th day of Month 1  (always Wednesday)
 *   Unleavened Bread = 15th day of Month 1  (always Thursday)
 *   Firstfruits     = 18th day of Month 1  (always Sunday)
 *   Feast of Weeks  = 11th day of Month 3  (always Sunday)
 *   Trumpets        = 1st day of Month 7   (always Thursday)
 *   Atonement       = 10th day of Month 7  (always Sabbath)
 *   Tabernacles     = 15th day of Month 7  (always Thursday)
 *
 * Because the annual grid resets every year and every month begins
 * on Thursday, these weekday assignments are permanent and invariant
 * across all past and future years without exception.
 */

export interface FeastDay {
  name: string;
  hebrewName: string;
  month: number;
  day: number;
  weekday: string;
  description: string;
  scriptureRef: string;
  dssAgreement: "full" | "partial" | "none" | "na";
}

// Weekday formula: W = (day - 1) mod 7
// 0=Thursday, 1=Friday, 2=Sabbath, 3=Sunday, 4=Monday, 5=Tuesday, 6=Wednesday
const WEEKDAY_NAMES = [
  "Thursday", "Friday", "Sabbath",
  "Sunday", "Monday", "Tuesday", "Wednesday"
];

function getWeekday(day: number): string {
  return WEEKDAY_NAMES[(day - 1) % 7];
}

export const HPC_FEAST_DAYS: FeastDay[] = [
  {
    name: "New Year / New Moon of Abib",
    hebrewName: "Rosh HaShanah HaSolar",
    month: 1,
    day: 1,
    weekday: getWeekday(1),
    description: "First day of the HPC year. The grid resets. Thursday begins at Wednesday sunset following the spring equinox.",
    scriptureRef: "Exodus 12:2; Exodus 34:18",
    dssAgreement: "na"
  },
  {
    name: "Passover",
    hebrewName: "Pesach",
    month: 1,
    day: 14,
    weekday: getWeekday(14),
    description: "The Passover lamb is slain between noon and sunset on the 14th day — between the two evenings (bein ha'arbayim). Always Wednesday. The Passover meal follows after sunset, which begins the 15th. Fixed calendar date per Leviticus 23:5, not determined by lunar observation.",
    scriptureRef: "Leviticus 23:5; Exodus 12:6",
    dssAgreement: "full"
  },
  {
    name: "First Day of Unleavened Bread",
    hebrewName: "Chag HaMatzot",
    month: 1,
    day: 15,
    weekday: getWeekday(15),
    description: "High Sabbath. First day of the seven-day Feast of Unleavened Bread.",
    scriptureRef: "Leviticus 23:6-7",
    dssAgreement: "full"
  },
  {
    name: "Day of Firstfruits",
    hebrewName: "Yom HaBikkurim",
    month: 1,
    day: 18,
    weekday: getWeekday(18),
    description: "Wave sheaf offering. Always Sunday — the day after the weekly Sabbath during Unleavened Bread week. The 50-day count to Feast of Weeks begins from this day.",
    scriptureRef: "Leviticus 23:10-11",
    dssAgreement: "full"
  },
  {
    name: "Last Day of Unleavened Bread",
    hebrewName: "Shevi'i shel Pesach",
    month: 1,
    day: 21,
    weekday: getWeekday(21),
    description: "High Sabbath. Final day of the Feast of Unleavened Bread.",
    scriptureRef: "Leviticus 23:8",
    dssAgreement: "partial"
  },
  {
    name: "Feast of Weeks / Pentecost",
    hebrewName: "Shavuot",
    month: 3,
    day: 11,
    weekday: getWeekday(11),
    description: "50th day counted from the day after the Sabbath in Unleavened Bread week (Month 1, Day 18). Always Sunday — the first day of the creation week.",
    scriptureRef: "Leviticus 23:15-16; Deuteronomy 16:9-10",
    dssAgreement: "full"
  },
  {
    name: "Day of Trumpets",
    hebrewName: "Yom Teruah",
    month: 7,
    day: 1,
    weekday: getWeekday(1),
    description: "Memorial of blowing of trumpets. First day of Month 7 (Ethnaim).",
    scriptureRef: "Leviticus 23:24; Numbers 29:1",
    dssAgreement: "partial"
  },
  {
    name: "Day of Atonement",
    hebrewName: "Yom Kippur",
    month: 7,
    day: 10,
    weekday: getWeekday(10),
    description: "Most solemn day of the year. Always falls on the Sabbath — the most sacred day of the year on the most sacred day of the week.",
    scriptureRef: "Leviticus 23:27-28",
    dssAgreement: "partial"
  },
  {
    name: "First Day of Tabernacles",
    hebrewName: "Sukkot",
    month: 7,
    day: 15,
    weekday: getWeekday(15),
    description: "High Sabbath. First day of the seven-day Feast of Tabernacles.",
    scriptureRef: "Leviticus 23:34-35",
    dssAgreement: "partial"
  },
  {
    name: "Last Great Day",
    hebrewName: "Shemini Atzeret",
    month: 7,
    day: 22,
    weekday: getWeekday(22),
    description: "High Sabbath. The eighth day assembly following Tabernacles.",
    scriptureRef: "Leviticus 23:36; Numbers 29:35",
    dssAgreement: "na"
  }
];

export interface FeastDayCalendar {
  hpcYear: number;
  yearType: HPCYearType;
  feastDays: FeastDay[];
}

export function getFeastDayCalendar(
  hpcYear: number,
  yearType: HPCYearType
): FeastDayCalendar {
  return {
    hpcYear,
    yearType,
    feastDays: HPC_FEAST_DAYS
  };
}

export function getFeastDayForDate(
  month: number,
  day: number
): FeastDay | null {
  return HPC_FEAST_DAYS.find(
    f => f.month === month && f.day === day
  ) ?? null;
}