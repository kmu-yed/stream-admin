export type BannerCategory =
  | '제휴'
  | '슬랑제'
  | '간식행사'
  | '체육대회'
  | '해오름제'
  | '사물함'
  | '동문패널톡'
  | '기타'

export type BannerBadge = '제휴공지' | '일반공지'

export function getBannerBadge(category: BannerCategory): BannerBadge {
  return category === '제휴' ? '제휴공지' : '일반공지'
}

export type LandingType = 'notice' | 'external'

export type Banner = {
  id: string
  category: BannerCategory
  title: string
  subtitle: string
  imageUrl?: string
  logoUrl?: string
  landingType: LandingType
  noticeId?: string
  externalUrl?: string
  startDate: string
  endDate: string
  order: number
  createdAt: string
}

export type BannerInput = Omit<Banner, 'id' | 'order' | 'createdAt'>

export type BannerExposureStatus = '노출중' | '노출예정' | '노출종료'

export function getBannerExposureStatus(banner: Pick<Banner, 'startDate' | 'endDate'>): BannerExposureStatus {
  const today = new Date().toISOString().slice(0, 10)
  if (today < banner.startDate) return '노출예정'
  if (today > banner.endDate) return '노출종료'
  return '노출중'
}
