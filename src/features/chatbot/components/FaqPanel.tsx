import { useState } from 'react'
import { Button, FlexBox, Modal, ModalContainer, ModalContent, ModalContentItem, ModalHeading, TextArea, Typography, useToast } from '@wanteddev/wds'
import DataTable, { type DataTableColumn } from '../../../components/common/DataTable'
import ConfirmModal from '../../../components/common/ConfirmModal'
import RowMoreMenu from '../../../components/common/RowMoreMenu'
import FormItem from '../../../components/common/FormItem'
import { useChatbot } from '../store'
import { MAX_FAQ_COUNT, type FaqItem } from '../types'

function FaqPanel() {
  const { faqs, addFaq, updateFaq, deleteFaq } = useChatbot()
  const toast = useToast()
  const [deleteTarget, setDeleteTarget] = useState<FaqItem | null>(null)
  const [editingFaq, setEditingFaq] = useState<FaqItem | null | undefined>(undefined)
  const [question, setQuestion] = useState('')
  const [error, setError] = useState('')

  const sorted = [...faqs].sort((a, b) => a.order - b.order)

  const columns: DataTableColumn<FaqItem>[] = [
    { key: 'question', header: '질문', render: (row) => row.question },
    {
      key: 'actions',
      header: '',
      width: 56,
      align: 'right',
      render: (row) => <RowMoreMenu label={row.question} onEdit={() => { setEditingFaq(row); setQuestion(row.question); setError('') }} onDelete={() => setDeleteTarget(row)} />,
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
          onClick={() => { setEditingFaq(null); setQuestion(''); setError('') }}
        >
          + FAQ 추가
        </Button>
      </FlexBox>

      <DataTable columns={columns} rows={sorted} rowKey={(row) => row.id} emptyMessage="등록된 FAQ가 없어요." className="faq-table" />

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
      <Modal open={editingFaq !== undefined} onOpenChange={(open) => !open && setEditingFaq(undefined)}>
        <ModalContainer size="small"><ModalContent>
          <ModalContentItem><ModalHeading>{editingFaq ? 'FAQ 수정' : 'FAQ 추가'}</ModalHeading></ModalContentItem>
          <ModalContentItem><FormItem label="질문" error={error}><TextArea value={question} width="100%" minRows={1} maxRows={4} placeholder="자주 묻는 질문을 입력하세요" onChange={(event) => setQuestion(event.target.value)} /></FormItem></ModalContentItem>
          <ModalContentItem style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}><Button variant="outlined" color="assistive" onClick={() => setEditingFaq(undefined)}>취소</Button><Button variant="solid" color="primary" onClick={() => { if (!question.trim()) { setError('질문을 입력해주세요.'); return } if (editingFaq) updateFaq(editingFaq.id, { question: question.trim(), answer: editingFaq.answer }); else addFaq({ question: question.trim(), answer: '' }); toast({ content: editingFaq ? 'FAQ를 수정했어요.' : 'FAQ를 추가했어요.', variant: 'positive' }); setEditingFaq(undefined) }}>저장</Button></ModalContentItem>
        </ModalContent></ModalContainer>
      </Modal>
    </>
  )
}

export default FaqPanel
