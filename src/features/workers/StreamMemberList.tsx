import { useState } from 'react'
import { Checkbox, FlexBox, Tooltip, TooltipContent, TooltipTrigger, Typography, useToast } from '@wanteddev/wds'
import ConfirmModal from '../../components/common/ConfirmModal'
import DataTable, { type DataTableColumn } from '../../components/common/DataTable'
import SearchField from '../../components/common/SearchField'
import TableCheckboxFilter from '../../components/common/TableCheckboxFilter'
import { useAdminManagement } from '../adminManagement/store'

type StreamMember = { id: string; name: string; studentId: string; email: string; department: '소프트웨어학부' | '인공지능학부' }

const streamMembers: StreamMember[] = [
  { id: 'stream_1', name: '김학생', studentId: '20231234', email: 'student.kim@kookmin.ac.kr', department: '소프트웨어학부' },
  { id: 'stream_2', name: '박새내', studentId: '20241001', email: 'saenae.park@kookmin.ac.kr', department: '소프트웨어학부' },
  { id: 'stream_3', name: '정학생', studentId: '20230789', email: 'student.jung@kookmin.ac.kr', department: '소프트웨어학부' },
  { id: 'stream_4', name: '최가온', studentId: '20231102', email: 'gaon.choi@kookmin.ac.kr', department: '인공지능학부' },
  { id: 'stream_5', name: '정하늘', studentId: '20231218', email: 'haneul.jung@kookmin.ac.kr', department: '인공지능학부' },
  { id: 'stream_6', name: '윤서준', studentId: '20240115', email: 'seojun.yoon@kookmin.ac.kr', department: '소프트웨어학부' },
  { id: 'stream_7', name: '한유진', studentId: '20240207', email: 'yujin.han@kookmin.ac.kr', department: '인공지능학부' },
  { id: 'stream_8', name: '서민지', studentId: '20240322', email: 'minji.seo@kookmin.ac.kr', department: '소프트웨어학부' },
  { id: 'stream_9', name: '임도윤', studentId: '20240411', email: 'doyoon.lim@kookmin.ac.kr', department: '인공지능학부' },
  { id: 'stream_10', name: '강지후', studentId: '20240509', email: 'jihoo.kang@kookmin.ac.kr', department: '소프트웨어학부' },
  { id: 'stream_11', name: '오수빈', studentId: '20240614', email: 'subin.oh@kookmin.ac.kr', department: '인공지능학부' },
  { id: 'stream_12', name: '배현우', studentId: '20240703', email: 'hyunwoo.bae@kookmin.ac.kr', department: '소프트웨어학부' },
  { id: 'stream_13', name: '신채원', studentId: '20240826', email: 'chaewon.shin@kookmin.ac.kr', department: '인공지능학부' },
  { id: 'stream_14', name: '문지아', studentId: '20250601', email: 'jia.moon@kookmin.ac.kr', department: '소프트웨어학부' },
]

