export type SolarPhase =
  | "Spring-Ascent"
  | "Summer-Apex"
  | "Autumn-Decline"
  | "Winter-Recovery";

export function resolveSolarPhase(dayOfYearApprox: number): SolarPhase {
  if (dayOfYearApprox >= 0 && dayOfYearApprox < 92) {
    return "Spring-Ascent";
  }

  if (dayOfYearApprox >= 92 && dayOfYearApprox < 184) {
    return "Summer-Apex";
  }

  if (dayOfYearApprox >= 184 && dayOfYearApprox < 276) {
    return "Autumn-Decline";
  }

  return "Winter-Recovery";
}
