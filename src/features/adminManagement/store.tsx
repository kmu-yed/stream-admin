import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'

export type AdminRole = '학생' | '관리자'
export type StudentCouncilDepartment = '총무부' | '집행부' | '기획부' | '복지부' | '홍보부' | '미디어부' | '소통부'
export type Admin = { id: string; name: string; studentId: string; role: AdminRole; councilDepartment?: StudentCouncilDepartment }

const initialAdmins: Admin[] = [
  { id: 'admin_1', name: '김학생', studentId: '20231234', role: '관리자', councilDepartment: '총무부' },
  { id: 'admin_2', name: '이대학', studentId: '20220512', role: '학생' },
  { id: 'admin_3', name: '박새내', studentId: '20241001', role: '학생', councilDepartment: '기획부' },
  { id: 'admin_4', name: '최가온', studentId: '20231102', role: '관리자', councilDepartment: '총무부' },
  { id: 'admin_5', name: '정하늘', studentId: '20231218', role: '학생', councilDepartment: '집행부' },
  { id: 'admin_6', name: '윤서준', studentId: '20240115', role: '학생', councilDepartment: '기획부' },
  { id: 'admin_7', name: '한유진', studentId: '20240207', role: '관리자', councilDepartment: '복지부' },
  { id: 'admin_8', name: '서민지', studentId: '20240322', role: '학생', councilDepartment: '홍보부' },
  { id: 'admin_9', name: '임도윤', studentId: '20240411', role: '학생', councilDepartment: '미디어부' },
  { id: 'admin_10', name: '강지후', studentId: '20240509', role: '관리자', councilDepartment: '소통부' },
  { id: 'admin_11', name: '오수빈', studentId: '20240614', role: '학생', councilDepartment: '총무부' },
  { id: 'admin_12', name: '배현우', studentId: '20240703', role: '학생', councilDepartment: '집행부' },
  { id: 'admin_13', name: '신채원', studentId: '20240826', role: '관리자', councilDepartment: '홍보부' },
]

type AdminManagementContextValue = {
  admins: Admin[]
  setAdmins: Dispatch<SetStateAction<Admin[]>>
}

const AdminManagementContext = createContext<AdminManagementContextValue | null>(null)

export function AdminManagementProvider({ children }: { children: ReactNode }) {
  const [admins, setAdmins] = useState(initialAdmins)
  return <AdminManagementContext.Provider value={{ admins, setAdmins }}>{children}</AdminManagementContext.Provider>
}

export function useAdminManagement() {
  const context = useContext(AdminManagementContext)
  if (!context) throw new Error('useAdminManagement must be used within AdminManagementProvider')
  return context
}
