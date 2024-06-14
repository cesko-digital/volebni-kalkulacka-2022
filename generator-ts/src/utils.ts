import { GoogleSpreadsheetRow } from 'google-spreadsheet';

export function isEmptyValue(val: string | undefined): boolean {
  return (val || '').length === 0;
}

export function isEmptyColumn<T>(
  row: GoogleSpreadsheetRow<T>,
  key: keyof T,
): boolean {
  const isEmpty = isEmptyValue(row.get(key));

  if (isEmpty) {
    console.warn(`${row.rowNumber} has empty column ${new String(key)}`);
  }

  return isEmpty;
}
