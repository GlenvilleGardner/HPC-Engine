export function parseNumber(value: unknown, name: string): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid ${name}`);
  }

  return parsed;
}

export function parseString(value: unknown, name: string): string {
  const parsed = String(value ?? "").trim();

  if (!parsed) {
    throw new Error(`Missing ${name}`);
  }

  return parsed;
}
