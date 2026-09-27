import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { LOCKER_ZONE_RANGES, LOCKER_ZONES, type Locker, type LockerApplication, type LockerSemester } from './types'

function addDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

function buildInitialLockers(): Locker[] {
  const lockers: Locker[] = []
  for (const zone of LOCKER_ZONES) {
    const { start, end } = LOCKER_ZONE_RANGES[zone]
    for (let lockerNumber = start; lockerNumber <= end; lockerNumber++) {
      lockers.push({
        id: `lk_${zone}_${lockerNumber}`,
        zone,
        number: `${zone}-${lockerNumber}`,
        status: 'available',
      })
    }
  }
  const disabledIds = ['lk_A-1_6', 'lk_A-1_7', 'lk_B-1_4']
  const assignedTargets: Array<[string, string]> = [
    ['lk_A-1_1', 'lapp_1'],
    ['lk_A-1_2', 'lapp_2'],
    ['lk_A-1_3', 'lapp_3'],
  ]
  return lockers.map((locker) => {
    if (disabledIds.includes(locker.id)) return { ...locker, status: 'disabled' }
    const assigned = assignedTargets.find(([id]) => id === locker.id)
    if (assigned) return { ...locker, assignedTo: assigned[1] }
    return locker
  })
}

const initialApplications: LockerApplication[] = [
  { id: 'lapp_1', name: '김학생', studentId: '20261234', grade: 1, appliedAt: addDays(-8), status: '신청완료', lockerId: 'lk_A-1_1' },
  { id: 'lapp_2', name: '이대학', studentId: '20261235', grade: 1, appliedAt: addDays(-7), status: '신청완료', lockerId: 'lk_A-1_2' },
  { id: 'lapp_3', name: '박신입', studentId: '20261236', grade: 1, appliedAt: addDays(-6), status: '신청완료', lockerId: 'lk_A-1_3' },
  { id: 'lapp_4', name: '최새내', studentId: '20261237', grade: 2, appliedAt: addDays(-5), status: '취소' },
]

const initialSemesters: LockerSemester[] = [
  {
    id: 'sem_1',
    year: 2026,
    term: 1,
    applyStartDate: addDays(-120),
    applyEndDate: addDays(-110),
    useStartDate: addDays(-108),
    useEndDate: addDays(-60),
  },
  {
    id: 'sem_2',
    year: 2026,
    term: 2,
    applyStartDate: addDays(-10),
    applyEndDate: addDays(5),
    useStartDate: addDays(7),
    useEndDate: addDays(97),
  },
]

type LockerSemesterInput = Omit<LockerSemester, 'id'>

type LockersContextValue = {
  lockers: Locker[]
  applications: LockerApplication[]
  semesters: LockerSemester[]
  toggleLockerStatus: (id: string) => void
  updateLockerStatuses: (ids: string[], status: Locker['status']) => void
  changeLockerAssignment: (applicationId: string, lockerId: string) => void
  cancelApplication: (applicationId: string) => void
  addSemester: (input: LockerSemesterInput) => void
  updateSemester: (id: string, input: LockerSemesterInput) => void
  deleteSemester: (id: string) => void
}

const LockersContext = createContext<LockersContextValue | null>(null)

export function LockersProvider({ children }: { children: ReactNode }) {
  const [lockers, setLockers] = useState<Locker[]>(buildInitialLockers)
  const [applications, setApplications] = useState<LockerApplication[]>(initialApplications)
  const [semesters, setSemesters] = useState<LockerSemester[]>(initialSemesters)

  const value = useMemo<LockersContextValue>(
    () => ({
      lockers,
      applications,
      semesters,
      toggleLockerStatus: (id) => {
        setLockers((prev) =>
          prev.map((locker) =>
            locker.id === id
              ? { ...locker, status: locker.status === 'available' ? 'disabled' : 'available' }
              : locker,
          ),
        )
      },
      updateLockerStatuses: (ids, status) => {
        const targetIds = new Set(ids)
        setLockers((prev) =>
          prev.map((locker) => (targetIds.has(locker.id) && !locker.assignedTo ? { ...locker, status } : locker)),
        )
      },
      changeLockerAssignment: (applicationId, lockerId) => {
        const application = applications.find((item) => item.id === applicationId)
        const previousLockerId = application?.lockerId
        setApplications((prev) =>
          prev.map((item) => (item.id === applicationId ? { ...item, lockerId } : item)),
        )
        setLockers((prev) =>
          prev.map((locker) => {
            if (locker.id === lockerId) return { ...locker, assignedTo: applicationId }
            if (locker.id === previousLockerId) return { ...locker, assignedTo: undefined }
            return locker
          }),
        )
      },
      cancelApplication: (applicationId) => {
        const application = applications.find((item) => item.id === applicationId)
        setApplications((prev) =>
          prev.map((item) =>
            item.id === applicationId ? { ...item, status: '취소', lockerId: undefined } : item,
          ),
        )
        if (application?.lockerId) {
          const lockerId = application.lockerId
          setLockers((prev) =>
            prev.map((locker) => (locker.id === lockerId ? { ...locker, assignedTo: undefined } : locker)),
          )
        }
      },
      addSemester: (input) => {
        setSemesters((prev) => [...prev, { ...input, id: makeId('sem') }])
      },
      updateSemester: (id, input) => {
        setSemesters((prev) => prev.map((semester) => (semester.id === id ? { ...semester, ...input } : semester)))
      },
      deleteSemester: (id) => {
        setSemesters((prev) => prev.filter((semester) => semester.id !== id))
      },
    }),
    [lockers, applications, semesters],
  )

  return <LockersContext.Provider value={value}>{children}</LockersContext.Provider>
}

export function useLockers() {
  const context = useContext(LockersContext)
  if (!context) throw new Error('useLockers must be used within LockersProvider')
  return context
}
