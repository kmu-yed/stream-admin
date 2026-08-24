import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { RentalItem, RentalItemInput, RentalRecord } from './types'

function addDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

const initialItems: RentalItem[] = [
  { id: 'item_1', name: '보조배터리', category: '전자기기', totalQuantity: 8 },
  { id: 'item_2', name: '우산', category: '생활잡화', totalQuantity: 10 },
  { id: 'item_3', name: '밴드', category: '상비약', totalQuantity: 20 },
  { id: 'item_4', name: '마스크', category: '위생용품', totalQuantity: 30 },
]

const initialRecords: RentalRecord[] = [
  {
    id: 'rec_1',
    itemId: 'item_1',
    itemName: '보조배터리',
    borrowerName: '김학생',
    borrowerStudentId: '20231234',
    borrowedAt: addDays(-2),
    dueDate: addDays(1),
  },
  {
    id: 'rec_2',
    itemId: 'item_2',
    itemName: '우산',
    borrowerName: '이대학',
    borrowerStudentId: '20220512',
    borrowedAt: addDays(-5),
    dueDate: addDays(-2),
  },
  {
    id: 'rec_3',
    itemId: 'item_3',
    itemName: '밴드',
    borrowerName: '박새내',
    borrowerStudentId: '20241001',
    borrowedAt: addDays(-6),
    dueDate: addDays(-4),
    returnedAt: addDays(-3),
  },
]

type RentalsContextValue = {
  items: RentalItem[]
  records: RentalRecord[]
  addItem: (input: RentalItemInput) => void
  updateItem: (id: string, input: RentalItemInput) => void
  deleteItem: (id: string) => void
}

const RentalsContext = createContext<RentalsContextValue | null>(null)

export function RentalsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<RentalItem[]>(initialItems)
  const [records] = useState<RentalRecord[]>(initialRecords)

  const value = useMemo<RentalsContextValue>(
    () => ({
      items,
      records,
      addItem: (input) => {
        setItems((prev) => [...prev, { ...input, id: makeId('item') }])
      },
      updateItem: (id, input) => {
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...input } : item)))
      },
      deleteItem: (id) => {
        setItems((prev) => prev.filter((item) => item.id !== id))
      },
    }),
    [items, records],
  )

  return <RentalsContext.Provider value={value}>{children}</RentalsContext.Provider>
}

export function useRentals() {
  const context = useContext(RentalsContext)
  if (!context) throw new Error('useRentals must be used within RentalsProvider')
  return context
}
