import { ReactNode } from 'react';

import { SxProps, Theme } from '@mui/material';

export enum cellAlignment {
  left = 'left',
  center = 'center',
  right = 'right',
}

export type headCellType = {
  id: string;
  align?: cellAlignment;
  label?: string;
  width?: number;
};
export type Action<T> = {
  label: string;
  icon?: string;
  sx?: SxStyle;
  onClick: (row: T) => void;
  hide?: (row: T) => Boolean;
  /** When true, a horizontal rule is rendered above this item (e.g. before destructive actions). */
  dividerBefore?: boolean;
};
export interface SharedTableProps<T> {
  tableHead: headCellType[];
  data: T[];
  // meta:{itemCount: number,page: number, limit: number, take: number};
  actions?: Action<T>[];
  disablePagination?: boolean;
  customRender?: Partial<Record<keyof T, (row: T) => ReactNode>>;
  count: number;
  headColor?: string;
}
export interface SharedTableRowProps<T> {
  row: T;
  actions?: Action<T>[];
  customRender?: Partial<Record<keyof T, (row: T) => ReactNode>>;
  headIds: (keyof T)[];
  /** Per-column alignment lookup (by column id). Defaults to left when not provided. */
  headAligns?: Partial<Record<keyof T, cellAlignment>>;
}
export type SxStyle = SxProps<Theme>;

// ----------------------------------------------------------------------

export type TableProps = {
  dense: boolean;
  //
  selected: string[];
  onSelectRow: (id: string) => void;
  onSelectAllRows: (checked: boolean, newSelecteds: string[]) => void;
  //
  onChangePage: (event: unknown, newPage: number) => void;
  onChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeDense: (event: React.ChangeEvent<HTMLInputElement>) => void;
  //
  setDense: React.Dispatch<React.SetStateAction<boolean>>;
};
