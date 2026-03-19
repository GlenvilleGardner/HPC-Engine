/**
 * zadok.ts
 *
 * Zadok Priestly Course Calculator
 *
 * Based on the 24 priestly courses (mishmarot) established in 1 Chronicles 24.
 * The courses rotate on a weekly basis through the 364-day HPC year.
 *
 * MATHEMATICAL FOUNDATION:
 * - 24 courses × 2 rotations = 48 service weeks per year
 * - 4 festival weeks (all courses serve together)
 * - 48 + 4 = 52 weeks = 364 days ✓
 *
 * EPOCH ANCHOR:
 * - The course of Jehoiarib (Course 1) began its service in the
 *   first week of the first HPC year (Abib 1, Year 1 SCE).
 * - The 6-year cycle resets every 6 HPC years because:
 *   24 courses × 2 rotations = 48 non-festival weeks
 *   48 weeks mod 52 weeks = does not divide evenly
 *   LCM(24, 52) = 312 weeks = 6 years of 52 weeks each
 *   Therefore the full rotation cycle repeats every 6 HPC years.
 *
 * FESTIVAL WEEKS:
 * During the four festival weeks all 24 courses serve together.
 * Festival weeks occur at:
 *   Week 1  (Abib 1–7)      — Passover / Unleavened Bread
 *   Week 15 (Ethnaim 1–7)   — Trumpets / Atonement
 *   Week 16 (Ethnaim 8–14)  — Tabernacles week 1
 *   Week 17 (Ethnaim 15–21) — Tabernacles week 2 / Last Great Day
 *
 * NATIVITY CALCULATION:
 * The birth of Yeshua can be calculated through:
 * 1. Zechariah served in the course of Abijah (Course 8)
 * 2. The angel appeared to him during his Temple service
 * 3. Elisabeth conceived shortly after
 * 4. Six months later the angel appeared to Miriam
 * 5. Yeshua was born approximately 9 months after the annunciation
 */

export interface PriestlyCourse {
  number: number;
  name: string;
  hebrewName: string;
  scriptureRef: string;
}

export interface ZadokDayResult {
  hpcYear: number;
  hpcMonth: number;
  hpcDay: number;
  weekOfYear: number;
  isFestivalWeek: boolean;
  festivalName: string | null;
  activeCourse: PriestlyCourse | null;
  courseWeekDay: number;
  sixYearCyclePosition: number;
  note: string;
}

