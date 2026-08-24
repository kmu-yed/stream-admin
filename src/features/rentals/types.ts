export type RentalCategory = '전자기기' | '생활잡화' | '상비약' | '위생용품'

export const RENTAL_CATEGORIES: RentalCategory[] = ['전자기기', '생활잡화', '상비약', '위생용품']

export const RENTAL_CATALOG: Record<RentalCategory, string[]> = {
  전자기기: ['보조배터리', '노트북 충전기(C타입)', '8핀 충전기', '케이블(C to C)'],
  생활잡화: ['고데기', '우산', '드라이기'],
  상비약: ['종합감기약', '위장약', '후시딘', '파스', '이지엔6', '타이레놀', '인공눈물', '밴드'],
  위생용품: ['마스크', '알콜스왑', '생리대(대형)', '생리대(소형)'],
}

export type RentalItem = {
  id: string
  name: string
  category: RentalCategory
  totalQuantity: number
}

export type RentalItemInput = Omit<RentalItem, 'id'>

export type RentalRecord = {
  id: string
  itemId: string
  itemName: string
  borrowerName: string
  borrowerStudentId: string
  borrowedAt: string
  dueDate: string
  returnedAt?: string
}

export type RentalRecordStatus = '대여중' | '연체' | '반납완료'

export function getRentalRecordStatus(record: Pick<RentalRecord, 'dueDate' | 'returnedAt'>): RentalRecordStatus {
  if (record.returnedAt) return '반납완료'
  const today = new Date().toISOString().slice(0, 10)
  return today > record.dueDate ? '연체' : '대여중'
}

export function getAvailableQuantity(item: RentalItem, records: RentalRecord[]) {
  const borrowed = records.filter((r) => r.itemId === item.id && !r.returnedAt).length
  return item.totalQuantity - borrowed
}
