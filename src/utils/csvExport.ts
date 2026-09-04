/**
 *  csvExport.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
export type CsvValue = string | number | null | undefined;

// Excel and Sheets execute a cell opening with one of these.
const FORMULA_PREFIX = /^[=+\-@\t\r]/;

// RFC 4180: quote a field holding a delimiter, a quote, or a line break.
const NEEDS_QUOTING = /[",\r\n]/;

const escapeField = (field: CsvValue): string => {
  if (field === null || field === undefined) return '';

  const value =
    typeof field === 'string' && FORMULA_PREFIX.test(field)
      ? `'${field}`
      : String(field);

  return NEEDS_QUOTING.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
};

export const toCsv = (headers: string[], rows: CsvValue[][]): string =>
  [headers, ...rows].map((row) => row.map(escapeField).join(',')).join('\n');

export interface CsvSection {
  title: string;
  headers: string[];
  rows: CsvValue[][];
}

// One sheet, several labelled blocks separated by a blank line.
export const toCsvSections = (sections: CsvSection[]): string =>
  sections
    .map(
      ({ title, headers, rows }) =>
        `${escapeField(title)}\n${toCsv(headers, rows)}`,
    )
    .join('\n\n');

// A BOM makes Excel detect UTF-8 instead of garbling accented names.
const UTF8_BOM = '\ufeff';

const triggerDownload = (filename: string, csv: string): void => {
  const blob = new Blob([UTF8_BOM + csv], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);

  try {
    anchor.click();
  } finally {
    anchor.remove();
    URL.revokeObjectURL(url);
  }
};

export const downloadCsv = (
  filename: string,
  headers: string[],
  rows: CsvValue[][],
): void => triggerDownload(filename, toCsv(headers, rows));

export const downloadCsvSections = (
  filename: string,
  sections: CsvSection[],
): void => triggerDownload(filename, toCsvSections(sections));