export default function StreamMemberList({ onAdminsAdded }: { onAdminsAdded: () => void }) {
  const { admins, setAdmins } = useAdminManagement()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [departmentFilters, setDepartmentFilters] = useState<string[]>(['all'])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [addOpen, setAddOpen] = useState(false)

  const keyword = search.trim()
  const filtered = streamMembers.filter((member) =>
    (!keyword || member.name.includes(keyword) || member.studentId.includes(keyword) || member.email.includes(keyword))
    && (departmentFilters.includes('all') || departmentFilters.includes(member.department)),
  )
  const isListed = (member: StreamMember) => admins.some((admin) => admin.studentId === member.studentId)
  const eligibleFiltered = filtered.filter((member) => !isListed(member))
  const selectedMembers = streamMembers.filter((member) => selectedIds.includes(member.id) && !isListed(member))

  const addAdmins = () => {
    if (selectedMembers.length === 0) return
    setAdmins((previous) => {
      const existingIds = new Set(previous.map((admin) => admin.studentId))
      const added = selectedMembers.filter((member) => !existingIds.has(member.studentId)).map((member, index) => ({
        id: `admin_${Date.now()}_${index}`,
        name: member.name,
        studentId: member.studentId,
        role: '학생' as const,
      }))
      return [...previous, ...added]
    })
    toast({ content: `${selectedMembers.length}명을 관리자 목록에 추가했어요.`, variant: 'positive' })
    setSelectedIds([])
    setAddOpen(false)
    onAdminsAdded()
  }

  const columns: DataTableColumn<StreamMember>[] = [
    {
      key: 'select',
      header: <Checkbox
        aria-label="추가 가능한 회원 전체 선택"
        checked={eligibleFiltered.length > 0 && eligibleFiltered.every((member) => selectedIds.includes(member.id))}
        disabled={eligibleFiltered.length === 0}
        onCheckedChange={(checked) => setSelectedIds((previous) => checked
          ? [...new Set([...previous, ...eligibleFiltered.map((member) => member.id)])]
          : previous.filter((id) => !eligibleFiltered.some((member) => member.id === id)))}
      />,
      width: 48,
      align: 'center',
      render: (member) => {
        const alreadyListed = isListed(member)
        const checkbox = <Checkbox
          aria-label={alreadyListed ? `${member.name}: 이미 관리자 목록에 등록됨` : `${member.name} 선택`}
          checked={selectedIds.includes(member.id)}
          disabled={alreadyListed}
          onCheckedChange={(checked) => setSelectedIds((previous) => checked
            ? [...previous, member.id]
            : previous.filter((id) => id !== member.id))}
        />
        return alreadyListed ? <Tooltip mode="hover">
          <TooltipTrigger><span style={{ display: 'inline-flex' }}>{checkbox}</span></TooltipTrigger>
          <TooltipContent>이미 관리자 목록에 등록된 회원이에요.</TooltipContent>
        </Tooltip> : checkbox
      },
    },
    { key: 'name', header: '이름', width: '18%', render: (member) => member.name },
    { key: 'department', header: <TableCheckboxFilter label="학과" ariaLabel="회원 학과 필터" options={[...new Set(streamMembers.map((member) => member.department))]} value={departmentFilters} onChange={setDepartmentFilters} />, width: '23%', render: (member) => member.department },
    { key: 'email', header: '이메일', render: (member) => member.email },
  ]

  return <>
    <FlexBox className="app-page-toolbar" justifyContent="flex-end" alignItems="center" style={{ marginBottom: 16, gap: 12 }}>
      <SearchField value={search} onChange={setSearch} placeholder="이름, 학번 또는 이메일 검색" />
    </FlexBox>
    <FlexBox style={{ position: 'relative', width: '100%' }}>
      {selectedMembers.length > 0 && <FlexBox alignItems="center" style={{ position: 'absolute', zIndex: 2, bottom: 'calc(100% + 12px)', height: 48, border: '1px solid var(--semantic-line-normal-normal)', borderRadius: 12, background: 'var(--semantic-background-elevated-normal)', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,.12)' }}>
        <Typography variant="body2" weight="bold" style={{ padding: '0 16px', color: 'var(--semantic-primary-normal)' }}>{selectedMembers.length}명 선택됨</Typography>
        <button type="button" onClick={() => setAddOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', height: '100%', padding: '0 16px', border: 0, borderLeft: '1px solid var(--semantic-line-normal-normal)', background: 'transparent', color: 'var(--semantic-label-normal)', font: 'inherit', fontWeight: 600, cursor: 'pointer' }}>관리자 목록에 추가하기</button>
      </FlexBox>}
      <DataTable columns={columns} rows={filtered} rowKey={(member) => member.id} emptyMessage={streamMembers.length === 0 ? '가입한 stream 회원이 없어요.' : '조건에 맞는 회원이 없어요.'} emptyDescription={streamMembers.length > 0 ? '검색어나 필터를 변경해 보세요.' : undefined} minWidth={620} style={{ width: '100%' }} />
    </FlexBox>

    <ConfirmModal
      open={addOpen}
      onOpenChange={setAddOpen}
      title="선택한 회원을 관리자 목록에 추가할까요?"
      description={<>
        선택한 회원 {selectedMembers.length}명이 학생 권한으로 관리자 목록에 추가돼요.
        <span style={{ display: 'block', marginTop: 8, overflowWrap: 'anywhere', color: 'var(--semantic-label-alternative)' }}>
          {selectedMembers.map((member) => member.name).join(', ')}
        </span>
      </>}
      confirmLabel={`${selectedMembers.length}명 추가`}
      onConfirm={addAdmins}
    />
  </>
}
