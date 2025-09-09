'use client';

import { useSearchParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { useTranslate } from 'src/locales';

import Scrollbar from 'src/components/scrollbar';

import useTable from './use-table';
import { SharedTablePropsFag } from './types';
import TableHeadCustomFaq from './table-head-custom-faq';
import SharedTableRowFaq from './SharedTableRowFaq';
import TableNoDataFaq from './table-no-data-faq';
import TablePaginationCustomFaq from './table-pagination-custom-faq';
// ----------------------------------------------------------------------
export default function SharedTableFaq<T extends { id: string }>({
  data,
  meta,
  actions,
  tableHead,
  disablePagination,
  customRender,
  count,
  headColor,
}: SharedTablePropsFag<T>) {
  const table = useTable();
  const searchParams = useSearchParams();
  const { t } = useTranslate();

  const hasPage = searchParams.get('page');
  const hasLimit = searchParams.get('limit');

  const page = hasPage ? Number(searchParams.get('page')) - 1 : 0;
  const limit =  10;
  return (
    <Box>
      <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
        <Scrollbar>
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 400 }}>
            <TableHeadCustomFaq headLabel={tableHead}headColor={headColor} />

            <TableBody>
              {data && data?.map((row) => (
                <SharedTableRowFaq<T>
                  key={row.id}
                  row={row}
                  actions={actions}
                  customRender={customRender}
                  headIds={
                    tableHead
                      .map((x) => x.id)
                      .filter((x) => x !== '' && x !== 'rowsActions') as (keyof T)[]
                  }
                />
              ))}

              <TableNoDataFaq notFound={data.length === 0} />
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>

      {!disablePagination && (
        <TablePaginationCustomFaq
           count={meta.itemCount}
           page={meta.page - 1}
          rowsPerPage={limit}
          onPageChange={table.onChangePage!}
          onRowsPerPageChange={table.onChangeRowsPerPage!}
          labelRowsPerPage={t('TABLE.ROWS_PER_PAGE')}
          labelDisplayedRows={({ from, to, count: rows }) =>
            `${from}-${to} ${t('TABLE.OF')} ${rows !== -1 ? rows : `${t('TABLE.MORE_THAN')} ${to}`}`
          }
          //
          dense={table.dense!}
          onChangeDense={table.onChangeDense!}
        />
      )}
    </Box>
  );
}
