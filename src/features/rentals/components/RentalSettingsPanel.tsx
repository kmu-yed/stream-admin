import { useState } from 'react'
import { Button, DatePicker, FlexBox, Modal, ModalContainer, ModalContent, ModalContentItem, ModalHeading, Typography, useToast, type DateType } from '@wanteddev/wds'
import FormItem from '../../../components/common/FormItem'
import FormSection from '../../../components/common/FormSection'

function toDateValue(value: DateType) { if (!value) return ''; if (typeof value === 'string') return value.slice(0, 10); return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}` }

function RentalSettingsPanel() {
  const toast = useToast()
  const [examPeriod, setExamPeriod] = useState({ start: '2026-10-19', end: '2026-10-30' })
  const [editing, setEditing] = useState<'exam' | null>(null)
  const [examDraft, setExamDraft] = useState(examPeriod)

  const openExamEdit = () => {
    setExamDraft(examPeriod)
    setEditing('exam')
  }

  const saveExam = () => {
    if (!examDraft.start || !examDraft.end || examDraft.start > examDraft.end) return
    setExamPeriod(examDraft)
    setEditing(null)
    toast({ content: '시험기간 설정을 변경했어요.', variant: 'positive' })
  }

  return (
    <>
      <FlexBox flexDirection="column" style={{ gap: 16, maxWidth: 760 }}>
        <FormSection style={{ maxWidth: 760 }}>
          <FlexBox justifyContent="space-between" alignItems="center" style={{ gap: 16, flexWrap: 'wrap' }}>
            <FlexBox flexDirection="column" style={{ gap: 6 }}>
              <Typography variant="body1" weight="bold">시험기간 설정</Typography>
              <Typography variant="body2" color="semantic.label.alternative">시험기간 동안 빌릴게 이용이 제한돼요.</Typography>
              <Typography variant="caption1" color="semantic.label.alternative" style={{ marginTop: 6 }}>{examPeriod.start} ~ {examPeriod.end}</Typography>
            </FlexBox>
            <Button variant="outlined" color="primary" onClick={openExamEdit}>수정</Button>
          </FlexBox>
        </FormSection>

      </FlexBox>

      <Modal open={editing === 'exam'} onOpenChange={(open) => !open && setEditing(null)}>
        <ModalContainer size="small"><ModalContent>
          <ModalContentItem><ModalHeading>시험기간 설정 수정</ModalHeading></ModalContentItem>
          <ModalContentItem style={{ gap: 20 }}>
            <FormItem label="시작일"><DatePicker format="YYYY-MM-DD" width="100%" value={examDraft.start ? new Date(`${examDraft.start}T00:00:00`) : undefined} onChange={(value) => setExamDraft({ ...examDraft, start: toDateValue(value) })} /></FormItem>
            <FormItem label="종료일"><DatePicker format="YYYY-MM-DD" width="100%" value={examDraft.end ? new Date(`${examDraft.end}T00:00:00`) : undefined} onChange={(value) => setExamDraft({ ...examDraft, end: toDateValue(value) })} /></FormItem>
          </ModalContentItem>
          <ModalContentItem style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}><Button variant="outlined" color="assistive" onClick={() => setEditing(null)}>취소</Button><Button variant="solid" color="primary" onClick={saveExam}>저장</Button></ModalContentItem>
        </ModalContent></ModalContainer>
      </Modal>

    </>
  )
}

export default RentalSettingsPanel
