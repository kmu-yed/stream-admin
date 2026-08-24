import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, FlexBox, Typography } from '@wanteddev/wds'
import DataTable, { type DataTableColumn } from '../../../components/common/DataTable'
import ConfirmModal from '../../../components/common/ConfirmModal'
import RowActionButton from '../../../components/common/RowActionButton'
import { useChatbot } from '../store'
import { MAX_FAQ_COUNT, type FaqItem } from '../types'

function FaqPanel() {
  const navigate = useNavigate()
  const { faqs, deleteFaq } = useChatbot()
  const [deleteTarget, setDeleteTarget] = useState<FaqItem | null>(null)

  const sorted = [...faqs].sort((a, b) => a.order - b.order)

  const columns: DataTableColumn<FaqItem>[] = [
    { key: 'order', header: '', width: 40, render: (row) => sorted.findIndex((f) => f.id === row.id) + 1 },
    { key: 'question', header: '질문', render: (row) => row.question },
    {
      key: 'answer',
      header: '답변',
      render: (row) => (
        <Typography variant="body2" color="semantic.label.alternative">
          {row.answer}
        </Typography>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: 140,
      align: 'right',
      render: (row) => (
        <FlexBox alignItems="center" justifyContent="flex-end" style={{ gap: 16 }}>
          <RowActionButton onClick={() => navigate(`/chatbot/faq/${row.id}/edit`)}>수정</RowActionButton>
          <RowActionButton danger onClick={() => setDeleteTarget(row)}>
            삭제
          </RowActionButton>
        </FlexBox>
      ),
    },
  ]

  return (
    <>
      <FlexBox justifyContent="space-between" alignItems="center" style={{ marginBottom: 16 }}>
        <Typography variant="body2" color="semantic.label.alternative">
          최대 {MAX_FAQ_COUNT}개까지 등록할 수 있어요. ({faqs.length}/{MAX_FAQ_COUNT})
        </Typography>
        <Button
          variant="solid"
          color="primary"
          disabled={faqs.length >= MAX_FAQ_COUNT}
          onClick={() => navigate('/chatbot/faq/new')}
        >
          + FAQ 추가
        </Button>
      </FlexBox>

      <DataTable columns={columns} rows={sorted} rowKey={(row) => row.id} emptyMessage="등록된 FAQ가 없어요." />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="FAQ를 삭제할까요?"
        description={deleteTarget ? `"${deleteTarget.question}" 항목을 삭제해요.` : undefined}
        confirmLabel="삭제"
        tone="negative"
        onConfirm={() => {
          if (deleteTarget) deleteFaq(deleteTarget.id)
        }}
      />
    </>
  )
}

export default FaqPanel
