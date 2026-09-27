import { useState } from 'react'
import { Button, FlexBox, TextArea, Typography, useToast } from '@wanteddev/wds'
import PageHeader from '../../components/common/PageHeader'
import FormItem from '../../components/common/FormItem'
import ConfirmModal from '../../components/common/ConfirmModal'
import { usePolicies } from './store'
import type { PolicyDocId } from './types'

function DocumentEditor({ docId }: { docId: PolicyDocId }) {
  const { documents, updateDocument } = usePolicies()
  const toast = useToast()
  const doc = documents.find((d) => d.id === docId)!
  const [content, setContent] = useState(doc.content)
  const [editing, setEditing] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const dirty = content !== doc.content

  const handleCancelEdit = () => {
    setContent(doc.content)
    setEditing(false)
  }

  const handleSave = () => {
    updateDocument(docId, content)
    setEditing(false)
    toast({ content: `${doc.title}이(가) 저장되었어요.`, variant: 'positive' })
  }

  return (
    <FlexBox flexDirection="column" style={{ maxWidth: 720 }}>
      <Typography variant="caption1" color="semantic.label.alternative" style={{ marginBottom: 12 }}>
        최종 수정일: {doc.updatedAt}
      </Typography>
      <FormItem label={doc.title}>
        <TextArea
          value={content}
          width="100%"
          minRows={16}
          disabled={!editing}
          onChange={(e) => setContent(e.target.value)}
        />
      </FormItem>
      <FlexBox style={{ marginTop: 16, gap: 8, justifyContent: 'flex-end' }}>
        {editing ? (
          <>
            <Button variant="outlined" color="assistive" onClick={handleCancelEdit}>
              취소
            </Button>
            <Button variant="solid" color="primary" disabled={!dirty} onClick={() => setConfirmOpen(true)}>
              저장하기
            </Button>
          </>
        ) : (
          <Button variant="solid" color="primary" onClick={() => setEditing(true)}>
            수정하기
          </Button>
        )}
      </FlexBox>

      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="변경 내용을 저장할까요?"
        description={`${doc.title} 내용을 저장하면 바로 반영돼요.`}
        confirmLabel="저장"
        onConfirm={handleSave}
      />
    </FlexBox>
  )
}

function PoliciesPage() {
  return (
    <>
      <PageHeader title="개인정보 처리방침 관리" description="개인정보 처리방침 내용을 수정해요." />
      <DocumentEditor docId="privacy" />
    </>
  )
}

export default PoliciesPage
