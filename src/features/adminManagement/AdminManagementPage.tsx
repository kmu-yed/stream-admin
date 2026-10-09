import { useState } from 'react'
import { Button, Checkbox, FlexBox, Modal, ModalContainer, ModalContent, ModalContentItem, ModalHeading, Option, Select, Typography, useToast } from '@wanteddev/wds'
import { IconPencil, IconTrash } from '@wanteddev/wds-icon'
import ConfirmModal from '../../components/common/ConfirmModal'
import PageHeader from '../../components/common/PageHeader'
import DataTable, { type DataTableColumn } from '../../components/common/DataTable'
import FormItem from '../../components/common/FormItem'
import SearchField from '../../components/common/SearchField'
import StatusBadge, { type BadgeTone } from '../../components/common/StatusBadge'
import MultiPersonPicker from '../../components/common/MultiPersonPicker'
import { type Admin, type AdminRole, type StudentCouncilDepartment, useAdminManagement } from './store'
import { useStudentCouncil } from '../studentCouncil/store'

const roleTone: Record<AdminRole, BadgeTone> = { 학생: 'neutral', 관리자: 'info' }
const departments: StudentCouncilDepartment[] = ['총무부', '집행부', '기획부', '복지부', '홍보부', '미디어부', '소통부']

export default function AdminManagementPage({ embedded = false }: { embedded?: boolean }) {
  const toast = useToast()
  const { admins, setAdmins } = useAdminManagement()
  const { members } = useStudentCouncil()
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [memberSearch, setMemberSearch] = useState('')
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [newRole, setNewRole] = useState<AdminRole>('관리자')
  const [newDepartment, setNewDepartment] = useState<StudentCouncilDepartment | undefined>()
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Omit<Admin, 'id'> | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkOpen, setBulkOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [bulkRole, setBulkRole] = useState<AdminRole>('학생')

  const filtered = admins.filter((admin) => !search.trim() || admin.name.includes(search.trim()) || admin.studentId.includes(search.trim()))
  const memberResults = members.filter((member) => {
    const keyword = memberSearch.trim()
    return !keyword || member.name.includes(keyword) || member.studentId.includes(keyword)
  })
  const closeEditor = () => { setEditorOpen(false); setEditingId(null); setDraft(null) }
  const closeAdd = () => { setAddOpen(false); setMemberSearch(''); setSelectedMemberIds([]); setNewRole('관리자'); setNewDepartment(undefined) }
  const addAdmin = () => {
    const selected = members.filter((member) => selectedMemberIds.includes(member.id) && !admins.some((admin) => admin.studentId === member.studentId))
    if (selected.length === 0) return
    setAdmins((previous) => [...previous, ...selected.map((member, index) => ({ id: `admin_${Date.now()}_${index}`, name: member.name, studentId: member.studentId, role: newRole, councilDepartment: newDepartment }))])
    toast({ content: `${selected.length}명을 관리자 목록에 추가했어요.`, variant: 'positive' })
    closeAdd()
  }
  const openEdit = (admin: Admin) => { setEditingId(admin.id); setDraft({ name: admin.name, studentId: admin.studentId, role: admin.role, councilDepartment: admin.councilDepartment }); setEditorOpen(true) }
  const saveEditor = () => {
    if (!draft || !editingId) return
    setAdmins((previous) => previous.map((admin) => admin.id === editingId ? { ...draft, id: admin.id } : admin))
    toast({ content: '관리자 정보를 수정했어요.', variant: 'positive' })
    closeEditor()
  }
  const columns: DataTableColumn<Admin>[] = [
    { key: 'select', header: <Checkbox checked={filtered.length > 0 && filtered.every((admin) => selectedIds.includes(admin.id))} onCheckedChange={(checked) => setSelectedIds(checked ? filtered.map((admin) => admin.id) : [])} />, width: 48, align: 'center', render: (admin) => <Checkbox checked={selectedIds.includes(admin.id)} onCheckedChange={(checked) => setSelectedIds((previous) => checked ? [...previous, admin.id] : previous.filter((id) => id !== admin.id))} /> },
    { key: 'name', header: '이름', render: (admin) => admin.name },
    { key: 'studentId', header: '학번', width: 160, render: (admin) => admin.studentId },
    { key: 'role', header: '권한', width: 120, render: (admin) => <StatusBadge label={admin.role} tone={roleTone[admin.role]} /> },
    { key: 'department', header: '학생회 부서', width: 150, render: (admin) => admin.councilDepartment ?? '-' },
    { key: 'edit', header: '', width: 156, align: 'right', render: (admin) => <FlexBox alignItems="center" justifyContent="flex-end"><Button variant="outlined" color="assistive" size="small" leadingContent={<IconPencil width={18} height={18} style={{ display: 'block' }} />} onClick={() => openEdit(admin)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', verticalAlign: 'middle' }}>수정</Button></FlexBox> },
  ]

  return <>
    {!embedded && <PageHeader title="관리자 및 근무 관리" description="관리자 권한과 근무자를 관리해요." />}
    <FlexBox className="app-page-toolbar" justifyContent="flex-end" alignItems="center" style={{ marginBottom: 16, gap: 12 }}><SearchField value={search} onChange={setSearch} placeholder="이름 또는 학번 검색" /><Button variant="solid" color="primary" size="medium" onClick={() => setAddOpen(true)}>+ 관리자 추가</Button></FlexBox>
    <FlexBox style={{ position: 'relative', width: '100%' }}>
      {selectedIds.length > 0 && <FlexBox alignItems="center" style={{ position: 'absolute', zIndex: 2, bottom: 'calc(100% + 12px)', height: 48, border: '1px solid var(--semantic-line-normal-normal)', borderRadius: 12, background: 'var(--semantic-background-elevated-normal)', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,.12)' }}><Typography variant="body2" weight="bold" style={{ padding: '0 16px', color: 'var(--semantic-primary-normal)' }}>{selectedIds.length}개 선택됨</Typography><button type="button" onClick={() => setBulkOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: '100%', padding: '0 16px', border: 0, borderLeft: '1px solid var(--semantic-line-normal-normal)', background: 'transparent', color: 'var(--semantic-label-normal)', font: 'inherit', fontWeight: 600, cursor: 'pointer' }}><IconPencil width={16} height={16} />권한 수정</button><button type="button" aria-label="선택한 관리자 삭제" onClick={() => setDeleteOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: '100%', padding: 0, border: 0, borderLeft: '1px solid var(--semantic-line-normal-normal)', background: 'transparent', color: 'var(--semantic-status-negative)', cursor: 'pointer' }}><IconTrash width={16} height={16} /></button></FlexBox>}
      <DataTable columns={columns} rows={filtered} rowKey={(admin) => admin.id} emptyMessage="등록된 관리자가 없어요." style={{ width: '100%' }} />
    </FlexBox>
    <Modal open={addOpen} onOpenChange={(open) => !open && closeAdd()}><ModalContainer size="medium"><ModalContent>
      <ModalContentItem><ModalHeading>관리자 추가</ModalHeading></ModalContentItem>
      <ModalContentItem style={{ gap: 16 }}>
        <FormItem label="학생회비 납부자 검색"><SearchField value={memberSearch} onChange={setMemberSearch} placeholder="이름 또는 학번 검색" width="100%" /></FormItem>
        <MultiPersonPicker
          items={memberResults.map((member) => ({ id: member.id, name: member.name, detail: `${member.studentId} · ${member.department}`, disabled: admins.some((admin) => admin.studentId === member.studentId) }))}
          selectedItems={members.filter((member) => selectedMemberIds.includes(member.id)).map((member) => ({ id: member.id, name: member.name, detail: `${member.studentId} · ${member.department}` }))}
          selectedIds={selectedMemberIds}
          onToggle={(id) => setSelectedMemberIds((previous) => previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id])}
          onClear={() => setSelectedMemberIds([])}
        />
        <FormItem label="역할"><Select value={newRole} onChange={(value) => setNewRole(value as AdminRole)}><Option value="학생">학생</Option><Option value="관리자">관리자</Option></Select></FormItem>
        <FormItem label="학생회 부서"><Select value={newDepartment ?? ''} onChange={(value) => setNewDepartment(value ? value as StudentCouncilDepartment : undefined)}><Option value="">소속 없음</Option>{departments.map((department) => <Option key={department} value={department}>{department}</Option>)}</Select></FormItem>
      </ModalContentItem>
      <ModalContentItem style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}><Button variant="outlined" color="assistive" onClick={closeAdd}>취소</Button><Button variant="solid" color="primary" disabled={selectedMemberIds.length === 0} onClick={addAdmin}>{selectedMemberIds.length ? `${selectedMemberIds.length}명 추가` : '추가'}</Button></ModalContentItem>
    </ModalContent></ModalContainer></Modal>
    <Modal open={editorOpen} onOpenChange={(open) => !open && closeEditor()}><ModalContainer size="small"><ModalContent>
      <ModalContentItem><ModalHeading>관리자 정보 수정</ModalHeading></ModalContentItem>
      <ModalContentItem style={{ gap: 20 }}>
        {draft && <><FormItem label="권한"><Select value={draft.role} onChange={(value) => setDraft((previous) => previous ? { ...previous, role: value as AdminRole } : previous)}><Option value="학생">학생</Option><Option value="관리자">관리자</Option></Select></FormItem>
        <FormItem label="학생회 부서"><Select value={draft.councilDepartment ?? ''} onChange={(value) => setDraft((previous) => previous ? { ...previous, councilDepartment: value ? value as StudentCouncilDepartment : undefined } : previous)}><Option value="">소속 없음</Option>{departments.map((department) => <Option key={department} value={department}>{department}</Option>)}</Select></FormItem></>}
      </ModalContentItem>
      <ModalContentItem style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}><Button variant="outlined" color="assistive" onClick={closeEditor}>취소</Button><Button variant="solid" color="primary" disabled={!draft} onClick={saveEditor}>저장</Button></ModalContentItem>
    </ModalContent></ModalContainer></Modal>
    <Modal open={bulkOpen} onOpenChange={setBulkOpen}><ModalContainer size="small"><ModalContent><ModalContentItem><ModalHeading>권한 일괄 수정</ModalHeading></ModalContentItem><ModalContentItem><FormItem label="변경할 권한"><Select value={bulkRole} onChange={(value) => setBulkRole(value as AdminRole)}><Option value="학생">학생</Option><Option value="관리자">관리자</Option></Select></FormItem></ModalContentItem><ModalContentItem style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}><Button variant="outlined" color="assistive" onClick={() => setBulkOpen(false)}>취소</Button><Button variant="solid" color="primary" onClick={() => { setAdmins((previous) => previous.map((admin) => selectedIds.includes(admin.id) ? { ...admin, role: bulkRole } : admin)); setBulkOpen(false); toast({ content: '선택한 관리자의 권한을 수정했어요.', variant: 'positive' }) }}>수정</Button></ModalContentItem></ModalContent></ModalContainer></Modal>
    <ConfirmModal open={deleteOpen} onOpenChange={setDeleteOpen} title="선택한 관리자를 삭제할까요?" description={`선택한 ${selectedIds.length}명의 관리자 권한이 삭제돼요.`} confirmLabel="삭제" tone="negative" onConfirm={() => { setAdmins((previous) => previous.filter((admin) => !selectedIds.includes(admin.id))); setSelectedIds([]); toast({ content: '선택한 관리자를 삭제했어요.', variant: 'positive' }) }} />
  </>
}
