import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { RENTAL_CATALOG, RENTAL_ITEM_ICONS, type RentalItem, type RentalItemInput, type RentalItemType, type RentalRecord, type RentalRecordInput, type RentalRecordStatus } from './types'

function addDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 16).replace('T', ' ')
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

const initialItems: RentalItem[] = [
  { id: 'item_1', name: '보조배터리', category: '전자기기', itemKind: '대여품', totalQuantity: 8 },
  { id: 'item_2', name: '우산', category: '생활잡화', itemKind: '대여품', totalQuantity: 10 },
  { id: 'item_3', name: '밴드', category: '상비약', itemKind: '소모품', totalQuantity: 30 },
  { id: 'item_4', name: '마스크', category: '위생용품', itemKind: '소모품', totalQuantity: 30 },
  { id: 'item_5', name: '후시딘', category: '상비약', itemKind: '소모품', totalQuantity: 6 },
  { id: 'item_6', name: '고데기', category: '생활잡화', itemKind: '대여품', totalQuantity: 4 },
  { id: 'item_7', name: '알약', category: '상비약', itemKind: '소모품', totalQuantity: 20 },
  { id: 'item_8', name: '인공눈물', category: '상비약', itemKind: '소모품', totalQuantity: 8 },
  { id: 'item_9', name: '알콜스왑', category: '상비약', itemKind: '소모품', totalQuantity: 20 },
  { id: 'item_10', name: '노트북 충전기', category: '전자기기', itemKind: '대여품', totalQuantity: 5 },
  { id: 'item_11', name: '드라이기', category: '생활잡화', itemKind: '대여품', totalQuantity: 3 },
  { id: 'item_12', name: '파스', category: '상비약', itemKind: '대여품', totalQuantity: 15 },
  { id: 'item_13', name: '8핀 충전기', category: '전자기기', itemKind: '대여품', totalQuantity: 12 },
  { id: 'item_14', name: 'C to C', category: '전자기기', itemKind: '대여품', totalQuantity: 12 },
  { id: 'item_15', name: '생리대', category: '위생용품', itemKind: '소모품', totalQuantity: 24 },
]

const initialItemTypes: RentalItemType[] = Object.entries(RENTAL_CATALOG).flatMap(([category, names]) =>
  names.map((name) => ({
    id: `type_${category}_${name}`,
    name,
    category: category as RentalItemType['category'],
    icon: RENTAL_ITEM_ICONS[name] ?? '',
  })),
)

const initialRecords: RentalRecord[] = [
  {
    id: 'rec_1',
    itemId: 'item_1',
    itemName: '보조배터리',
    borrowerName: '김학생',
    borrowerStudentId: '20231234',
    borrowedAt: addDays(-2),
    dueDate: addDays(1),
    status: '대여중',
  },
  {
    id: 'rec_2',
    itemId: 'item_2',
    itemName: '우산',
    borrowerName: '이대학',
    borrowerStudentId: '20220512',
    borrowedAt: addDays(-5),
    dueDate: addDays(-2),
    status: '반납대기',
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
    status: '반납완료',
  },
  { id: 'rec_4', itemId: 'item_6', itemName: '고데기', borrowerName: '최학번', borrowerStudentId: '20211122', borrowedAt: addDays(-9), dueDate: addDays(-4), status: '대여중' },
  { id: 'rec_5', itemId: 'item_10', itemName: '노트북 충전기', borrowerName: '정학생', borrowerStudentId: '20230789', borrowedAt: addDays(-7), dueDate: addDays(-2), status: '대여중' },
  { id: 'rec_6', itemId: 'item_13', itemName: '8핀 충전기', borrowerName: '윤학생', borrowerStudentId: '20240888', borrowedAt: addDays(-6), dueDate: addDays(-1), status: '대여중' },
]

type RentalsContextValue = {
  items: RentalItem[]
  itemTypes: RentalItemType[]
  records: RentalRecord[]
  addItem: (input: RentalItemInput) => void
  updateItem: (id: string, input: RentalItemInput) => void
  deleteItem: (id: string) => void
  addItemType: (input: Omit<RentalItemType, 'id'>) => void
  addRentalRecord: (input: RentalRecordInput) => void
  updateRentalRecordStatus: (id: string, status: RentalRecordStatus) => void
}

const RentalsContext = createContext<RentalsContextValue | null>(null)

export function RentalsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<RentalItem[]>(initialItems)
  const [itemTypes, setItemTypes] = useState<RentalItemType[]>(initialItemTypes)
  const [records, setRecords] = useState<RentalRecord[]>(initialRecords)

  const value = useMemo<RentalsContextValue>(
    () => ({
      items,
      itemTypes,
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
      addItemType: (input) => {
        setItemTypes((prev) => [...prev, { ...input, id: makeId('item_type') }])
      },
      addRentalRecord: (input) => {
        setRecords((prev) => [{ ...input, id: makeId('rec') }, ...prev])
      },
      updateRentalRecordStatus: (id, status) => {
        setRecords((prev) => prev.map((record) => (record.id === id ? { ...record, status } : record)))
      },
    }),
    [items, itemTypes, records],
  )

  return <RentalsContext.Provider value={value}>{children}</RentalsContext.Provider>
}

export function useRentals() {
  const context = useContext(RentalsContext)
  if (!context) throw new Error('useRentals must be used within RentalsProvider')
  return context
}
