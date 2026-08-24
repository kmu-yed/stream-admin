import { FlexBox, Tooltip, TooltipContent, TooltipTrigger, Typography, useToast } from '@wanteddev/wds'
import { useLockers } from '../store'
import { LOCKER_ZONES, getLockerDisplayStatus, type Locker, type LockerDisplayStatus } from '../types'

const statusStyle: Record<LockerDisplayStatus, { background: string; color: string; border: string }> = {
  선택가능: {
    background: 'var(--semantic-background-normal-normal)',
    color: 'var(--semantic-label-normal)',
    border: '1px solid var(--semantic-line-normal-normal)',
  },
  선택불가: {
    background: 'var(--semantic-fill-normal)',
    color: 'var(--semantic-label-alternative)',
    border: '1px solid transparent',
  },
  배정됨: {
    background: 'rgba(var(--semantic-primary-normal-rgb), 0.08)',
    color: 'var(--semantic-primary-normal)',
    border: '1px solid rgba(var(--semantic-primary-normal-rgb), 0.24)',
  },
}

function LockerCell({
  locker,
  applicantName,
  onToggle,
}: {
  locker: Locker
  applicantName?: string
  onToggle: (locker: Locker) => void
}) {
  const status = getLockerDisplayStatus(locker)
  const style = statusStyle[status]
  const clickable = !locker.assignedTo

  const cell = (
    <FlexBox
      alignItems="center"
      justifyContent="center"
      onClick={clickable ? () => onToggle(locker) : undefined}
      style={{
        width: 56,
        height: 56,
        borderRadius: 10,
        background: style.background,
        color: style.color,
        border: style.border,
        cursor: clickable ? 'pointer' : 'not-allowed',
        userSelect: 'none',
      }}
      title={clickable ? '클릭하여 선택가능/선택불가 전환' : undefined}
    >
      <Typography variant="label2" weight="medium">
        {locker.number}
      </Typography>
    </FlexBox>
  )

  if (locker.assignedTo) {
    return (
      <Tooltip mode="hover">
        <TooltipTrigger>{cell}</TooltipTrigger>
        <TooltipContent>{applicantName ? `${applicantName} 사용 중` : '사용자 정보 없음'}</TooltipContent>
      </Tooltip>
    )
  }

  return cell
}

function LegendItem({ status }: { status: LockerDisplayStatus }) {
  const style = statusStyle[status]
  return (
    <FlexBox alignItems="center" style={{ gap: 6 }}>
      <FlexBox
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          background: style.background,
          border: style.border,
        }}
      />
      <Typography variant="label2" color="semantic.label.alternative">
        {status}
      </Typography>
    </FlexBox>
  )
}

function LockerLayoutPanel() {
  const { lockers, applications, toggleLockerStatus } = useLockers()
  const toast = useToast()
  const applicantNameById = new Map(applications.map((application) => [application.id, application.name]))

  const handleToggle = (locker: Locker) => {
    toggleLockerStatus(locker.id)
    toast({
      content:
        locker.status === 'available'
          ? `${locker.number} 사물함을 선택불가로 변경했어요.`
          : `${locker.number} 사물함을 선택가능으로 변경했어요.`,
      variant: 'normal',
    })
  }

  return (
    <FlexBox flexDirection="column" style={{ gap: 24 }}>
      <FlexBox style={{ gap: 20 }}>
        <LegendItem status="선택가능" />
        <LegendItem status="선택불가" />
        <LegendItem status="배정됨" />
      </FlexBox>

      {LOCKER_ZONES.map((zone) => (
        <FlexBox key={zone} flexDirection="column" style={{ gap: 10 }}>
          <Typography variant="label1" weight="bold">
            {zone} 구역
          </Typography>
          <FlexBox style={{ gap: 10, flexWrap: 'wrap' }}>
            {lockers
              .filter((locker) => locker.zone === zone)
              .map((locker) => (
                <LockerCell
                  key={locker.id}
                  locker={locker}
                  applicantName={locker.assignedTo ? applicantNameById.get(locker.assignedTo) : undefined}
                  onToggle={handleToggle}
                />
              ))}
          </FlexBox>
        </FlexBox>
      ))}

      <Typography variant="caption1" color="semantic.label.alternative">
        선택가능/선택불가 상태인 사물함을 클릭하면 상태가 전환돼요. 배정된 사물함은 신청 현황 탭에서 배정을
        해제한 뒤 변경할 수 있어요.
      </Typography>
    </FlexBox>
  )
}

export default LockerLayoutPanel
