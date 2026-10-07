import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, DatePicker, FlexBox, Typography, useToast, type DateType } from '@wanteddev/wds'
import PageHeader from '../../components/common/PageHeader'
import FormItem from '../../components/common/FormItem'
import { useBoards } from './store'

function toDateValue(value: DateType) {
  if (!value) return ''
  if (typeof value === 'string') return value.slice(0, 10)
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}

export default function FeedbackRoundCreatePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { feedbackRounds, createFeedbackRound } = useBoards()
  const [openDate, setOpenDate] = useState('')
  const [closeDate, setCloseDate] = useState('')
  const [error, setError] = useState('')
  const nextRound = feedbackRounds.reduce((maximum, round) => Math.max(maximum, round.roundNumber), 0) + 1

  const submit = () => {
    if (!openDate || !closeDate) {
      setError('질문 접수 시작일과 마감일을 모두 선택해주세요.')
      return
    }
    if (openDate > closeDate) {
      setError('질문 접수 마감일은 시작일 이후여야 해요.')
      return
    }
    createFeedbackRound({ openDate, closeDate })
    toast({ content: `${nextRound}차 질문 접수 회차를 등록했어요.`, variant: 'positive' })
    navigate('/feedback?tab=rounds')
  }

  return (
    <>
      <PageHeader title="새 회차 등록" />
      <FlexBox flexDirection="column" style={{ maxWidth: 720, gap: 20 }}>
        <FlexBox flexDirection="column" style={{ gap: 20, padding: 24, border: '1px solid var(--semantic-line-normal-normal)', borderRadius: 16 }}>
          <FlexBox flexDirection="column" style={{ gap: 4 }}>
            <Typography variant="body1" weight="bold">질문 접수 설정</Typography>
            <Typography variant="body2" color="semantic.label.alternative">{nextRound}차 열린 피드백으로 등록돼요.</Typography>
          </FlexBox>
          <FormItem label="질문 접수 기간" required error={error}>
            <FlexBox alignItems="center" style={{ gap: 8 }}>
              <DatePicker value={openDate ? new Date(`${openDate}T00:00:00`) : undefined} onChange={(value) => { setOpenDate(toDateValue(value)); setError('') }} format="YYYY-MM-DD" width="100%" />
              <Typography variant="body2" color="semantic.label.alternative">~</Typography>
              <DatePicker value={closeDate ? new Date(`${closeDate}T00:00:00`) : undefined} onChange={(value) => { setCloseDate(toDateValue(value)); setError('') }} format="YYYY-MM-DD" width="100%" />
            </FlexBox>
          </FormItem>
        </FlexBox>
        <FlexBox justifyContent="flex-end" style={{ gap: 8 }}>
          <Button variant="outlined" color="assistive" onClick={() => navigate('/feedback?tab=rounds')}>취소</Button>
          <Button variant="solid" color="primary" onClick={submit}>회차 등록</Button>
        </FlexBox>
      </FlexBox>
    </>
  )
}
