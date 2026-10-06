import { Fragment, type CSSProperties, type ReactNode } from 'react'
import {
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Typography,
} from '@wanteddev/wds'

export type DataTableColumn<T> = {
  key: string
  header: ReactNode
  width?: string | number
  align?: 'left' | 'center' | 'right'
  render: (row: T) => ReactNode
}

type DataTablePagination = {
  page: number
  totalPages: number
  onChange: (page?: number) => void
}

type DataTableProps<T> = {
  columns: DataTableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  emptyMessage?: string
  pagination?: DataTablePagination
  onRowClick?: (row: T) => void
  style?: CSSProperties
  className?: string
  rowNumberPosition?: 'first' | 'after-first-column'
}

function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = '데이터가 없어요.',
  pagination,
  onRowClick,
  style,
  className,
  rowNumberPosition = 'first',
}: DataTableProps<T>) {
  // 선택 체크박스가 있는 표는 항상 선택 열 다음에 NO가 오도록 고정한다.
  const numberAfterFirstColumn = columns[0]?.key === 'select' || rowNumberPosition === 'after-first-column'
  return (
    <div className={`data-table-scroll${className ? ` ${className}` : ''}`} style={style}>
      <Table
        className="data-table"
        pagination={
          pagination && pagination.totalPages > 1 ? (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onChange={pagination.onChange}
            />
          ) : undefined
        }
      >
        <TableHead>
          <TableRow>
            {!numberAfterFirstColumn && <TableHeadCell align="center" style={{ width: 56, paddingLeft: 8, paddingRight: 8 }}>NO</TableHeadCell>}
            {columns.map((column) => (
              <Fragment key={column.key}>
                <TableHeadCell align={column.align ?? 'left'} style={{ width: column.width }}>{column.header}</TableHeadCell>
                {numberAfterFirstColumn && column === columns[0] && <TableHeadCell align="center" style={{ width: 56, paddingLeft: 8, paddingRight: 8 }}>NO</TableHeadCell>}
              </Fragment>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + 1} align="center" style={{ padding: '48px 0' }}>
                <Typography variant="body2" color="semantic.label.alternative">
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={onRowClick ? { cursor: 'pointer' } : undefined}
              >
                {!numberAfterFirstColumn && <TableCell align="center" style={{ paddingLeft: 8, paddingRight: 8 }}>{index + 1}</TableCell>}
                {columns.map((column) => (
                  <Fragment key={column.key}>
                    <TableCell align={column.align ?? 'left'}>{column.render(row)}</TableCell>
                    {numberAfterFirstColumn && column === columns[0] && <TableCell align="center" style={{ paddingLeft: 8, paddingRight: 8 }}>{index + 1}</TableCell>}
                  </Fragment>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default DataTable
