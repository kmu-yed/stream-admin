import { FlexBox, Pagination } from '@wanteddev/wds'

export type TablePaginationProps = {
  page: number
  totalPages: number
  onChange: (page?: number) => void
}

function TablePagination({ page, totalPages, onChange }: TablePaginationProps) {
  if (totalPages <= 1) return null

  return (
    <FlexBox justifyContent="center" style={{ marginTop: 16 }}>
      <Pagination page={page} totalPages={totalPages} onChange={onChange} />
    </FlexBox>
  )
}

export default TablePagination
