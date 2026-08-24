import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { PolicyDocId, PolicyDocument } from './types'

function addDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

const initialDocuments: PolicyDocument[] = [
  {
    id: 'privacy',
    title: '개인정보 처리방침',
    content:
      'Stream(이하 "서비스")은 학생회 서비스 운영을 위해 최소한의 개인정보만을 수집하며, 관련 법령에 따라 안전하게 관리합니다.\n\n1. 수집 항목: 이름, 학번, 학과\n2. 수집 목적: 행사 신청, 사물함 배정, 학생회비 납부 확인\n3. 보유 기간: 수집일로부터 1년 또는 목적 달성 시까지',
    updatedAt: addDays(-30),
  },
  {
    id: 'terms',
    title: '서비스 이용약관',
    content:
      '제1조 (목적)\n이 약관은 Stream이 제공하는 학생회 서비스 이용과 관련하여 서비스와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.\n\n제2조 (이용자의 의무)\n이용자는 신청 절차에서 허위 정보를 입력해서는 안 됩니다.',
    updatedAt: addDays(-30),
  },
]

type PoliciesContextValue = {
  documents: PolicyDocument[]
  updateDocument: (id: PolicyDocId, content: string) => void
}

const PoliciesContext = createContext<PoliciesContextValue | null>(null)

export function PoliciesProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<PolicyDocument[]>(initialDocuments)

  const value = useMemo<PoliciesContextValue>(
    () => ({
      documents,
      updateDocument: (id, content) => {
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === id ? { ...doc, content, updatedAt: new Date().toISOString().slice(0, 10) } : doc,
          ),
        )
      },
    }),
    [documents],
  )

  return <PoliciesContext.Provider value={value}>{children}</PoliciesContext.Provider>
}

export function usePolicies() {
  const context = useContext(PoliciesContext)
  if (!context) throw new Error('usePolicies must be used within PoliciesProvider')
  return context
}
