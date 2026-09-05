/**
 *  usePagination.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useState } from 'react';
import { SETTINGS } from '../types/constants';

export function usePagination<T>(rows: T[]) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(SETTINGS.itemsPerPage);

  const pageCount = Math.max(1, Math.ceil(rows.length / rowsPerPage));
  const safePage = Math.min(page, pageCount - 1);

  const changeRowsPerPage = (value: number) => {
    setRowsPerPage(value);
    setPage(0);
  };

  return {
    page: safePage,
    rowsPerPage,
    pageCount,
    setPage,
    changeRowsPerPage,
    paginatedRows: rows.slice(
      safePage * rowsPerPage,
      safePage * rowsPerPage + rowsPerPage,
    ),
  };
}
