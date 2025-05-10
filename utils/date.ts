/**
 * dateUtils.ts
 * Utilitários para trabalhar com timestamps e formatação de datas no padrão pt-BR,
 * agora com função de tempo relativo (e.g. "há 2 minutos").
 */

export interface FormatOptions {
  /** Incluir hora na saída (HH:mm:ss). Default: true */
  includeTime?: boolean;
  /** Localização para formatação. Default: 'pt-BR' */
  locale?: string;
  /** Opções adicionais para formatação de data (Intl.DateTimeFormatOptions) */
  dateOptions?: Intl.DateTimeFormatOptions;
  /** Opções adicionais para formatação de hora (Intl.DateTimeFormatOptions) */
  timeOptions?: Intl.DateTimeFormatOptions;
  /** Formato estendido da data (ex.: "25 de janeiro de 2025"). Default: false */
  extendedDate?: boolean;
  /** O pções adicionais para ocultar os segundos */
  hideSeconds?: boolean;
}

/**
 * Converte um valor em Date. Suporta strings no formato `YYYY-MM-DD HH:mm:ss.SSSSSS`,
 * Unix timestamp (ms) ou Date.
 */
export function parseTimestamp(ts: string | number | Date): Date {
  if (ts instanceof Date) {
    return ts;
  }
  if (typeof ts === 'number') {
    return new Date(ts);
  }
  // trata string: normaliza para ISO e ajusta milissegundos
  let iso = ts.replace(' ', 'T');
  iso = iso.replace(/(\.\d{3})\d+/, '$1');
  return new Date(iso);
}

/**
 * Formata um timestamp para string no padrão brasileiro.
 * @returns ex: "20/04/2025 04:29:22", "20/04/2025" ou "25 de janeiro de 2025"
 */
export function formatTimestamp(
  ts: string | number | Date,
  options: FormatOptions = {}
): string {
  const {
    includeTime = true,
    locale = 'pt-BR',
    dateOptions,
    timeOptions,
    extendedDate = false,
    hideSeconds = false,
  } = options;

  const date = parseTimestamp(ts);

  let datePart: string;
  if (extendedDate) {
    datePart = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } else {
    const baseDateOptions: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...(dateOptions || {}),
    };
    datePart = new Intl.DateTimeFormat(locale, baseDateOptions).format(date);
  }

  if (!includeTime) {
    return datePart;
  }

  const baseTimeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...(hideSeconds ? {} : { second: '2-digit' }),
    ...(timeOptions || {}),
  };
  const timePart = new Intl.DateTimeFormat(locale, baseTimeOptions).format(date);

  return `${datePart} ${timePart}`;
}

/**
 * Retorna uma string de tempo relativo em pt-BR, como:
 * "agora mesmo", "há 5 segundos", "há 3 minutos", "há 2 horas", "há 4 dias", "há 2 meses", "há 1 ano".
 * @param ts - timestamp (string, number ou Date)
 * @param locale - localidade para pluralização (default: 'pt-BR')
 */
export function relativeTime(
  ts: string | number | Date,
  locale: string = 'pt-BR'
): string {
  const now = new Date();
  const date = parseTimestamp(ts);
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);

  if (seconds < 5) {
    return 'agora mesmo';
  }
  if (seconds < 60) {
    return `há ${seconds} ${seconds === 1 ? 'segundo' : 'segundos'}`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `há ${days} ${days === 1 ? 'dia' : 'dias'}`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `há ${months} ${months === 1 ? 'mês' : 'meses'}`;
  }

  const years = Math.floor(months / 12);
  return `há ${years} ${years === 1 ? 'ano' : 'anos'}`;
}

// Exemplo de uso:
// import { formatTimestamp, relativeTime } from './dateUtils';
// console.log(relativeTime('2025-05-04T10:00:00')); // → "há X minutos"
// console.log(formatTimestamp('2025-05-04T10:00:00', { includeTime: false })); // → "04/05/2025"
// console.log(formatTimestamp('2025-05-04T10:00:00', { extendedDate: true })); // → "4 de maio de 2025"
// console.log(formatTimestamp('2025-05-04T10:00:00', { includeTime: true })); // → "04/05/2025 10:00:00"
// console.log(formatTimestamp('2025-05-04T10:00:00', { includeTime: true, dateOptions: { weekday: 'long' } })); // → "domingo, 04/05/2025 10:00:00"
// console.log(formatTimestamp('2025-05-04T10:00:00', { includeTime: true, timeOptions: { hour12: false } })); // → "04/05/2025 10:00:00"
