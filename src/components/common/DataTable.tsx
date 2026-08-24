import type { ReactNode } from 'react'
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
  header: string
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
}

function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = '데이터가 없어요.',
  pagination,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <Table
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
          {columns.map((column) => (
            <TableHeadCell
              key={column.key}
              align={column.align ?? 'left'}
              style={{ width: column.width }}
            >
              {column.header}
            </TableHeadCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} align="center" style={{ padding: '48px 0' }}>
              <Typography variant="body2" color="semantic.label.alternative">
                {emptyMessage}
              </Typography>
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => (
            <TableRow
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              style={onRowClick ? { cursor: 'pointer' } : undefined}
            >
              {columns.map((column) => (
                <TableCell key={column.key} align={column.align ?? 'left'}>
                  {column.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

export default DataTable
