import { useMemo, useState } from 'react'
import { Button, FlexBox, Tooltip, TooltipContent, TooltipTrigger, Typography, useToast } from '@wanteddev/wds'
import StatusBadge from '../../../components/common/StatusBadge'
import { useLockers } from '../store'
import { LOCKER_PHYSICAL_LAYOUTS, LOCKER_ZONES, getLockerDisplayStatus, type Locker, type LockerDisplayStatus, type LockerZone } from '../types'

const statusStyle: Record<LockerDisplayStatus, { background: string; color: string; border: string }> = {
  선택가능: { background: 'var(--semantic-background-normal-normal)', color: 'var(--semantic-label-normal)', border: '1px solid var(--semantic-line-normal-normal)' },
  선택불가: { background: 'var(--semantic-fill-normal)', color: 'var(--semantic-label-alternative)', border: '1px solid transparent' },
  배정됨: { background: 'rgba(var(--semantic-primary-normal-rgb), 0.08)', color: 'var(--semantic-primary-normal)', border: '1px solid rgba(var(--semantic-primary-normal-rgb), 0.24)' },
}

function LockerCell({
  locker,
  applicantName,
  editing,
  selected,
  onSelect,
}: {
  locker: Locker
  applicantName?: string
  editing: boolean
  selected: boolean
  onSelect: (locker: Locker) => void
}) {
  const status = getLockerDisplayStatus(locker)
  const style = statusStyle[status]
  const selectable = editing && !locker.assignedTo
  const cell = (
    <FlexBox
      className={selectable ? 'app-hoverable app-hoverable-flat' : undefined}
      alignItems="center"
      justifyContent="center"
      onClick={selectable ? () => onSelect(locker) : undefined}
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        background: selected ? 'rgba(var(--semantic-primary-normal-rgb), 0.16)' : style.background,
        color: style.color,
        border: selected ? '2px solid var(--semantic-primary-normal)' : style.border,
        cursor: selectable ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      <Typography variant="caption1" weight="medium">{locker.number.split('-').at(-1)}</Typography>
    </FlexBox>
  )
  return locker.assignedTo ? (
    <Tooltip mode="hover">
      <TooltipTrigger>{cell}</TooltipTrigger>
      <TooltipContent>{applicantName ? `${locker.number} · ${applicantName} 사용 중` : `${locker.number} · 사용자 정보 없음`}</TooltipContent>
    </Tooltip>
  ) : cell
}

function LegendItem({ status }: { status: LockerDisplayStatus }) {
  const style = statusStyle[status]
  return (
    <FlexBox alignItems="center" style={{ gap: 6 }}>
      <FlexBox style={{ width: 16, height: 16, borderRadius: 4, background: style.background, border: style.border }} />
      <Typography variant="label2" color="semantic.label.alternative">{status}</Typography>
    </FlexBox>
  )
}

