import { useState } from 'react'
import { Button, FlexBox, Menu, MenuContent, MenuTrigger, Modal, ModalContainer, ModalContent, ModalContentItem, ModalDescription, ModalHeading, Option, Select, Tab, TabList, TabListItem, TabPanel, TextArea, TextButton, TextField, Typography, useToast } from '@wanteddev/wds'
import { IconChevronDownSmall } from '@wanteddev/wds-icon'
import PageHeader from '../../components/common/PageHeader'
import DataTable, { type DataTableColumn } from '../../components/common/DataTable'
import FormItem from '../../components/common/FormItem'
import FormSection from '../../components/common/FormSection'
import SearchField from '../../components/common/SearchField'
import ExcelExportButton from '../../components/common/ExcelExportButton'
import StatusBadge, { type BadgeTone } from '../../components/common/StatusBadge'
import TableCheckboxFilter from '../../components/common/TableCheckboxFilter'
import { useStudentCouncil } from './store'
import { BANKS, type BankName, type PaymentStatus, type StreamMembershipStatus, type StudentCouncilFeeAccount, type StudentMember } from './types'

type Filter = 'all' | PaymentStatus
type AccountForm = Omit<StudentCouncilFeeAccount, 'id'>

const paymentStatuses: PaymentStatus[] = ['납부 전', '납부확인중', '납부완료', '확인필요']
const defaultMessage = '입금자 정보를 확인하지 못했어요. 문제가 있을 경우 학생회에 문의해 주세요.'

const statusTone: Record<PaymentStatus, BadgeTone> = {
  '납부 전': 'neutral',
  납부확인중: 'pending',
  납부완료: 'positive',
  확인필요: 'negative',
}

const streamMembershipTone: Record<StreamMembershipStatus, BadgeTone> = {
  가입: 'positive',
  '가입 전': 'neutral',
}

