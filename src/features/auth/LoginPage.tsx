import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, FlexBox, TextField, Typography } from '@wanteddev/wds'
import FormItem from '../../components/common/FormItem'
import { useAuth } from './store'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/'

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!/^\d{8,}$/.test(studentId.trim())) {
      setError('학번은 숫자 8자리 이상으로 입력해주세요.')
      return
    }
    if (!login(studentId, password)) {
      setError('학번 또는 공용 비밀번호를 확인해주세요.')
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <FlexBox className="login-page" alignItems="center" justifyContent="center" style={{ minHeight: '100vh', padding: 24 }}>
      <FlexBox as="form" onSubmit={submit} flexDirection="column" style={{ width: '100%', maxWidth: 420, gap: 28, padding: 36, border: '1px solid var(--semantic-line-normal-normal)', borderRadius: 20, background: 'var(--semantic-background-normal-normal)', boxShadow: '0 18px 48px rgba(20, 35, 60, .12)' }}>
        <FlexBox flexDirection="column" alignItems="center" style={{ gap: 12, textAlign: 'center' }}>
          <img src="/brand/favicon.png" alt="Stream" style={{ width: 48, height: 48, objectFit: 'contain' }} />
          <FlexBox flexDirection="column" style={{ gap: 6 }}>
            <Typography variant="heading2" weight="bold">Stream 관리자</Typography>
          </FlexBox>
        </FlexBox>

        <FlexBox flexDirection="column" style={{ gap: 18 }}>
          <FormItem label="학번" error={error && !studentId.trim() ? error : undefined}>
            <TextField inputMode="numeric" value={studentId} placeholder="학번을 입력하세요" onChange={(event) => { setStudentId(event.target.value); setError('') }} />
          </FormItem>
          <FormItem label="공용 비밀번호" error={error && studentId.trim() ? error : undefined}>
            <TextField type="password" value={password} placeholder="공용 비밀번호를 입력하세요" onChange={(event) => { setPassword(event.target.value); setError('') }} />
          </FormItem>
        </FlexBox>

        <Button type="submit" variant="solid" color="primary" style={{ width: '100%' }}>로그인</Button>
      </FlexBox>
    </FlexBox>
  )
}

export default LoginPage
