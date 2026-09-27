import { useState } from 'react'
import { Button, FlexBox, TextField, Typography, useToast } from '@wanteddev/wds'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import FormItem from '../../components/common/FormItem'
import { useStudentCouncil } from '../studentCouncil/store'
import { useAdminManagement } from '../adminManagement/store'
import { useRentals } from './store'

function toDateValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

function SearchSelect({ id, value, onChange, options, placeholder }: { id: string; value: string; onChange: (value: string) => void; options: string[]; placeholder: string }) {
  return (
    <>
      <TextField list={id} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      <datalist id={id}>{options.map((option) => <option key={option} value={option} />)}</datalist>
    </>
  )
}

function RentalRecordFormPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { members } = useStudentCouncil()
  const { admins } = useAdminManagement()
  const { items, addRentalRecord } = useRentals()
  const [borrowerValue, setBorrowerValue] = useState('')
  const [itemValue, setItemValue] = useState('')
  const [workerValue, setWorkerValue] = useState('')
  const [rentalDate, setRentalDate] = useState(toDateValue(new Date()))
  const [rentalTime, setRentalTime] = useState('09:00')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const borrowerOptions = members.map((member) => `${member.name} · ${member.studentId}`)
  const itemOptions = items.map((item) => `${item.name} · ${item.category}`)
  const workerOptions = admins.map((admin) => `${admin.name} · ${admin.studentId} · ${admin.role}`)

  const submit = () => {
    const borrower = members.find((member) => `${member.name} · ${member.studentId}` === borrowerValue)
    const item = items.find((candidate) => `${candidate.name} · ${candidate.category}` === itemValue)
    const worker = admins.find((admin) => `${admin.name} · ${admin.studentId} · ${admin.role}` === workerValue)
    const nextErrors: Record<string, string> = {}
    if (!borrower) nextErrors.borrower = '학생회비 납부자 목록에서 대여자를 선택해주세요.'
    if (!item) nextErrors.item = '등록된 물품을 선택해주세요.'
    if (!rentalDate || !rentalTime) nextErrors.rentalAt = '대여 날짜와 시간을 선택해주세요.'
    if (!worker) nextErrors.worker = '관리자 목록에서 근무자를 선택해주세요.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length || !borrower || !item || !worker) return

    const borrowedAt = `${rentalDate} ${rentalTime}`
    const due = new Date(`${rentalDate}T${rentalTime}`)
    due.setDate(due.getDate() + 7)
    const dueDate = `${toDateValue(due)} ${due.toTimeString().slice(0, 5)}`
    addRentalRecord({ itemId: item.id, itemName: item.name, borrowerName: borrower.name, borrowerStudentId: borrower.studentId, borrowedAt, dueDate, workerName: worker.name, status: '대여중' })
    toast({ content: '대여 내역을 추가했어요.', variant: 'positive' })
    navigate('/rentals?tab=records')
  }

  return (
    <>
      <PageHeader title="대여 추가하기" description="대여자와 물품, 대여 정보를 등록해요." />
      <FlexBox flexDirection="column" style={{ gap: 20, maxWidth: 720 }}>
        <FlexBox flexDirection="column" style={{ gap: 20, padding: 24, border: '1px solid var(--semantic-line-normal-normal)', borderRadius: 14 }}>
          <Typography variant="label1" weight="bold">대여 정보</Typography>
          <FormItem label="대여자" error={errors.borrower}>
            <SearchSelect id="rental-borrower-options" value={borrowerValue} onChange={setBorrowerValue} options={borrowerOptions} placeholder="이름 또는 학번으로 검색해 선택하세요" />
          </FormItem>
          <FormItem label="대여 물품" error={errors.item}>
            <SearchSelect id="rental-item-options" value={itemValue} onChange={setItemValue} options={itemOptions} placeholder="물품명 또는 카테고리로 검색해 선택하세요" />
          </FormItem>
        </FlexBox>

        <FlexBox flexDirection="column" style={{ gap: 20, padding: 24, border: '1px solid var(--semantic-line-normal-normal)', borderRadius: 14 }}>
          <Typography variant="label1" weight="bold">처리 정보</Typography>
          <FlexBox style={{ gap: 16 }}>
            <FlexBox style={{ flex: 1 }}><FormItem label="대여 날짜" error={errors.rentalAt}><TextField type="date" value={rentalDate} onChange={(event) => setRentalDate(event.target.value)} /></FormItem></FlexBox>
            <FlexBox style={{ flex: 1 }}><FormItem label="대여 시간" error={errors.rentalAt}><TextField type="time" value={rentalTime} onChange={(event) => setRentalTime(event.target.value)} /></FormItem></FlexBox>
          </FlexBox>
          <FormItem label="근무자" error={errors.worker}>
            <SearchSelect id="rental-worker-options" value={workerValue} onChange={setWorkerValue} options={workerOptions} placeholder="이름 또는 학번으로 검색해 선택하세요" />
          </FormItem>
        </FlexBox>

        <FlexBox justifyContent="flex-end" style={{ gap: 8 }}>
          <Button variant="outlined" color="assistive" onClick={() => navigate('/rentals?tab=records')}>취소</Button>
          <Button variant="solid" color="primary" onClick={submit}>대여 추가</Button>
        </FlexBox>
      </FlexBox>
    </>
  )
}

export default RentalRecordFormPage
