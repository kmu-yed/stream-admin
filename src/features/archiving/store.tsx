import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { ArchivePost, ArchivePostInput } from './types'

function addDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

const initialPosts: ArchivePost[] = [
  {
    id: 'arc_1',
    title: '2026년 해오름제 현장 스케치',
    photos: [],
    date: '2025-10-20',
    location: '중앙광장',
    department: '문화기획국',
    content: '올해 해오름제는 역대 최다 인원이 참여한 가운데 성황리에 마무리되었습니다.',
    createdAt: addDays(-15),
  },
  {
    id: 'arc_2',
    title: '신입생 새내기 배움터 후기',
    photos: [],
    date: '2026-03-06',
    location: '대운동장',
    department: '학생복지국',
    content: '신입생들과 함께한 새내기 배움터 현장을 아카이빙합니다.',
    createdAt: addDays(-8),
  },
  {
    id: 'arc_3',
    title: '동문패널톡 준비 현장',
    photos: [],
    date: '2026-08-20',
    location: '학생회관 대강당',
    department: '대외협력국',
    content: '동문패널톡 진행을 위한 사전 준비 과정을 정리 중입니다.',
    createdAt: addDays(-1),
  },
]

type ArchivingContextValue = {
  posts: ArchivePost[]
  addPost: (input: ArchivePostInput) => ArchivePost
  updatePost: (id: string, input: ArchivePostInput) => void
  deletePost: (id: string) => void
}

const ArchivingContext = createContext<ArchivingContextValue | null>(null)

export function ArchivingProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<ArchivePost[]>(initialPosts)

  const value = useMemo<ArchivingContextValue>(
    () => ({
      posts,
      addPost: (input) => {
        const post: ArchivePost = { ...input, id: makeId('arc'), createdAt: new Date().toISOString().slice(0, 10) }
        setPosts((prev) => [post, ...prev])
        return post
      },
      updatePost: (id, input) => {
        setPosts((prev) => prev.map((post) => (post.id === id ? { ...post, ...input } : post)))
      },
      deletePost: (id) => {
        setPosts((prev) => prev.filter((post) => post.id !== id))
      },
    }),
    [posts],
  )

  return <ArchivingContext.Provider value={value}>{children}</ArchivingContext.Provider>
}

export function useArchiving() {
  const context = useContext(ArchivingContext)
  if (!context) throw new Error('useArchiving must be used within ArchivingProvider')
  return context
}
