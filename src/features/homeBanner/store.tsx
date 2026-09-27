import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Banner, BannerInput } from './types'

function addDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

const initialBanners: Banner[] = [
  {
    id: 'bnr_1',
    category: '제휴',
    title: '교내 카페 제휴 할인 이벤트',
    subtitle: 'Stream 학생회와 함께하는 제휴 혜택',
    landingType: 'notice',
    noticeId: 'ntc_2',
    startDate: addDays(-1),
    endDate: addDays(13),
    order: 1,
    createdAt: addDays(-1),
  },
  {
    id: 'bnr_2',
    category: '사물함',
    title: '2026-2학기 사물함 신청 오픈',
    subtitle: '신청 기간을 확인해주세요',
    landingType: 'notice',
    noticeId: 'ntc_3',
    startDate: addDays(-10),
    endDate: addDays(-2),
    order: 2,
    createdAt: addDays(-10),
  },
  {
    id: 'bnr_3',
    category: '해오름제',
    title: '2026 해오름제, 지금 신청하세요',
    subtitle: '새로운 만남을 시작해요',
    landingType: 'external',
    externalUrl: 'https://stream.ac.kr/events/haeorm',
    startDate: addDays(2),
    endDate: addDays(20),
    order: 3,
    createdAt: addDays(0),
  },
]

type HomeBannerContextValue = {
  banners: Banner[]
  addBanner: (input: BannerInput) => Banner
  updateBanner: (id: string, input: BannerInput) => void
  deleteBanner: (id: string) => void
  reorderBanner: (draggedId: string, targetId: string) => void
}

const HomeBannerContext = createContext<HomeBannerContextValue | null>(null)

export function HomeBannerProvider({ children }: { children: ReactNode }) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners)

  const value = useMemo<HomeBannerContextValue>(
    () => ({
      banners,
      addBanner: (input) => {
        const nextOrder = banners.reduce((max, b) => Math.max(max, b.order), 0) + 1
        const banner: Banner = {
          ...input,
          id: makeId('bnr'),
          order: nextOrder,
          createdAt: new Date().toISOString().slice(0, 10),
        }
        setBanners((prev) => [...prev, banner])
        return banner
      },
      updateBanner: (id, input) => {
        setBanners((prev) => prev.map((banner) => (banner.id === id ? { ...banner, ...input } : banner)))
      },
      deleteBanner: (id) => {
        setBanners((prev) => prev.filter((banner) => banner.id !== id))
      },
      reorderBanner: (draggedId, targetId) => {
        if (draggedId === targetId) return
        setBanners((prev) => {
          const sorted = [...prev].sort((a, b) => a.order - b.order)
          const fromIndex = sorted.findIndex((b) => b.id === draggedId)
          const toIndex = sorted.findIndex((b) => b.id === targetId)
          if (fromIndex === -1 || toIndex === -1) return prev
          const [moved] = sorted.splice(fromIndex, 1)
          sorted.splice(toIndex, 0, moved)
          return sorted.map((banner, index) => ({ ...banner, order: index + 1 }))
        })
      },
    }),
    [banners],
  )

  return <HomeBannerContext.Provider value={value}>{children}</HomeBannerContext.Provider>
}

export function useHomeBanner() {
  const context = useContext(HomeBannerContext)
  if (!context) throw new Error('useHomeBanner must be used within HomeBannerProvider')
  return context
}
