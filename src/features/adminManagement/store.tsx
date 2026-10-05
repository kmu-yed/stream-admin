import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'

export type AdminRole = '학생' | '관리자'
export type StudentCouncilDepartment = '총무부' | '집행부' | '기획부' | '복지부' | '홍보부' | '미디어부' | '소통부'
export type Admin = { id: string; name: string; studentId: string; role: AdminRole; councilDepartment?: StudentCouncilDepartment }

const initialAdmins: Admin[] = [
  { id: 'admin_1', name: '김학생', studentId: '20231234', role: '관리자', councilDepartment: '총무부' },
  { id: 'admin_2', name: '이대학', studentId: '20220512', role: '학생' },
  { id: 'admin_3', name: '박새내', studentId: '20241001', role: '학생', councilDepartment: '기획부' },
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
