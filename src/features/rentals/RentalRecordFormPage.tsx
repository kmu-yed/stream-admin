import { useState } from 'react'
import { Button, DatePicker, FlexBox, TextField, Typography, useToast, type DateType } from '@wanteddev/wds'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import FormItem from '../../components/common/FormItem'
import { useStudentCouncil } from '../studentCouncil/store'
import { useAdminManagement } from '../adminManagement/store'
import { useRentals } from './store'
import { getReturnPolicyDays } from './types'

function toDateValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

function toPickerDateValue(value: DateType) {
  if (!value) return ''
  if (typeof value === 'string') return value.slice(0, 10)
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}

type SearchOption = { value: string; title: string; description: string }

function SearchSelect({ value, onChange, options, placeholder }: { value: string; onChange: (value: string) => void; options: SearchOption[]; placeholder: string }) {
  const [open, setOpen] = useState(false)
  const results = options.filter((option) => !value.trim() || `${option.title} ${option.description}`.includes(value.trim()))
  return <FlexBox flexDirection="column" style={{ gap: 8 }}>
    <TextField value={value} placeholder={placeholder} onFocus={() => setOpen(true)} onChange={(event) => { onChange(event.target.value); setOpen(true) }} />
    {open && <FlexBox flexDirection="column" style={{ maxHeight: 196, overflowY: 'auto', border: '1px solid var(--semantic-line-normal-normal)', borderRadius: 10 }}>
      {results.length ? results.map((option) => <button key={option.value} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { onChange(option.value); setOpen(false) }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px 14px', border: 0, borderBottom: '1px solid var(--semantic-line-normal-normal)', background: value === option.value ? 'var(--semantic-primary-light)' : 'transparent', color: 'var(--semantic-label-normal)', textAlign: 'left', cursor: 'pointer', font: 'inherit' }}><strong>{option.title}</strong><span style={{ fontSize: 13, color: 'var(--semantic-label-alternative)' }}>{option.description}</span></button>) : <Typography variant="body2" color="semantic.label.alternative" style={{ padding: 16 }}>검색 결과가 없어요.</Typography>}
    </FlexBox>}
  </FlexBox>
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

  const borrowerOptions = members.map((member) => ({ value: `${member.name} · ${member.studentId}`, title: member.name, description: `${member.studentId} · ${member.department}` }))
  const itemOptions = items.map((item) => ({ value: `${item.name} · ${item.category}`, title: item.name, description: item.category }))
  const workerOptions = admins.map((admin) => ({ value: `${admin.name} · ${admin.studentId} · ${admin.role}`, title: admin.name, description: `${admin.studentId} · ${admin.role}` }))

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
    due.setDate(due.getDate() + getReturnPolicyDays(item.returnPolicy))
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
            <SearchSelect value={borrowerValue} onChange={setBorrowerValue} options={borrowerOptions} placeholder="이름 또는 학번으로 검색해 선택하세요" />
          </FormItem>
          <FormItem label="대여 물품" error={errors.item}>
            <SearchSelect value={itemValue} onChange={setItemValue} options={itemOptions} placeholder="물품명 또는 카테고리로 검색해 선택하세요" />
          </FormItem>
        </FlexBox>

        <FlexBox flexDirection="column" style={{ gap: 20, padding: 24, border: '1px solid var(--semantic-line-normal-normal)', borderRadius: 14 }}>
          <Typography variant="label1" weight="bold">처리 정보</Typography>
          <FlexBox style={{ gap: 16 }}>
            <FlexBox style={{ flex: 1 }}><FormItem label="대여 날짜" error={errors.rentalAt}><DatePicker format="YYYY-MM-DD" width="100%" value={rentalDate ? new Date(`${rentalDate}T00:00:00`) : undefined} onChange={(value) => setRentalDate(toPickerDateValue(value))} /></FormItem></FlexBox>
            <FlexBox style={{ flex: 1 }}><FormItem label="대여 시간" error={errors.rentalAt}><TextField type="time" value={rentalTime} onChange={(event) => setRentalTime(event.target.value)} /></FormItem></FlexBox>
          </FlexBox>
          <FormItem label="근무자" error={errors.worker}>
            <SearchSelect value={workerValue} onChange={setWorkerValue} options={workerOptions} placeholder="이름 또는 학번으로 검색해 선택하세요" />
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
