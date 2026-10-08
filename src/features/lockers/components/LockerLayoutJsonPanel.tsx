import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, FlexBox, Option, Select, Typography, useToast } from '@wanteddev/wds'
import ConfirmModal from '../../../components/common/ConfirmModal'
import { useLockers } from '../store'
import { LOCKER_PHYSICAL_LAYOUTS, LOCKER_ZONES, type LockerLayoutGroup, type LockerZone } from '../types'

type LayoutJson = { zone: LockerZone; groups: LockerLayoutGroup[] }

const toJson = (zone: LockerZone, groups: LockerLayoutGroup[]) =>
  JSON.stringify({ zone, groups }, null, 2)

function parseLayout(value: string): LayoutJson | null {
  try {
    const parsed = JSON.parse(value)
    if (
      !parsed ||
      !LOCKER_ZONES.includes(parsed.zone) ||
      !Array.isArray(parsed.groups) ||
      !parsed.groups.every(
        (group: LockerLayoutGroup) =>
          Number.isInteger(group.columns) &&
          group.columns > 0 &&
          Array.isArray(group.numbers) &&
          group.numbers.every(Number.isFinite),
      )
    ) return null
    return parsed
  } catch {
    return null
  }
}

export default function LockerLayoutJsonPanel() {
  const toast = useToast()
  const { layouts, updateLayout } = useLockers()
  const [zone, setZone] = useState<LockerZone>('A-1')
  const [editing, setEditing] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [value, setValue] = useState(() => toJson('A-1', layouts['A-1']))
  const parsed = useMemo(() => parseLayout(value), [value])
  const lineCount = Math.max(18, value.split('\n').length)

  const changeZone = (next: LockerZone) => {
    setZone(next)
    setValue(toJson(next, layouts[next]))
    setEditing(false)
  }

  const save = useCallback(() => {
    if (!parsed || parsed.zone !== zone) {
      toast({ content: '선택한 구역과 일치하는 유효한 JSON을 입력해주세요.', variant: 'negative' })
      return
    }
    updateLayout(zone, parsed.groups)
    setValue(toJson(zone, parsed.groups))
    setEditing(false)
    toast({ content: '레이아웃 JSON 내용을 저장했어요.', variant: 'positive' })
  }, [parsed, zone, updateLayout, toast])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's' && editing) {
        event.preventDefault()
        save()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editing, save])

  return (
    <FlexBox className="locker-json-panel" flexDirection="column" style={{ gap: 16 }}>
      <FlexBox className="locker-json-toolbar" alignItems="center" style={{ gap: 12 }}>
        <Typography variant="body2" color="semantic.label.alternative" style={{ flex: 1, minWidth: 240 }}>
          구역별 배치 데이터를 수정하면 구역 관리 화면에도 즉시 반영돼요.
        </Typography>
        <FlexBox className="locker-json-actions" alignItems="center" style={{ gap: 8 }}>
          <Select value={zone} onChange={(next) => changeZone(next as LockerZone)} style={{ width: 140, height: 40 }}>
            {LOCKER_ZONES.map((item) => <Option key={item} value={item}>{item} 구역</Option>)}
          </Select>
          {editing ? (
            <>
              <Button variant="outlined" color="assistive" size="medium" style={{ height: 40 }} onClick={() => setConfirmOpen(true)}>템플릿 불러오기</Button>
              <Button variant="outlined" color="assistive" size="medium" style={{ height: 40 }} onClick={() => { setValue(toJson(zone, layouts[zone])); setEditing(false) }}>취소</Button>
              <Button variant="solid" color="primary" size="medium" style={{ height: 40 }} onClick={save}>저장</Button>
            </>
          ) : (
            <Button variant="outlined" color="primary" size="medium" style={{ height: 40 }} onClick={() => setEditing(true)}>수정</Button>
          )}
        </FlexBox>
      </FlexBox>

      <div className="locker-json-layout">
        <FlexBox flexDirection="column" style={{ minWidth: 0, overflow: 'hidden', border: '1px solid #2a2d35', borderRadius: 16, background: '#1e1e1e' }}>
          <FlexBox alignItems="center" justifyContent="space-between" style={{ height: 42, padding: '0 14px', borderBottom: '1px solid #30343d', background: '#25262b' }}>
            <Typography variant="caption1" style={{ color: '#b8c0cc', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>{zone.toLowerCase()}-layout.json</Typography>
            <Typography variant="caption1" style={{ color: editing ? '#65b7ff' : '#7f8793' }}>{editing ? '편집 중 · Ctrl + S로 저장' : '읽기 전용'}</Typography>
          </FlexBox>
          <div style={{ display: 'grid', gridTemplateColumns: '40px minmax(0, 1fr)', minHeight: 440 }}>
            <pre aria-hidden="true" style={{ margin: 0, padding: '16px 8px', textAlign: 'right', color: '#6b7280', background: '#191a1e', font: '12px/1.62 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', userSelect: 'none' }}>{Array.from({ length: lineCount }, (_, index) => index + 1).join('\n')}</pre>
            <textarea aria-label="레이아웃 JSON 코드" readOnly={!editing} spellCheck={false} value={value} onChange={(event) => setValue(event.target.value)} style={{ width: '100%', minHeight: 440, resize: 'vertical', boxSizing: 'border-box', padding: 16, border: 0, outline: 0, background: '#1e1e1e', color: '#d4d4d4', font: '12px/1.62 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', caretColor: '#fff', opacity: editing ? 1 : .78 }} />
          </div>
        </FlexBox>

        <FlexBox flexDirection="column" style={{ gap: 12, minWidth: 0, padding: 24, border: '1px solid var(--semantic-line-normal-normal)', borderRadius: 16 }}>
          <FlexBox justifyContent="space-between" alignItems="center" style={{ gap: 8, flexWrap: 'wrap' }}>
            <Typography variant="body1" weight="bold">배치도 미리보기</Typography>
            <Typography variant="caption1" color={parsed ? 'semantic.label.alternative' : 'semantic.status.negative'}>{parsed ? '코드 변경사항 반영됨' : 'JSON 형식 오류'}</Typography>
          </FlexBox>
          {parsed ? (
            <div style={{ overflowX: 'auto', padding: '18px 0 4px' }}>
              <FlexBox alignItems="flex-start" style={{ width: 'max-content', minWidth: '100%', gap: 18 }}>
                {parsed.groups.map((group, groupIndex) => (
                  <div key={groupIndex} style={{ display: 'grid', gridTemplateColumns: `repeat(${group.columns}, 36px)`, gap: 6 }}>
                    {group.numbers.map((number, index) => (
                      <FlexBox key={`${number}-${index}`} alignItems="center" justifyContent="center" style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--semantic-line-normal-normal)', background: 'var(--semantic-background-normal-normal)' }}>
                        <Typography variant="caption1" weight="medium">{number}</Typography>
                      </FlexBox>
                    ))}
                  </div>
                ))}
              </FlexBox>
            </div>
          ) : (
            <FlexBox alignItems="center" justifyContent="center" style={{ flex: 1, minHeight: 220, borderRadius: 8, background: 'var(--semantic-fill-normal)' }}>
              <Typography variant="body2" color="semantic.label.alternative">유효한 JSON을 입력하면 미리보기가 표시돼요.</Typography>
            </FlexBox>
          )}
        </FlexBox>
      </div>
      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="기본 템플릿을 불러올까요?"
        description="현재 수정 중인 JSON 내용은 기본 템플릿으로 교체돼요."
        confirmLabel="불러오기"
        onConfirm={() => {
          setValue(toJson(zone, LOCKER_PHYSICAL_LAYOUTS[zone]))
          setEditing(false)
          toast({ content: '기본 템플릿을 불러왔어요.', variant: 'positive' })
        }}
      />
    </FlexBox>
  )
}
