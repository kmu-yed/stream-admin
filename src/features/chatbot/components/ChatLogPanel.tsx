import { useState } from 'react'
import { FlexBox, SegmentedControl, SegmentedControlItem, Typography } from '@wanteddev/wds'
import DataTable, { type DataTableColumn } from '../../../components/common/DataTable'
import SearchField from '../../../components/common/SearchField'
import StatusBadge, { type BadgeTone } from '../../../components/common/StatusBadge'
import { useChatbot } from '../store'
import type { ChatLog, ChatLogFlag } from '../types'

type Filter = 'all' | ChatLogFlag

const flagTone: Record<ChatLogFlag, BadgeTone> = {
  정상: 'neutral',
  미해결: 'cautionary',
}

function ChatLogPanel() {
  const { logs } = useChatbot()
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  const filtered = logs.filter((log) => {
    if (filter !== 'all' && log.flag !== filter) return false
    const keyword = search.trim()
    if (!keyword) return true
    return log.question.includes(keyword) || log.studentName.includes(keyword)
  })

  const columns: DataTableColumn<ChatLog>[] = [
    {
      key: 'question',
      header: '질문',
      render: (row) => (
        <FlexBox flexDirection="column" style={{ gap: 2 }}>
          <Typography variant="body1" weight="medium">
            {row.question}
          </Typography>
          <Typography variant="caption1" color="semantic.label.alternative">
            {row.answer}
          </Typography>
        </FlexBox>
      ),
    },
    { key: 'studentName', header: '질문자', width: 100, render: (row) => row.studentName },
    { key: 'askedAt', header: '문의일시', width: 160, render: (row) => row.askedAt },
    {
      key: 'flag',
      header: '플래그',
      width: 100,
      render: (row) => <StatusBadge label={row.flag} tone={flagTone[row.flag]} />,
    },
  ]

  return (
    <>
      <FlexBox justifyContent="space-between" alignItems="center" style={{ marginBottom: 16, gap: 12 }}>
        <SegmentedControl value={filter} onValueChange={(v) => setFilter(v as Filter)} size="small" style={{ width: 360 }}>
          <SegmentedControlItem value="all">전체</SegmentedControlItem>
          <SegmentedControlItem value="정상">정상</SegmentedControlItem>
          <SegmentedControlItem value="미해결">미해결</SegmentedControlItem>
        </SegmentedControl>
        <SearchField value={search} onChange={setSearch} placeholder="질문 내용 또는 질문자 검색" />
      </FlexBox>

      <DataTable columns={columns} rows={filtered} rowKey={(row) => row.id} emptyMessage="문의 기록이 없어요." />
    </>
  )
}

export default ChatLogPanel
