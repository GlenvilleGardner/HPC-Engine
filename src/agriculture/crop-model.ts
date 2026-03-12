export interface CropModel {
  baseTempC: number;
  gddMaturity: number;
}

export function cropProgress(
  accumulatedGdd: number,
  crop: CropModel
): number {
  return Math.max(0, Math.min(1, accumulatedGdd / crop.gddMaturity));
}
