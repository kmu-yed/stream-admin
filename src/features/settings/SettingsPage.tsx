import { useState } from 'react'
import { Button, FlexBox, TextField, Typography, useToast } from '@wanteddev/wds'
import PageHeader from '../../components/common/PageHeader'
import FormItem from '../../components/common/FormItem'
import FormSection from '../../components/common/FormSection'
import { useAuth } from '../auth/store'

type PasswordErrors = Partial<Record<'current' | 'new' | 'confirm', string>>

export default function SettingsPage() {
  const toast = useToast()
  const { commonPassword, updateCommonPassword } = useAuth()
  const [passwordEditing, setPasswordEditing] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<PasswordErrors>({})

  const resetPassword = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setErrors({})
    setPasswordEditing(false)
  }

  const savePassword = () => {
    const nextErrors: PasswordErrors = {}
    if (!currentPassword) nextErrors.current = '현재 비밀번호를 입력해 주세요.'
    else if (currentPassword !== commonPassword) nextErrors.current = '현재 비밀번호가 일치하지 않아요.'
    if (!newPassword) nextErrors.new = '새 비밀번호를 입력해 주세요.'
    if (!confirmPassword) nextErrors.confirm = '새 비밀번호를 다시 입력해 주세요.'
    else if (newPassword && newPassword !== confirmPassword) nextErrors.confirm = '새 비밀번호가 일치하지 않아요.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    updateCommonPassword(newPassword)
    resetPassword()
    toast({ content: '공통 비밀번호를 변경했어요.', variant: 'positive' })
  }

  return <>
    <PageHeader title="공통 비밀번호 관리" description="stream 관리자 접근에 사용하는 공통 비밀번호예요." />
    <FormSection style={{ maxWidth: 600 }}>
      <FlexBox justifyContent="space-between" alignItems="center">
        <Typography variant="body1" weight="medium">공통 비밀번호</Typography>
        {!passwordEditing && <Button variant="outlined" color="primary" onClick={() => setPasswordEditing(true)}>변경</Button>}
      </FlexBox>
      {passwordEditing && <>
        <FormItem label="현재 비밀번호" error={errors.current}>
          <TextField type="password" value={currentPassword} placeholder="현재 비밀번호를 입력하세요" onChange={(event) => { setCurrentPassword(event.target.value); setErrors((previous) => ({ ...previous, current: undefined })) }} />
        </FormItem>
        <FormItem label="새 비밀번호" error={errors.new}>
          <TextField type="password" value={newPassword} placeholder="새 비밀번호를 입력하세요" onChange={(event) => { setNewPassword(event.target.value); setErrors((previous) => ({ ...previous, new: undefined, confirm: undefined })) }} />
        </FormItem>
        <FormItem label="새 비밀번호 확인" error={errors.confirm}>
          <TextField type="password" value={confirmPassword} placeholder="새 비밀번호를 다시 입력하세요" onChange={(event) => { setConfirmPassword(event.target.value); setErrors((previous) => ({ ...previous, confirm: undefined })) }} />
        </FormItem>
        <FlexBox justifyContent="flex-end" style={{ gap: 8 }}>
          <Button variant="outlined" color="assistive" onClick={resetPassword}>취소</Button>
          <Button variant="solid" color="primary" onClick={savePassword}>변경</Button>
        </FlexBox>
      </>}
    </FormSection>
  </>
}