function toCsv(rows: StudentMember[]) {
  const header = ['이름', '학번', '학과', 'Stream 가입 상태', '납부일', '납부 상태', '관리자 안내']
  const lines = rows.map((row) => [row.name, row.studentId, row.department, row.streamMembershipStatus, row.paidAt ?? '-', row.status, row.managerMessage ?? '-'].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
  return [header.join(','), ...lines].join('\n')
}

function PaymentMemberList() {
  const { members, updatePaymentStatus } = useStudentCouncil()
  const toast = useToast()
  const [filters, setFilters] = useState<Filter[]>(['all'])
  const [search, setSearch] = useState('')
  const [openStatusId, setOpenStatusId] = useState<string | null>(null)
  const [messageTarget, setMessageTarget] = useState<StudentMember | null>(null)
  const [message, setMessage] = useState(defaultMessage)
  const filtered = members.filter((member) => {
    if (!filters.includes('all') && !filters.includes(member.status)) return false
    const keyword = search.trim()
    return !keyword || member.name.includes(keyword) || member.studentId.includes(keyword)
  })

  const handleExport = () => {
    const blob = new Blob(['﻿' + toCsv(filtered)], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '학생회비_납부명단.csv'
    link.click()
    URL.revokeObjectURL(url)
    toast({ content: '명단을 내보냈어요.', variant: 'positive' })
  }

  const selectStatus = (member: StudentMember, status: PaymentStatus) => {
    setOpenStatusId(null)
    if (status === '확인필요') {
      setMessageTarget(member)
      setMessage(member.managerMessage ?? defaultMessage)
      return
    }
    updatePaymentStatus(member.id, status)
    toast({ content: `${member.name}님의 납부 상태를 ${status}(으)로 변경했어요.`, variant: 'positive' })
  }

  const columns: DataTableColumn<StudentMember>[] = [
    { key: 'name', header: '이름', width: 100, render: (row) => row.name },
    { key: 'studentId', header: '학번', width: 130, render: (row) => row.studentId },
    { key: 'department', header: '학과', width: 150, render: (row) => row.department },
    { key: 'streamMembershipStatus', header: 'Stream 가입 상태', width: 140, render: (row) => <StatusBadge label={row.streamMembershipStatus} tone={streamMembershipTone[row.streamMembershipStatus]} /> },
    { key: 'paidAt', header: '납부일', width: 120, render: (row) => row.paidAt ?? '-' },
    {
      key: 'status', header: <TableCheckboxFilter label="납부 상태" ariaLabel="납부 상태 필터" allLabel="전체 납부 상태" options={paymentStatuses} value={filters} onChange={(value) => setFilters(value as Filter[])} />, width: 180,
      render: (row) => (
        <Menu open={openStatusId === row.id} onOpenChange={(open) => setOpenStatusId(open ? row.id : null)}>
          <MenuTrigger>
            <span className="app-hoverable" style={{ display: 'inline-flex', cursor: 'pointer', borderRadius: 8 }}><StatusBadge label={row.status} tone={statusTone[row.status]} size="medium" trailingContent={<IconChevronDownSmall width={20} height={20} />} /></span>
          </MenuTrigger>
          <MenuContent position="bottom-end" offset={8} className="payment-status-menu-content" wrapperProps={{ style: { zIndex: 1000 } }}>
            <FlexBox flexDirection="column" style={{ gap: 14, padding: 16 }}>
              <FlexBox flexDirection="column" style={{ gap: 8 }}><Typography variant="label2" color="semantic.label.alternative">현재 상태</Typography><StatusBadge label={row.status} tone={statusTone[row.status]} size="medium" /></FlexBox>
              <div style={{ height: 1, background: '#d9dde3' }} />
              <div className="payment-status-menu-list">{paymentStatuses.map((status) => <div key={status} className="payment-status-option" role="menuitem" tabIndex={0} onClick={() => selectStatus(row, status)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectStatus(row, status) } }}><StatusBadge label={status} tone={statusTone[status]} size="medium" /></div>)}</div>
            </FlexBox>
          </MenuContent>
        </Menu>
      ),
    },
    {
      key: 'managerMessage', header: '관리자 안내', width: 280,
      render: (row) => row.managerMessage ? <TextButton size="small" style={{ display: 'block', maxWidth: 340, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} onClick={() => { setMessageTarget(row); setMessage(row.managerMessage ?? defaultMessage) }}>{row.managerMessage}</TextButton> : '-',
    },
  ]

  return (
    <>
      <FlexBox className="app-page-toolbar" justifyContent="flex-end" alignItems="center" style={{ marginBottom: 16, gap: 12 }}>
        <FlexBox alignItems="center" style={{ gap: 12 }}>
          <SearchField value={search} onChange={setSearch} placeholder="이름 또는 학번 검색" />
          <ExcelExportButton onClick={handleExport} />
        </FlexBox>
      </FlexBox>
      <DataTable columns={columns} rows={filtered} rowKey={(row) => row.id} emptyMessage="명단이 없어요." className="student-payment-table" />
      <Modal open={Boolean(messageTarget)} onOpenChange={(open) => !open && setMessageTarget(null)}>
        <ModalContainer size="small"><ModalContent>
          <ModalContentItem style={{ gap: 8 }}><ModalHeading>확인 필요 안내</ModalHeading><ModalDescription>{messageTarget ? `${messageTarget.name}님에게 전달할 안내를 작성해주세요.` : undefined}</ModalDescription></ModalContentItem>
          <ModalContentItem><TextArea value={message} onChange={(event) => setMessage(event.target.value)} style={{ minHeight: 120 }} /></ModalContentItem>
          <ModalContentItem style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
            <Button variant="outlined" color="assistive" onClick={() => setMessageTarget(null)}>취소</Button>
            <Button variant="solid" color="primary" onClick={() => { if (!messageTarget) return; updatePaymentStatus(messageTarget.id, '확인필요', message.trim() || defaultMessage); toast({ content: '확인 필요 안내를 저장했어요.', variant: 'positive' }); setMessageTarget(null) }}>저장</Button>
          </ModalContentItem>
        </ModalContent></ModalContainer>
      </Modal>
    </>
  )
}

function AccountManagement() {
  const { accounts, saveAccount } = useStudentCouncil()
  const toast = useToast()
  const current = accounts[0]
  const [form, setForm] = useState<AccountForm>({ year: current.year, bank: current.bank, accountNumber: current.accountNumber, accountHolder: current.accountHolder, feePerSemester: current.feePerSemester })
  const [editing, setEditing] = useState(false)
  const save = () => {
    if (!form.accountNumber.trim() || !form.accountHolder.trim() || form.feePerSemester < 1) return
    saveAccount({ ...form, accountNumber: form.accountNumber.trim(), accountHolder: form.accountHolder.trim() })
    toast({ content: `${form.year}학년도 납부계좌를 저장했어요.`, variant: 'positive' })
    setEditing(false)
  }
  return (
    <FlexBox flexDirection="column" style={{ gap: 32 }}>
      <FormSection style={{ maxWidth: 560 }}>
        <FlexBox className="account-card-header" justifyContent="space-between" alignItems="flex-start"><FlexBox flexDirection="column" style={{ gap: 4 }}><Typography variant="body1" weight="bold">학생회비 납부계좌</Typography><Typography variant="body2" color="semantic.label.alternative">`(8학기 - 수강한 학기) × 학기당 회비`로 납부 금액이 계산돼요.</Typography></FlexBox>{!editing && <Button variant="outlined" color="primary" onClick={() => setEditing(true)}>수정</Button>}</FlexBox>
        {editing ? <>
          <FormItem label="은행"><Select value={form.bank} onChange={(value) => setForm({ ...form, bank: value as BankName })}>{BANKS.map((bank) => <Option key={bank} value={bank}>{bank}</Option>)}</Select></FormItem>
          <FormItem label="계좌번호"><TextField value={form.accountNumber} placeholder="계좌번호를 입력해주세요" onChange={(event) => setForm({ ...form, accountNumber: event.target.value })} /></FormItem>
          <FormItem label="예금주"><TextField value={form.accountHolder} placeholder="예금주를 입력해주세요" onChange={(event) => setForm({ ...form, accountHolder: event.target.value })} /></FormItem>
          <FormItem label="학기당 학생회비"><TextField type="number" value={String(form.feePerSemester)} onChange={(event) => setForm({ ...form, feePerSemester: Number(event.target.value) || 0 })} /></FormItem>
          <FlexBox justifyContent="flex-end" style={{ gap: 8 }}><Button variant="outlined" color="assistive" onClick={() => { setForm({ year: current.year, bank: current.bank, accountNumber: current.accountNumber, accountHolder: current.accountHolder, feePerSemester: current.feePerSemester }); setEditing(false) }}>취소</Button><Button variant="solid" color="primary" onClick={save}>저장</Button></FlexBox>
        </> : <FlexBox flexDirection="column" style={{ gap: 16 }}>
          {[['은행', form.bank], ['계좌번호', form.accountNumber], ['예금주', form.accountHolder], ['학기당 학생회비', `${form.feePerSemester.toLocaleString()}원`]].map(([label, value]) => <FlexBox className="account-info-row" key={label} justifyContent="space-between" alignItems="center"><Typography variant="body2" color="semantic.label.alternative">{label}</Typography><Typography variant="body1" weight="medium">{value}</Typography></FlexBox>)}
        </FlexBox>}
      </FormSection>
    </FlexBox>
  )
}

function StudentCouncilPage() {
  const [tab, setTab] = useState('members')
  return (
    <>
      <PageHeader title="학생회비 관리" description="학생회비 납부 현황과 납부계좌를 관리해요." />
      <Tab value={tab} onValueChange={setTab}>
        <TabList size="medium" style={{ marginBottom: 20 }}><TabListItem value="members">학생회비 납부자 목록</TabListItem><TabListItem value="accounts">학생회비 납부계좌 관리</TabListItem></TabList>
        <TabPanel value="members"><PaymentMemberList /></TabPanel>
        <TabPanel value="accounts"><AccountManagement /></TabPanel>
      </Tab>
    </>
  )
}

export default StudentCouncilPage
