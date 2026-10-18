import { Fragment, isValidElement, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from '@wanteddev/wds'
import TablePagination, { type TablePaginationProps } from './TablePagination'
import EmptyState from './EmptyState'

export const DEFAULT_TABLE_PAGE_SIZE = 10

export type DataTableColumn<T> = {
  key: string
  header: ReactNode
  width?: string | number
  align?: 'left' | 'center' | 'right'
  render: (row: T) => ReactNode
}

function getNodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(getNodeText).join('')
  if (!isValidElement(node)) return ''
  const props = node.props as { children?: ReactNode; label?: string; 'aria-label'?: string }
  return props.label ?? props.children ? getNodeText(props.label ?? props.children) : props['aria-label'] ?? ''
}

type DataTableProps<T> = {
  columns: DataTableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  emptyMessage?: string
  emptyDescription?: string
  pagination?: TablePaginationProps
  onRowClick?: (row: T) => void
  style?: CSSProperties
  className?: string
  rowNumberPosition?: 'first' | 'after-first-column'
  showRowNumber?: boolean
  minWidth?: number | string
  pageSize?: number
}

function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = '데이터가 없어요.',
  emptyDescription,
  pagination,
  onRowClick,
  style,
  className,
  rowNumberPosition = 'first',
  showRowNumber = true,
  minWidth,
  pageSize = DEFAULT_TABLE_PAGE_SIZE,
}: DataTableProps<T>) {
  // 선택 체크박스가 있는 표는 항상 선택 열 다음에 NO가 오도록 고정한다.
  const numberAfterFirstColumn = columns[0]?.key === 'select' || rowNumberPosition === 'after-first-column'
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(rows.length / pageSize)
  const currentPage = Math.min(page, Math.max(totalPages, 1))
  const visibleRows = pagination ? rows : rows.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const effectivePagination = pagination ?? { page: currentPage, totalPages, onChange: (nextPage?: number) => setPage(nextPage ?? 1) }
  const rowOffset = (effectivePagination.page - 1) * pageSize
  // 필터링 후에도 열 위치가 바뀌지 않도록, 화면에 한 번 나타난 가장 긴 내용을 기준으로 열 너비를 유지한다.
  const widestColumnWidths = useRef<Record<string, number>>({})
  const columnWidths = useMemo(() => columns.map((column) => {
    if (column.width !== undefined) return column.width
    const longestText = Math.max(
      getNodeText(column.header).length,
      ...rows.map((row) => getNodeText(column.render(row)).length),
    )
    const measuredWidth = Math.max(96, Math.min(360, longestText * 15 + 40))
    widestColumnWidths.current[column.key] = Math.max(widestColumnWidths.current[column.key] ?? 0, measuredWidth)
    return widestColumnWidths.current[column.key]
  }), [columns, rows])
  const calculatedMinWidth = (showRowNumber ? 56 : 0) + columnWidths.reduce<number>((total, width) => {
    if (typeof width === 'number') return total + width
    const pixelWidth = Number.parseFloat(width)
    return total + (Number.isFinite(pixelWidth) && width.endsWith('px') ? pixelWidth : 120)
  }, 0)
  const tableMinWidth = typeof minWidth === 'number'
    ? Math.max(minWidth, calculatedMinWidth)
    : minWidth ?? calculatedMinWidth
  return (
    <div
      className={`data-table-scroll${className ? ` ${className}` : ''}`}
      style={{ ...style, '--app-data-table-min-width': typeof tableMinWidth === 'number' ? `${tableMinWidth}px` : tableMinWidth } as CSSProperties}
    >
      <Table className="data-table">
        <TableHead>
          <TableRow>
            {showRowNumber && !numberAfterFirstColumn && <TableHeadCell align="center" style={{ width: 56, paddingLeft: 8, paddingRight: 8 }}>NO</TableHeadCell>}
            {columns.map((column, index) => (
              <Fragment key={column.key}>
                <TableHeadCell align={column.align ?? 'left'} style={{ width: columnWidths[index] }}>{column.header}</TableHeadCell>
                {showRowNumber && numberAfterFirstColumn && column === columns[0] && <TableHeadCell align="center" style={{ width: 56, paddingLeft: 8, paddingRight: 8 }}>NO</TableHeadCell>}
              </Fragment>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {visibleRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (showRowNumber ? 1 : 0)} align="center" style={{ padding: 0 }}>
                <EmptyState message={emptyMessage} description={emptyDescription} variant="table" />
              </TableCell>
            </TableRow>
          ) : (
            visibleRows.map((row, index) => (
              <TableRow
                key={rowKey(row)}
                interaction={Boolean(onRowClick)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={onRowClick ? (event) => {
                  if (event.target !== event.currentTarget) return
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onRowClick(row)
                  }
                } : undefined}
                style={onRowClick ? { cursor: 'pointer' } : undefined}
              >
                {showRowNumber && !numberAfterFirstColumn && <TableCell align="center" style={{ paddingLeft: 8, paddingRight: 8 }}>{rowOffset + index + 1}</TableCell>}
                {columns.map((column, columnIndex) => (
                  <Fragment key={column.key}>
                    <TableCell align={column.align ?? 'left'} style={{ width: columnWidths[columnIndex] }}>{column.render(row)}</TableCell>
                    {showRowNumber && numberAfterFirstColumn && column === columns[0] && <TableCell align="center" style={{ paddingLeft: 8, paddingRight: 8 }}>{rowOffset + index + 1}</TableCell>}
                  </Fragment>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <TablePagination {...effectivePagination} />
    </div>
  )
}

export default DataTable
