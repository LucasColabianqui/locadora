/**
 * Normaliza datas do input date HTML (YYYY-MM-DD) sem problemas de timezone
 * Usa local time em vez de UTC para evitar deslocamento de um dia
 */
export function parseLocalDate(dateString: string | Date): Date {
  let d: Date;
  
  if (typeof dateString === 'string') {
    // Se é timestamp ISO completo (2026-03-18T00:00:00.000Z)
    if (dateString.includes('T')) {
      // Extrair apenas a data (YYYY-MM-DD)
      const dateOnly = dateString.split('T')[0];
      const [year, month, day] = dateOnly.split('-').map(Number);
      d = new Date(year, month - 1, day);
    } else {
      // Parse ISO date string (YYYY-MM-DD) em local time
      const [year, month, day] = dateString.split('-').map(Number);
      d = new Date(year, month - 1, day);
    }
  } else {
    d = new Date(dateString);
  }
  
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Valida se a data final é após a data inicial
 */
export function isValidDateRange(start: string, end: string): boolean {
  const startDate = parseLocalDate(start);
  const endDate = parseLocalDate(end);
  return endDate > startDate;
}

/**
 * Calcula o número de dias entre duas datas
 * Retorna mínimo 1 dia (mesmo que seja no mesmo dia)
 */
export function getDaysDifference(start: string | Date, end: string | Date): number {
  const startDate = parseLocalDate(start);
  const endDate = parseLocalDate(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, days); // Mínimo 1 dia
}

/**
 * Verifica se a data é no passado
 */
export function isInPast(dateString: string): boolean {
  const date = parseLocalDate(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Formata data para display (DD/MM/YYYY)
 * Aceita: data ISO (YYYY-MM-DD), timestamp ISO completo, ou objeto Date
 */
export function formatDateBR(dateString: string | Date): string {
  let d: Date;
  
  if (typeof dateString === 'string') {
    // Se é timestamp ISO completo (2026-03-18T00:00:00.000Z)
    if (dateString.includes('T')) {
      d = new Date(dateString);
      // Converter para local time para evitar timezone issues
      const isoString = d.toISOString().split('T')[0]; // YYYY-MM-DD
      const [year, month, day] = isoString.split('-').map(Number);
      d = new Date(year, month - 1, day);
    } else {
      // Se é data simples (YYYY-MM-DD)
      d = parseLocalDate(dateString);
    }
  } else {
    d = parseLocalDate(dateString);
  }
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
