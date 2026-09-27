import { useLocation, useNavigate } from 'react-router-dom'
import { FlexBox, TextButton, Typography } from '@wanteddev/wds'
import { IconChevronRightSmall } from '@wanteddev/wds-icon'
import { navItems } from '../nav/navConfig'

type BreadcrumbItem = {
  label: string
  path: string
}

const TAB_ROOT_PATHS = new Set([
  '/',
  '/events',
  '/notices',
  '/archiving',
  '/admins',
  '/display',
  '/student-council',
  '/lockers',
  '/feedback',
  '/rentals',
  '/home-banner',
  '/chatbot',
  '/policies',
])

function getPageBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const root = [...navItems]
    .filter((item) => item.path !== '/' && pathname.startsWith(item.path))
    .sort((a, b) => b.path.length - a.path.length)[0] ?? navItems.find((item) => item.path === '/')!
  const items: BreadcrumbItem[] = [{ label: root.label, path: root.path }]

  if (/^\/events\/new$/.test(pathname)) items.push({ label: '새 행사 등록', path: pathname })
  else if (/^\/events\/[^/]+\/edit$/.test(pathname)) items.push({ label: '행사 수정', path: pathname })
  else if (/^\/events\/[^/]+\/applicants$/.test(pathname)) items.push({ label: '신청 현황', path: pathname })
  else if (/^\/lockers\/schedule\/new$/.test(pathname)) items.push({ label: '신청 일정', path: '/lockers?tab=schedule' }, { label: '새 학기 신청 일정 등록', path: pathname })
  else if (/^\/lockers\/schedule\/[^/]+\/edit$/.test(pathname)) items.push({ label: '신청 일정', path: '/lockers?tab=schedule' }, { label: '신청 일정 수정', path: pathname })
  else if (/^\/notices\/new$/.test(pathname)) items.push({ label: '새 공지 등록', path: pathname })
  else if (/^\/notices\/[^/]+\/edit$/.test(pathname)) items.push({ label: '공지 수정', path: pathname })
  else if (/^\/feedback\/rounds\/new$/.test(pathname)) items.push({ label: '사용자 질문', path: '/feedback?tab=questions' }, { label: 'N차 피드백 등록', path: pathname })
  else if (/^\/feedback\/rounds\/[^/]+\/edit$/.test(pathname)) items.push({ label: '피드백 회차 수정', path: pathname })
  else if (/^\/home-banner\/new$/.test(pathname)) items.push({ label: '새 배너 등록', path: pathname })
  else if (/^\/home-banner\/[^/]+\/edit$/.test(pathname)) items.push({ label: '배너 수정', path: pathname })
  else if (/^\/archiving\/new$/.test(pathname)) items.push({ label: '새 게시물 등록', path: pathname })
  else if (/^\/archiving\/[^/]+\/edit$/.test(pathname)) items.push({ label: '게시물 수정', path: pathname })
  else if (/^\/rentals\/items\/new$/.test(pathname)) items.push({ label: '물품 관리', path: '/rentals?tab=items' }, { label: '물품 등록', path: pathname })
  else if (/^\/rentals\/items\/[^/]+\/edit$/.test(pathname)) items.push({ label: '물품 관리', path: '/rentals?tab=items' }, { label: '물품 수정', path: pathname })
  else if (/^\/rentals\/records\/new$/.test(pathname)) items.push({ label: '대여/반납 현황', path: '/rentals?tab=records' }, { label: '대여 추가하기', path: pathname })
  else if (/^\/chatbot\/faq\/new$/.test(pathname)) items.push({ label: '새 FAQ 등록', path: pathname })
  else if (/^\/chatbot\/faq\/[^/]+\/edit$/.test(pathname)) items.push({ label: 'FAQ 수정', path: pathname })

  return items
}

function Breadcrumbs() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  if (TAB_ROOT_PATHS.has(pathname)) return null
  const items = getPageBreadcrumbs(pathname)

  return (
    <FlexBox alignItems="center" style={{ gap: 8, marginBottom: 16, minHeight: 24 }}>
      {items.map((item, index) => {
        const isCurrent = index === items.length - 1
        return (
          <FlexBox key={item.path} alignItems="center" style={{ gap: 8 }}>
            {isCurrent ? (
              <Typography variant="label1" weight="bold" color="semantic.label.normal">
                {item.label}
              </Typography>
            ) : (
              <TextButton size="small" color="assistive" style={{ color: 'var(--semantic-label-assistive)' }} onClick={() => navigate(item.path)}>
                {item.label}
              </TextButton>
            )}
            {!isCurrent && <IconChevronRightSmall width={14} height={14} style={{ color: 'var(--semantic-label-assistive)' }} />}
          </FlexBox>
        )
      })}
    </FlexBox>
  )
}

export default Breadcrumbs
