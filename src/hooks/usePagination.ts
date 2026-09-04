/**
 *  usePagination.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useEffect, useState } from 'react';
import { SETTINGS } from '../types/constants';

export function usePagination<T>(rows: T[]) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(SETTINGS.itemsPerPage);

  // A filter must not leave the table on a page that no longer exists.
  useEffect(() => {
    setPage(0);
  }, [rows]);

  const changeRowsPerPage = (value: number) => {
    setRowsPerPage(value);
    setPage(0);
  };

  return {
    page,
    rowsPerPage,
    setPage,
    changeRowsPerPage,
    paginatedRows: rows.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    ),
  };
}
