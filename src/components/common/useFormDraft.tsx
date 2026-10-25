import { useEffect, useRef, useState } from 'react'
import { useBlocker } from 'react-router-dom'
import { Button, FlexBox, Typography, useToast } from '@wanteddev/wds'
import ConfirmModal from './ConfirmModal'

// Object URLs expire after reload, so uploaded images must be stored as data URLs.
async function persistImages(value: unknown): Promise<unknown> {
  if (typeof value === 'string' && value.startsWith('blob:')) {
    const response = await fetch(value)
    if (!response.ok) throw new Error('Cannot read uploaded image')
    const blob = await response.blob()
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })
  }
  if (Array.isArray(value)) return Promise.all(value.map(persistImages))
  if (value && typeof value === 'object') {
    return Object.fromEntries(await Promise.all(Object.entries(value).map(async ([key, entry]) => [key, await persistImages(entry)])))
  }
  return value
}

// Navigation protection and explicit local drafts shared by registration forms.
export default function useFormDraft<T>(key: string, value: T, restore: (value: T) => void) {
  const storageKey = `stream-form-draft:${key}`
  const serialized = JSON.stringify(value)
  const baseline = useRef(serialized)
  const current = useRef(serialized)
  current.current = serialized
  const toast = useToast()
  const leaving = useRef(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<string | null>(() => {
    try { return localStorage.getItem(storageKey) } catch { return null }
  })
  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    baseline.current !== current.current &&
    (currentLocation.pathname !== nextLocation.pathname || currentLocation.search !== nextLocation.search),
  )
  useEffect(() => {
    const handleUnload = (event: BeforeUnloadEvent) => {
      if (baseline.current === current.current) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [])

  const markSaved = () => {
    baseline.current = current.current
    try { localStorage.removeItem(storageKey) } catch { /* Saving the form must still succeed. */ }
    setSaved(null)
  }
  const saveDraft = async () => {
    setSaving(true)
    try {
      const snapshot = JSON.stringify(await persistImages(JSON.parse(serialized)))
      localStorage.setItem(storageKey, snapshot)
      setSaved(snapshot)
      toast({ content: '이 브라우저에 임시저장했어요.', variant: 'positive' })
    } catch {
      toast({ content: '임시저장 공간이 부족하거나 사용할 수 없어요. 이미지를 줄인 뒤 다시 시도해 주세요.', variant: 'negative' })
    } finally {
      setSaving(false)
    }
  }
  const draftControls = <FlexBox alignItems="center" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
    <Button size="small" variant="outlined" color="assistive" disabled={saving || serialized === baseline.current} onClick={saveDraft}>{saving ? '저장 중…' : '임시저장'}</Button>
    {saved && <Button size="small" variant="outlined" color="assistive" onClick={() => {
      try { restore(JSON.parse(saved) as T); toast({ content: '임시저장한 내용을 불러왔어요.', variant: 'positive' }) }
      catch { toast({ content: '임시저장한 내용을 불러올 수 없어요.', variant: 'negative' }) }
    }}>임시저장 불러오기</Button>}
    {saved && <Typography variant="caption1" color="semantic.label.alternative">이 브라우저에 임시저장된 내용이 있어요.</Typography>}
  </FlexBox>
  const navigationGuard = <ConfirmModal open={blocker.state === 'blocked'} onOpenChange={(open) => { if (!open && !leaving.current && blocker.state === 'blocked') blocker.reset() }} title="작성 중인 내용을 두고 나갈까요?" description="저장하지 않은 변경사항은 사라져요. 필요한 내용은 돌아가서 임시저장해 주세요." cancelLabel="계속 작성" confirmLabel="나가기" tone="negative" onConfirm={() => { if (blocker.state === 'blocked') { leaving.current = true; blocker.proceed() } }} />
  return { markSaved, draftControls, navigationGuard }
}
