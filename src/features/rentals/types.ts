export type RentalCategory = string

export const RENTAL_CATEGORIES: RentalCategory[] = ['전자기기', '생활잡화', '상비약', '위생용품']

export const RENTAL_CATALOG: Record<string, string[]> = {
  전자기기: ['보조배터리', '노트북 충전기', '8핀 충전기', 'C to C'],
  생활잡화: ['고데기', '우산', '드라이기'],
  상비약: ['후시딘', '알약', '인공눈물', '알콜스왑', '파스', '밴드'],
  위생용품: ['마스크', '생리대'],
}

export const RENTAL_ITEM_ICONS: Record<string, string> = {
  보조배터리: '/rental-item-icons/battery.svg',
  우산: '/rental-item-icons/umbrella.svg',
  후시딘: '/rental-item-icons/fucidin.png',
  고데기: '/rental-item-icons/curler.svg',
  알약: '/rental-item-icons/pill.svg',
  인공눈물: '/rental-item-icons/eye-drops.svg',
  알콜스왑: '/rental-item-icons/alcohol-swap.png',
  '노트북 충전기': '/rental-item-icons/laptop-charger.svg',
  마스크: '/rental-item-icons/mask.svg',
  드라이기: '/rental-item-icons/dryer.svg',
  파스: '/rental-item-icons/patch.png',
  '8핀 충전기': '/rental-item-icons/lightning-charger.svg',
  'C to C': '/rental-item-icons/c-to-c.svg',
  생리대: '/rental-item-icons/sanitary-pad.svg',
  밴드: '/rental-item-icons/bandage.svg',
}

export type RentalItem = {
  id: string
  name: string
  category: RentalCategory
  itemKind: RentalItemKind
  totalQuantity: number
}

export type RentalItemKind = '대여품' | '소모품'

export type RentalItemType = {
  id: string
  name: string
  category: RentalCategory
  icon: string
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
  status?: RentalRecordStatus
  workerName?: string
}

export type RentalRecordInput = Omit<RentalRecord, 'id' | 'returnedAt'>

export type RentalRecordStatus = '대여 승인대기' | '반납 승인대기' | '수령대기' | '반납대기' | '대여중' | '반납완료' | '대기취소' | '대여불가'

export const RENTAL_RECORD_STATUSES: RentalRecordStatus[] = ['대여 승인대기', '반납 승인대기', '수령대기', '반납대기', '대여중', '반납완료', '대기취소', '대여불가']

export function getRentalRecordStatus(record: Pick<RentalRecord, 'dueDate' | 'returnedAt'> & Partial<Pick<RentalRecord, 'status'>>): RentalRecordStatus {
  if (record.status) return record.status
  if (record.returnedAt) return '반납완료'
  return '대여중'
}

export function getAvailableQuantity(item: RentalItem, records: RentalRecord[]) {
  const borrowed = records.filter((r) => r.itemId === item.id && !r.returnedAt).length
  return item.totalQuantity - borrowed
}
