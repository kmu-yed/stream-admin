export type PolicyDocId = 'privacy' | 'terms'

export type PolicyDocument = {
  id: PolicyDocId
  title: string
  content: string
  updatedAt: string
}
