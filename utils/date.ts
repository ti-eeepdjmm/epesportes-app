/**
 * dateUtils.ts
 * Utilitários para trabalhar com timestamps e formatação de datas no padrão pt-BR
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
  }
  
  /**
   * Converte um valor em Date. Suporta strings no formato `YYYY-MM-DD HH:mm:ss.SSSSSS`, Unix timestamp (ms) ou Date.
   * @param ts - timestamp a ser convertido
   */
  export function parseTimestamp(
    ts: string | number | Date
  ): Date {
    if (ts instanceof Date) {
      return ts;
    }
    if (typeof ts === 'number') {
      return new Date(ts);
    }
    // trata string: normaliza para ISO e ajusta milissegundos
    let iso = ts.replace(' ', 'T');
    // mantém 3 dígitos de milissegundos
    iso = iso.replace(/(\.\d{3})\d+/, '$1');
    // não adicionamos 'Z' para manter horário local
    return new Date(iso);
  }
  
  /**
   * Formata um timestamp para string no padrão brasileiro.
   * @param ts - timestamp (string, number ou Date)
   * @param options - opções de formatação
   * @returns string formatada ex: "20/04/2025 04:29:22", "20/04/2025" ou "25 de janeiro de 2025"
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
    } = options;
  
    const date = parseTimestamp(ts);
  
    let datePart: string;
    if (extendedDate) {
      // ex: "25 de janeiro de 2025"
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
      second: '2-digit',
      ...(timeOptions || {}),
    };
    const timePart = new Intl.DateTimeFormat(locale, baseTimeOptions).format(date);
  
    return `${datePart} ${timePart}`;
  }
  
  // Exemplos de uso:
  // import { formatTimestamp } from './dateUtils';
  //
  // console.log(formatTimestamp('2025-04-20 04:29:22.288343'));
  // // → "20/04/2025 04:29:22"
  //
  // console.log(
  //   formatTimestamp('2025-04-20 04:29:22.288343', { includeTime: false })
  // );
  // // → "20/04/2025"
  //
  // console.log(
  //   formatTimestamp('2025-01-25 10:15:00.000000', { extendedDate: true })
  // );
  // // → "25 de janeiro de 2025"
  //
  // console.log(
  //   formatTimestamp('2025-01-25 10:15:00.000000', { extendedDate: true, includeTime: true })
  // );
  // // → "25 de janeiro de 2025 10:15:00"
  