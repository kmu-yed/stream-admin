import { useState, type ReactNode } from 'react'
import { Button, FlexBox, TextField, Typography, useToast } from '@wanteddev/wds'
import PageHeader from '../../components/common/PageHeader'
import FormItem from '../../components/common/FormItem'
import { useAuth } from '../auth/store'

function Card({ children }: { children: ReactNode }) { return <FlexBox flexDirection="column" style={{ gap: 20, maxWidth: 600, padding: 24, border: '1px solid var(--semantic-line-normal-normal)', borderRadius: 16 }}>{children}</FlexBox> }

export default function SettingsPage() {
  const toast = useToast(); const { commonPassword, updateCommonPassword } = useAuth(); const [passwordEditing, setPasswordEditing] = useState(false); const [currentPassword, setCurrentPassword] = useState(''); const [newPassword, setNewPassword] = useState(''); const [confirmPassword, setConfirmPassword] = useState('')
  const resetPassword = () => { setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPasswordEditing(false) }
  return <><PageHeader title="공통 비밀번호 관리" description="Stream 관리자 접근에 사용하는 공통 비밀번호예요." /><Card><FlexBox justifyContent="space-between" alignItems="center"><Typography variant="body1" weight="medium">공통 비밀번호</Typography>{!passwordEditing && <Button variant="outlined" color="primary" onClick={() => setPasswordEditing(true)}>변경</Button>}</FlexBox>{passwordEditing && <><FormItem label="현재 비밀번호"><TextField type="password" value={currentPassword} placeholder="현재 비밀번호를 입력하세요" onChange={(e) => setCurrentPassword(e.target.value)} /></FormItem><FormItem label="새 비밀번호"><TextField type="password" value={newPassword} placeholder="새 비밀번호를 입력하세요" onChange={(e) => setNewPassword(e.target.value)} /></FormItem><FormItem label="새 비밀번호 확인"><TextField type="password" value={confirmPassword} placeholder="새 비밀번호를 다시 입력하세요" onChange={(e) => setConfirmPassword(e.target.value)} /></FormItem><FlexBox justifyContent="flex-end" style={{ gap: 8 }}><Button variant="outlined" color="assistive" onClick={resetPassword}>취소</Button><Button variant="solid" color="primary" onClick={() => { if (currentPassword !== commonPassword || !newPassword || newPassword !== confirmPassword) return; updateCommonPassword(newPassword); resetPassword(); toast({ content: '공통 비밀번호를 변경했어요.', variant: 'positive' }) }}>변경</Button></FlexBox></>}</Card></>
}
