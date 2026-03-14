import { gregorianToHpc, hpcToGregorian } from "../calendar/convert";

export interface GregorianToHpcRequest {
  isoDate: string;
  latitude: number;
  longitude: number;
}

export interface GregorianToHpcResponse {
  inputIsoDate: string;
  hpcYear: number | null;
  hpcMonth: number | null;
  hpcDay: number | null;
  weekday: string | null;
  gregorianReferenceLabel: string | null;
}

export interface HpcToGregorianRequest {
  hpcYear: number;
  hpcMonth: number;
  hpcDay: number;
  latitude: number;
  longitude: number;
}

export interface HpcToGregorianResponse {
  hpcYear: number;
  hpcMonth: number;
  hpcDay: number;
  gregorianIsoDate: string;
}

export async function convertGregorianToHpc(
  request: GregorianToHpcRequest
): Promise<GregorianToHpcResponse> {
  const target = new Date(request.isoDate);

  const result = await gregorianToHpc(target, {
    latitude: request.latitude,
    longitude: request.longitude
  });

  return {
    inputIsoDate: request.isoDate,
    hpcYear: result.hpcYear ?? null,
    hpcMonth: result.hpcMonth ?? null,
    hpcDay: result.hpcDay ?? null,
    weekday: result.weekday ?? null,
    gregorianReferenceLabel: result.gregorianReferenceLabel ?? null
  };
}

export async function convertHpcToGregorian(
  request: HpcToGregorianRequest
): Promise<HpcToGregorianResponse> {
  const result = await hpcToGregorian(
    request.hpcYear,
    request.hpcMonth,
    request.hpcDay,
    {
      latitude: request.latitude,
      longitude: request.longitude
    }
  );

  return {
    hpcYear: request.hpcYear,
    hpcMonth: request.hpcMonth,
    hpcDay: request.hpcDay,
    gregorianIsoDate: result.toISOString()
  };
}
