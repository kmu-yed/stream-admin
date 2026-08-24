export type ArchivePost = {
  id: string
  title: string
  coverImageUrl?: string
  photos: string[]
  date: string
  location: string
  department: string
  content: string
  linkedPageUrl?: string
  createdAt: string
}

export type ArchivePostInput = Omit<ArchivePost, 'id' | 'createdAt'>