function LockerLayoutPanel() {
  const { lockers, applications, updateLockerStatuses } = useLockers()
  const toast = useToast()
  const [selectedZone, setSelectedZone] = useState<LockerZone>('A-1')
  const [editing, setEditing] = useState(false)
  const [selectedLockerIds, setSelectedLockerIds] = useState<string[]>([])
  const applicantNameById = new Map(applications.map((application) => [application.id, application.name]))
  const zoneLockers = useMemo(() => lockers.filter((locker) => locker.zone === selectedZone), [lockers, selectedZone])
  const lockersByNumber = new Map(zoneLockers.map((locker) => [Number(locker.number.split('-').at(-1)), locker]))

  const handleSelectZone = (zone: LockerZone) => {
    setSelectedZone(zone)
    setEditing(false)
    setSelectedLockerIds([])
  }

  const toggleSelection = (locker: Locker) => {
    setSelectedLockerIds((prev) => prev.includes(locker.id) ? prev.filter((id) => id !== locker.id) : [...prev, locker.id])
  }

  const updateSelectedLockers = (status: Locker['status']) => {
    if (selectedLockerIds.length === 0) return
    updateLockerStatuses(selectedLockerIds, status)
    toast({ content: `${selectedLockerIds.length}개 사물함을 ${status === 'disabled' ? '선택불가' : '선택가능'}로 변경했어요.`, variant: 'positive' })
    setSelectedLockerIds([])
  }

  return (
    <FlexBox flexDirection="column" style={{ gap: 28 }}>
      <FlexBox flexWrap="wrap" style={{ gap: 12 }}>
        {LOCKER_ZONES.map((zone) => {
          const zoneItems = lockers.filter((locker) => locker.zone === zone)
          const available = zoneItems.filter((locker) => getLockerDisplayStatus(locker) === '선택가능').length
          const assigned = zoneItems.filter((locker) => getLockerDisplayStatus(locker) === '배정됨').length
          const isSelected = selectedZone === zone
          return (
            <FlexBox
              key={zone}
              className="app-hoverable"
              flexDirection="column"
              onClick={() => handleSelectZone(zone)}
              style={{ width: 180, gap: 8, padding: 16, borderRadius: 12, cursor: 'pointer', background: isSelected ? 'rgba(var(--semantic-primary-normal-rgb), 0.06)' : 'var(--semantic-background-normal-normal)', border: isSelected ? '1px solid rgba(var(--semantic-primary-normal-rgb), 0.32)' : '1px solid var(--semantic-line-normal-normal)' }}
            >
              <FlexBox justifyContent="space-between" alignItems="center">
                <Typography variant="label1" weight="bold">{zone} 구역</Typography>
                <StatusBadge label={`${zoneItems.length}개`} tone={isSelected ? 'info' : 'neutral'} />
              </FlexBox>
              <Typography variant="caption1" color="semantic.label.alternative">선택가능 {available} · 배정됨 {assigned}</Typography>
            </FlexBox>
          )
        })}
      </FlexBox>

      <FlexBox flexDirection="column" style={{ gap: 16, paddingTop: 4 }}>
        <FlexBox justifyContent="space-between" alignItems="center" style={{ gap: 16 }}>
          <FlexBox alignItems="center" style={{ gap: 8 }}>
            <Typography variant="title3" weight="bold">{selectedZone} 구역</Typography>
            <Typography variant="body2" color="semantic.label.alternative">총 {zoneLockers.length}개</Typography>
            <FlexBox alignItems="center" style={{ gap: 12, marginLeft: 12 }}>
              <LegendItem status="선택가능" />
              <LegendItem status="선택불가" />
              <LegendItem status="배정됨" />
            </FlexBox>
          </FlexBox>
          {editing ? (
            <FlexBox alignItems="center" style={{ gap: 8 }}>
              <Typography variant="label2" color="semantic.label.alternative">{selectedLockerIds.length}개 선택</Typography>
              <Button variant="outlined" color="assistive" onClick={() => { setEditing(false); setSelectedLockerIds([]) }}>취소</Button>
              <Button variant="outlined" color="assistive" disabled={selectedLockerIds.length === 0} onClick={() => updateSelectedLockers('available')}>선택가능으로 변경</Button>
              <Button variant="solid" color="primary" disabled={selectedLockerIds.length === 0} onClick={() => updateSelectedLockers('disabled')}>선택불가로 변경</Button>
            </FlexBox>
          ) : (
            <Button variant="outlined" color="primary" onClick={() => setEditing(true)}>수정</Button>
          )}
        </FlexBox>

        <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
          <FlexBox alignItems="flex-start" style={{ width: 'max-content', minWidth: '100%', gap: 18 }}>
            {LOCKER_PHYSICAL_LAYOUTS[selectedZone].map((group, groupIndex) => (
              <div key={`${selectedZone}-${groupIndex}`} style={{ display: 'grid', gridTemplateColumns: `repeat(${group.columns}, 36px)`, gap: 6 }}>
                {group.numbers.map((number) => {
                  const locker = lockersByNumber.get(number)
                  return locker ? <LockerCell key={locker.id} locker={locker} applicantName={locker.assignedTo ? applicantNameById.get(locker.assignedTo) : undefined} editing={editing} selected={selectedLockerIds.includes(locker.id)} onSelect={toggleSelection} /> : null
                })}
              </div>
            ))}
          </FlexBox>
        </div>
      </FlexBox>
    </FlexBox>
  )
}

export default LockerLayoutPanel
