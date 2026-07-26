export function parseDate(
  date: string | null | undefined,
  formatV1?: string | null,
): Date | null {
  if (date == null || date === '') {
    return null;
  }

  if (date.includes('T')) {
    const dt = new Date(date);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  if (formatV1 === 'Y-m-d H:i:s.u') {
    const match = date.match(
      /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/,
    );
    if (!match) {
      return null;
    }
    const [, y, m, d, hh, mm, ss, frac] = match;
    const ms = frac ? Number(frac.padEnd(3, '0').slice(0, 3)) : 0;
    const asUtc = Date.UTC(
      Number(y),
      Number(m) - 1,
      Number(d),
      Number(hh) - 7,
      Number(mm),
      Number(ss),
      ms,
    );
    const dt = new Date(asUtc);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  const dt = new Date(date);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export function toAtomUtc(date: Date | null): string | null {
  if (!date) {
    return null;
  }
  return date.toISOString();
}
