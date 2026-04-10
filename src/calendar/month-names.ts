export interface HpcMonthInfo {
  number: number;
  name: string;
  alternateName?: string;
  hebrewOrigin: boolean;
  isThreshold: boolean;
}

export const HPC_MONTHS: HpcMonthInfo[] = [
  { number: 1,  name: "Abib",          hebrewOrigin: true, isThreshold: false },
  { number: 2,  name: "Ziv",           hebrewOrigin: true, isThreshold: false },
  { number: 3,  name: "Sivan",         hebrewOrigin: true, isThreshold: false },
  { number: 4,  name: "Revi'i",        hebrewOrigin: true, isThreshold: false },
  { number: 5,  name: "Av",            hebrewOrigin: true, isThreshold: false },
  { number: 6,  name: "Elul",          hebrewOrigin: true, isThreshold: false },
  { number: 7,  name: "Ethanim",       hebrewOrigin: true, isThreshold: false },
  { number: 8,  name: "Bul",           hebrewOrigin: true, isThreshold: false },
  { number: 9,  name: "Kislev",        hebrewOrigin: true, isThreshold: false },
  { number: 10, name: "Tevet",         hebrewOrigin: true, isThreshold: false },
  { number: 11, name: "Shevat",        hebrewOrigin: true, isThreshold: false },
  { number: 12, name: "Adar",          hebrewOrigin: true, isThreshold: false },
  { number: 13, name: "Adar II", alternateName: "Telma", hebrewOrigin: true, isThreshold: true }
];

export function getMonthName(month: number): string {
  const info = HPC_MONTHS.find(m => m.number === month);
  if (!info) throw new Error(`Invalid HPC month: ${month}`);
  return info.name;
}

export function getMonthFullName(month: number): string {
  const info = HPC_MONTHS.find(m => m.number === month);
  if (!info) throw new Error(`Invalid HPC month: ${month}`);
  if (info.alternateName) return `${info.name} / ${info.alternateName}`;
  return info.name;
}

export function getMonthInfo(month: number): HpcMonthInfo {
  const info = HPC_MONTHS.find(m => m.number === month);
  if (!info) throw new Error(`Invalid HPC month: ${month}`);
  return info;
}