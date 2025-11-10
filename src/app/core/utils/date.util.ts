export function parseTimeOfDay(time: string): { hours: number; minutes: number } {
  const m = /^(\d{2}):(\d{2})$/.exec(time.trim());
  if (!m) throw new Error(`Invalid timeOfDay: ${time}`);
  const hours = Number(m[1]);
  const minutes = Number(m[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid timeOfDay values: ${time}`);
  }
  return { hours, minutes };
}

export function toIso(d: Date): string {
  return new Date(d.getTime()).toISOString();
}

export function fromIso(iso: string): Date {
  return new Date(iso);
}

