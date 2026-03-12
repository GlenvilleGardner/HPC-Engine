import { CropModel } from "./crop-model";

export function evaluatePlantingWindow(
  soilTempC: number,
  frostRisk: number,
  crop: CropModel
): string {
  if (soilTempC >= crop.baseTempC && frostRisk < 0.2) {
    return "Optimal";
  }

  if (soilTempC >= crop.baseTempC - 2 && frostRisk < 0.35) {
    return "Borderline";
  }

  return "Wait";
}
