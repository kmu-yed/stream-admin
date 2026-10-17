export type ArchivePost = {
  id: string
  title: string
  coverImageUrl?: string
  photos: string[]
  date: string
  endDate?: string
  location: string
  department: string
  content: string
  linkedPageUrl?: string
  includeInSlangje: boolean
  createdAt: string
}

export type ArchivePostInput = Omit<ArchivePost, 'id' | 'createdAt'>

export function formatArchivePeriod(post: Pick<ArchivePost, 'date' | 'endDate'>) {
  return post.endDate ? `${post.date} ~ ${post.endDate}` : post.date
}
