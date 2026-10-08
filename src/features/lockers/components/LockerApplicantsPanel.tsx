import { useMemo, useState } from 'react'
import {
  Button,
  FlexBox,
  Menu, MenuContent, MenuItem, MenuList, MenuTrigger, IconButton,
  Modal, ModalContainer, ModalContent, ModalContentItem, ModalDescription, ModalHeading,
  TextField,
  Typography,
  useToast,
} from '@wanteddev/wds'
import DataTable, { type DataTableColumn } from '../../../components/common/DataTable'
import SearchField from '../../../components/common/SearchField'
import StatusBadge from '../../../components/common/StatusBadge'
import ConfirmModal from '../../../components/common/ConfirmModal'
import RowMoreMenu from '../../../components/common/RowMoreMenu'
import { useLockers } from '../store'
import { LOCKER_PHYSICAL_LAYOUTS, LOCKER_ZONES, type LockerApplication, type LockerZone } from '../types'
import { IconChevronDown } from '@wanteddev/wds-icon'
import FormItem from '../../../components/common/FormItem'
import { useStudentCouncil } from '../../studentCouncil/store'

type StatusFilter = 'all' | '신청완료' | '취소'

function LockerApplicantsPanel() {
  const { lockers, applications, cancelApplication, addManualAssignment } = useLockers()
  const { members } = useStudentCouncil()
  const toast = useToast()
  const [filters, setFilters] = useState<StatusFilter[]>(['all'])
  const [cancelTarget, setCancelTarget] = useState<LockerApplication | null>(null)
  const [search, setSearch] = useState('')
  const [manualAssignOpen, setManualAssignOpen] = useState(false)
  const [memberValue, setMemberValue] = useState('')
  const [manualZone, setManualZone] = useState<LockerZone>('A-1')
  const [manualLockerId, setManualLockerId] = useState('')

  const lockerNumber = (lockerId?: string) => {
    const locker = lockers.find((item) => item.id === lockerId)
    if (!locker) return undefined
    return `${locker.zone.split('-')[0]}-${locker.number.split('-').at(-1)}`
  }

  const filtered = applications.filter((a) => {
    if (!filters.includes('all') && !filters.includes(a.status)) return false
    const keyword = search.trim()
    if (!keyword) return true
    return a.name.includes(keyword) || a.studentId.includes(keyword)
  })
  const selectedMember = members.find((member) => `${member.name} · ${member.studentId}` === memberValue)
  const memberOptions = members.map((member) => `${member.name} · ${member.studentId}`)
  const zoneLockers = useMemo(() => lockers.filter((locker) => locker.zone === manualZone), [lockers, manualZone])
  const lockerByNumber = new Map(zoneLockers.map((locker) => [Number(locker.number.split('-').at(-1)), locker]))
  const selectedLocker = lockers.find((locker) => locker.id === manualLockerId)
  const gradeFromStudentId = (studentId: string) => Math.min(4, Math.max(1, new Date().getFullYear() - Number(studentId.slice(0, 4)) + 1))
  const resetManualDraft = () => {
    setMemberValue('')
    setManualZone('A-1')
    setManualLockerId('')
  }
  const handleManualAssignment = () => {
    if (!selectedMember || !manualLockerId) return
    addManualAssignment({
      name: selectedMember.name,
      studentId: selectedMember.studentId,
      grade: gradeFromStudentId(selectedMember.studentId),
      lockerId: manualLockerId,
    })
    setManualAssignOpen(false)
    resetManualDraft()
    toast({ content: '사물함을 수동 배정했어요.', variant: 'positive' })
  }

  const columns: DataTableColumn<LockerApplication>[] = [
    { key: 'name', header: '이름', width: 100, render: (row) => row.name },
    { key: 'studentId', header: '학번', width: 140, render: (row) => row.studentId },
    { key: 'grade', header: '학년', width: 80, render: (row) => `${row.grade}학년` },
    { key: 'appliedAt', header: '신청일시', width: 140, render: (row) => row.appliedAt },
    {
      key: 'locker',
      header: '배정 사물함',
      width: 120,
      render: (row) =>
        row.lockerId ? (
          <Typography variant="body2" weight="medium" color="semantic.primary.normal">
            {lockerNumber(row.lockerId)}
          </Typography>
        ) : (
          <Typography variant="body2" color="semantic.label.alternative">
            -
          </Typography>
        ),
    },
    {
      key: 'status',
      header: <Menu value={filters} onValueChange={(value) => { if (!Array.isArray(value)) return; if (value.length === 0) { setFilters(['all']); return }; if (value.includes('all')) { setFilters(filters.includes('all') ? value.filter((item) => item !== 'all') as StatusFilter[] : ['all']); return }; setFilters(value as StatusFilter[]) }}><FlexBox alignItems="center" style={{ gap: 4 }}><span>상태</span><MenuTrigger><IconButton variant="normal" size="small" aria-label="사물함 신청 상태 필터" style={{ width: 12, height: 12 }}><IconChevronDown width={6} height={6} /></IconButton></MenuTrigger></FlexBox><MenuContent position="bottom-start" offset={4}><MenuList><MenuItem variant="checkbox" value="all">전체 상태</MenuItem><MenuItem variant="checkbox" value="신청완료">신청완료</MenuItem><MenuItem variant="checkbox" value="취소">취소</MenuItem></MenuList></MenuContent></Menu>,
      width: 100,
      render: (row) => <StatusBadge label={row.status} tone={row.status === '취소' ? 'negative' : 'positive'} />,
    },
    {
      key: 'actions',
      header: '',
      width: 56,
      align: 'right',
      render: (row) =>
        row.status === '신청완료' ? (
          <RowMoreMenu label={`${row.name} 신청`} onDelete={() => setCancelTarget(row)} deleteLabel="취소 처리" />
        ) : (
          <Typography variant="label2" color="semantic.label.alternative">
            -
          </Typography>
        ),
    },
  ]

  return (
    <FlexBox flexDirection="column" style={{ gap: 16 }}>
      <Typography variant="body2" color="semantic.label.alternative">
        총 {applications.length}명 신청 (신청완료 {applications.filter((a) => a.status === '신청완료').length}명 ·
        취소 {applications.filter((a) => a.status === '취소').length}명)
      </Typography>

      <FlexBox className="app-page-toolbar" justifyContent="flex-end" alignItems="center" style={{ marginBottom: 4, gap: 12 }}>
        <SearchField value={search} onChange={setSearch} placeholder="이름 또는 학번 검색" />
        <Button variant="solid" color="primary" onClick={() => setManualAssignOpen(true)}>
          + 수동 배정
        </Button>
      </FlexBox>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(row) => row.id}
        emptyMessage="신청자가 없어요."
        minWidth={900}
        style={{ width: '100%', tableLayout: 'fixed' }}
      />

      <ConfirmModal
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="신청을 취소 처리할까요?"
        description={
          cancelTarget
            ? `${cancelTarget.name}(${cancelTarget.studentId})님의 신청을 취소하고 배정된 사물함(${lockerNumber(cancelTarget.lockerId) ?? '-'})을 반납 처리해요.`
            : undefined
        }
        confirmLabel="취소 처리"
        tone="negative"
        onConfirm={() => {
          if (cancelTarget) {
            cancelApplication(cancelTarget.id)
            toast({ content: '신청이 취소 처리되었어요.', variant: 'normal' })
          }
        }}
      />

      <Modal
        open={manualAssignOpen}
        onOpenChange={(open) => {
          setManualAssignOpen(open)
          if (!open) resetManualDraft()
        }}
      >
        <ModalContainer size="small">
          <ModalContent>
            <ModalContentItem>
              <ModalHeading>사물함 수동 배정</ModalHeading>
              <ModalDescription>학생회비 납부자 목록에서 학생을 선택하고 사물함을 배정하세요.</ModalDescription>
            </ModalContentItem>
            <ModalContentItem style={{ gap: 16 }}>
              <FormItem label="학생회비 납부자">
                <>
                  <TextField list="locker-payment-member-options" value={memberValue} placeholder="이름 또는 학번으로 검색해 선택하세요" onChange={(event) => setMemberValue(event.target.value)} />
                  <datalist id="locker-payment-member-options">
                    {memberOptions.map((member) => <option key={member} value={member} />)}
                  </datalist>
                </>
              </FormItem>
              {selectedMember && <Typography variant="body2" color="semantic.label.alternative">{selectedMember.department} · {gradeFromStudentId(selectedMember.studentId)}학년</Typography>}
              <FormItem label="배정 구역 및 사물함">
                <FlexBox flexDirection="column" style={{ gap: 12 }}>
                  <FlexBox flexWrap="wrap" style={{ gap: 8 }}>
                    {LOCKER_ZONES.map((zone) => {
                      const availableCount = lockers.filter((locker) => locker.zone === zone && locker.status === 'available' && !locker.assignedTo).length
                      const active = manualZone === zone
                      return <Button key={zone} variant={active ? 'solid' : 'outlined'} color={active ? 'primary' : 'assistive'} size="small" onClick={() => { setManualZone(zone); setManualLockerId('') }}>{zone} 구역 · {availableCount}개</Button>
                    })}
                  </FlexBox>
                  <div style={{ overflowX: 'auto', paddingBottom: 4, padding: 12, borderRadius: 10, background: 'var(--semantic-fill-normal)' }}>
                    <FlexBox alignItems="flex-start" style={{ width: 'max-content', minWidth: '100%', gap: 14 }}>
                      {LOCKER_PHYSICAL_LAYOUTS[manualZone].map((group, groupIndex) => (
                        <div key={`${manualZone}-${groupIndex}`} style={{ display: 'grid', gridTemplateColumns: `repeat(${group.columns}, 32px)`, gap: 5 }}>
                          {group.numbers.map((number) => {
                            const locker = lockerByNumber.get(number)
                            if (!locker) return null
                            const available = locker.status === 'available' && !locker.assignedTo
                            const active = manualLockerId === locker.id
                            return <button key={locker.id} type="button" disabled={!available} onClick={() => setManualLockerId(locker.id)} title={available ? `${locker.number} 선택` : `${locker.number} 선택 불가`} style={{ width: 32, height: 32, padding: 0, borderRadius: 7, border: active ? '2px solid var(--semantic-primary-normal)' : '1px solid var(--semantic-line-normal-normal)', background: active ? 'rgba(var(--semantic-primary-normal-rgb), 0.16)' : available ? 'var(--semantic-background-normal-normal)' : 'var(--semantic-fill-alternative)', color: active || available ? 'var(--semantic-primary-normal)' : 'var(--semantic-label-alternative)', cursor: available ? 'pointer' : 'not-allowed', fontSize: 11, fontWeight: 600 }}>{number}</button>
                          })}
                        </div>
                      ))}
                    </FlexBox>
                  </div>
                  <Typography variant="caption1" color="semantic.label.alternative">{selectedLocker ? `${selectedLocker.number} 선택됨` : '구역을 선택한 뒤 선택 가능한 사물함을 눌러주세요.'}</Typography>
                </FlexBox>
              </FormItem>
            </ModalContentItem>
            <ModalContentItem style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
              <Button variant="outlined" color="assistive" onClick={() => setManualAssignOpen(false)}>취소</Button>
              <Button variant="solid" color="primary" disabled={!selectedMember || !manualLockerId} onClick={handleManualAssignment}>배정</Button>
            </ModalContentItem>
          </ModalContent>
        </ModalContainer>
      </Modal>
    </FlexBox>
  )
}

export default LockerApplicantsPanel
