export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export function normalizeDate(date: Date | string): Date {
  let d: Date;
  
  if (typeof date === 'string') {
    // Parse ISO date string (YYYY-MM-DD) sem problemas de timezone
    const [year, month, day] = date.split('-').map(Number);
    d = new Date(year, month - 1, day);
  } else {
    // Se já é Date, primeiro converte para string ISO para evitar timezone issues
    const isoString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const [year, month, day] = isoString.split('-').map(Number);
    d = new Date(year, month - 1, day);
  }
  
  d.setHours(0, 0, 0, 0);
  return d;
}

export function hasDateConflict(
  newStart: Date | string,
  newEnd: Date | string,
  existingStart: Date | string,
  existingEnd: Date | string,
): boolean {
  const normNewStart = normalizeDate(newStart);
  const normNewEnd = normalizeDate(newEnd);
  const normExistingStart = normalizeDate(existingStart);
  const normExistingEnd = normalizeDate(existingEnd);

  return normNewStart <= normExistingEnd && normNewEnd >= normExistingStart;
}

export function validateDateRange(startDate: Date | string, endDate: Date | string): void {
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);

  if (end <= start) {
    throw new Error('Data de devolução deve ser posterior à data de retirada');
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (start < now) {
    throw new Error('Data de retirada não pode ser no passado');
  }
}

export function getDateRangeString(startDate: Date, endDate: Date): string {
  return `${startDate.toISOString().split('T')[0]} até ${endDate.toISOString().split('T')[0]}`;
}