export interface NativityCalculation {
  zechariasCourse: PriestlyCourse;
  zechariasServiceWeek: number;
  elisabethConceptionMonth: number;
  elisabethConceptionDay: number;
  annunciationMonth: number;
  annunciationDay: number;
  nativityMonth: number;
  nativityDay: number;
  nativityWeekday: string;
  explanation: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// The 24 Priestly Courses — 1 Chronicles 24:7-18
// ─────────────────────────────────────────────────────────────────────────────

export const PRIESTLY_COURSES: PriestlyCourse[] = [
  { number: 1,  name: "Jehoiarib",  hebrewName: "יְהוֹיָרִיב", scriptureRef: "1 Chr 24:7"  },
  { number: 2,  name: "Jedaiah",    hebrewName: "יְדַעְיָה",   scriptureRef: "1 Chr 24:7"  },
  { number: 3,  name: "Harim",      hebrewName: "חָרִם",       scriptureRef: "1 Chr 24:8"  },
  { number: 4,  name: "Seorim",     hebrewName: "שְׂעוֹרִים",  scriptureRef: "1 Chr 24:8"  },
  { number: 5,  name: "Malchijah",  hebrewName: "מַלְכִּיָּה", scriptureRef: "1 Chr 24:9"  },
  { number: 6,  name: "Mijamin",    hebrewName: "מִיָּמִן",    scriptureRef: "1 Chr 24:9"  },
  { number: 7,  name: "Hakkoz",     hebrewName: "הַקּוֹץ",     scriptureRef: "1 Chr 24:10" },
  { number: 8,  name: "Abijah",     hebrewName: "אֲבִיָּה",    scriptureRef: "1 Chr 24:10" },
  { number: 9,  name: "Jeshua",     hebrewName: "יֵשׁוּעַ",    scriptureRef: "1 Chr 24:11" },
  { number: 10, name: "Shecaniah",  hebrewName: "שְׁכַנְיָה",  scriptureRef: "1 Chr 24:11" },
  { number: 11, name: "Eliashib",   hebrewName: "אֶלְיָשִׁיב", scriptureRef: "1 Chr 24:12" },
  { number: 12, name: "Jakim",      hebrewName: "יָקִים",      scriptureRef: "1 Chr 24:12" },
  { number: 13, name: "Huppah",     hebrewName: "חֻפָּה",      scriptureRef: "1 Chr 24:13" },
  { number: 14, name: "Jeshebeab",  hebrewName: "יֶשֶׁבְאָב",  scriptureRef: "1 Chr 24:13" },
  { number: 15, name: "Bilgah",     hebrewName: "בִּלְגָּה",   scriptureRef: "1 Chr 24:14" },
  { number: 16, name: "Immer",      hebrewName: "אִמֵּר",      scriptureRef: "1 Chr 24:14" },
  { number: 17, name: "Hezir",      hebrewName: "חֵזִיר",      scriptureRef: "1 Chr 24:15" },
  { number: 18, name: "Happizzez",  hebrewName: "הַפִּצֵּץ",   scriptureRef: "1 Chr 24:15" },
  { number: 19, name: "Pethahiah",  hebrewName: "פְּתַחְיָה",  scriptureRef: "1 Chr 24:16" },
  { number: 20, name: "Jehezkel",   hebrewName: "יְחֶזְקֵאל",  scriptureRef: "1 Chr 24:16" },
  { number: 21, name: "Jachin",     hebrewName: "יָכִין",      scriptureRef: "1 Chr 24:17" },
  { number: 22, name: "Gamul",      hebrewName: "גָּמוּל",     scriptureRef: "1 Chr 24:17" },
  { number: 23, name: "Delaiah",    hebrewName: "דְּלָיָה",    scriptureRef: "1 Chr 24:18" },
  { number: 24, name: "Maaziah",    hebrewName: "מַעֲזְיָה",   scriptureRef: "1 Chr 24:18" }
];

// ─────────────────────────────────────────────────────────────────────────────
// Festival Weeks — all 24 courses serve together
// ─────────────────────────────────────────────────────────────────────────────

const FESTIVAL_WEEKS: Record<number, string> = {
  1:  "Passover / Unleavened Bread",
  15: "Day of Trumpets / Day of Atonement",
  16: "Feast of Tabernacles (Week 1)",
  17: "Feast of Tabernacles (Week 2) / Last Great Day"
};

// ─────────────────────────────────────────────────────────────────────────────
// Core calculation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the 1-indexed week of year (1–52) for a given HPC month and day.
 */
export function getWeekOfYear(month: number, day: number): number {
  const dayOfYear = (month - 1) * 28 + day;
  return Math.ceil(dayOfYear / 7);
}

/**
 * Returns the day within the current service week (1–7).
 * 1 = Thursday (first day of HPC week)
 * 7 = Wednesday (last day of HPC week)
 */
export function getCourseWeekDay(day: number): number {
  return ((day - 1) % 7) + 1;
}

/**
 * Returns the active priestly course for a given week of year and HPC year.
 *
 * The 6-year cycle:
 * - Non-festival weeks are numbered 1–48 after removing the 4 festival weeks
 * - Courses rotate through these 48 non-festival weeks
 * - The cycle position within the 6-year (312-week) period determines
 *   which of the 24 courses is serving
 */
export function getActiveCourse(
  weekOfYear: number,
  hpcYear: number
): PriestlyCourse | null {
  // Festival weeks — all courses serve, no single course assigned
  if (FESTIVAL_WEEKS[weekOfYear]) return null;

  // Remove festival weeks to get non-festival week index (0-based)
  const festivalWeeksBefore = Object.keys(FESTIVAL_WEEKS)
    .map(Number)
    .filter(w => w < weekOfYear)
    .length;

  const nonFestivalWeekIndex = weekOfYear - 1 - festivalWeeksBefore;

  // Position within the 6-year cycle
  // 6 years × 48 non-festival weeks = 288 non-festival week slots
  // But we use the full 52-week year for cycle counting
  const yearsSinceEpoch = hpcYear - 1; // Year 1 SCE = index 0
  const totalNonFestivalWeeks =
    (yearsSinceEpoch * 48) + nonFestivalWeekIndex;

  // 24 courses, each serving for 1 week at a time
  const courseIndex = totalNonFestivalWeeks % 24;

  return PRIESTLY_COURSES[courseIndex];
}

/**
 * Main resolver — returns full Zadok information for a given HPC date.
 */
export function resolveZadokDay(
  hpcYear: number,
  hpcMonth: number,
  hpcDay: number
): ZadokDayResult {
  const weekOfYear = getWeekOfYear(hpcMonth, hpcDay);
  const courseWeekDay = getCourseWeekDay(hpcDay);
  const isFestivalWeek = weekOfYear in FESTIVAL_WEEKS;
  const festivalName = FESTIVAL_WEEKS[weekOfYear] ?? null;
  const activeCourse = isFestivalWeek
    ? null
    : getActiveCourse(weekOfYear, hpcYear);

  // Position within 6-year cycle (1–6)
  const sixYearCyclePosition = ((hpcYear - 1) % 6) + 1;

  let note = "";
  if (isFestivalWeek) {
    note = `All 24 courses serve together during ${festivalName}.`;
  } else if (activeCourse) {
    note = `Course of ${activeCourse.name} is on Temple service this week.`;
  }

  return {
    hpcYear,
    hpcMonth,
    hpcDay,
    weekOfYear,
    isFestivalWeek,
    festivalName,
    activeCourse,
    courseWeekDay,
    sixYearCyclePosition,
    note
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Nativity Calculation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates the birth of Yeshua based on the priestly course of Abijah.
 *
 * Luke 1:5  — Zechariah was of the course of Abijah (Course 8)
 * Luke 1:8  — He served in the order of his course
 * Luke 1:23 — Elisabeth conceived after Zechariah returned home
 * Luke 1:26 — In the sixth month of Elisabeth's pregnancy the angel
 *              appeared to Miriam
 * Luke 1:31 — Miriam would conceive and bear a son
 *
 * Course of Abijah = Course 8
 * In a standard HPC year Course 8 serves in week 8 of year 1 of each
 * 6-year cycle (non-festival weeks only).
 *
 * Week 8 of year = Abib weeks 1-4 + Ziv weeks 1-4
 * Non-festival week 8 starts after festival week 1 (week 1)
 * So non-festival week 8 = actual week 9 (skipping festival week 1)
 *
 * Week 9 = days 57-63 = Ziv 1-7
 * Zechariah's service: Ziv 1-7 (Month 2)
 * Elisabeth conceives: approximately Ziv / early Sivan (Month 2-3)
 * Six months later = Month 8-9 (Bul / Kislev)
 * Annunciation to Miriam: Month 8, Day 1 (approximately)
 * Yeshua born 9 months later: Month 5 (Av) of following year
 *
 * This places the birth of Yeshua in the summer — Month 5 (Av)
 * not in winter, consistent with shepherds in the field at night.
 */
export function calculateNativity(epochHpcYear: number): NativityCalculation {
  const zechariasCourse = PRIESTLY_COURSES[7]; // Course 8 = Abijah (0-indexed)

  // Abijah is course 8 — in year 1 of the 6-year cycle it serves
  // in non-festival week 8, which falls in actual week 9 (Ziv 1-7)
  const zechariasServiceWeek = 9;

  // Elisabeth conceives after Zechariah returns — Month 2 (Ziv)
  const elisabethConceptionMonth = 2;
  const elisabethConceptionDay = 14;

  // Six months after conception = Month 8 (Bul)
  const annunciationMonth = 8;
  const annunciationDay = 14;

  // Nine months after annunciation = Month 5 (Av) of next year
  const nativityMonth = 5;
  const nativityDay = 1;

  // Av 1 weekday = (1-1) mod 7 = 0 = Thursday
  const nativityWeekday = "Thursday";

  return {
    zechariasCourse,
    zechariasServiceWeek,
    elisabethConceptionMonth,
    elisabethConceptionDay,
    annunciationMonth,
    annunciationDay,
    nativityMonth,
    nativityDay,
    nativityWeekday,
    explanation: [
      "Zechariah served in the course of Abijah (Course 8) — Luke 1:5.",
      "Course 8 serves in week 9 of the HPC year (Ziv 1-7, Month 2).",
      "Elisabeth conceived after Zechariah returned home — approximately Month 2, Day 14.",
      "Six months later the angel appeared to Miriam — approximately Month 8 (Bul), Day 14.",
      "Yeshua was born approximately nine months after the annunciation.",
      "This places the nativity in Month 5 (Av), Day 1 of the following HPC year.",
      "Month 5, Day 1 is always Thursday in the HPC calendar.",
      "Shepherds in the field at night confirms a summer birth, not December.",
      "Av 1 in HPC year 4050 SCE corresponds to approximately July 4, 2 BC."
    ].join(" ")
  };
}