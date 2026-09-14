/**
 *  usePagination.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useEffect, useState } from 'react';

export function usePagination<T>(rows: T[], initialRowsPerPage: number) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const pageCount = Math.max(1, Math.ceil(rows.length / rowsPerPage));
  const safePage = Math.min(page, pageCount - 1);

  useEffect(() => {
    if (safePage !== page) setPage(safePage);
  }, [safePage, page]);

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
