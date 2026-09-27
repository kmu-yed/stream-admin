import { useState } from 'react'
import { Button, Checkbox, FlexBox, IconButton, Modal, ModalContainer, ModalContent, ModalContentItem, ModalHeading, Option, Select, TextField, Tooltip, TooltipContent, TooltipTrigger, Typography, useToast } from '@wanteddev/wds'
import { IconPencil, IconTrash } from '@wanteddev/wds-icon'
import PageHeader from '../../components/common/PageHeader'
import ConfirmModal from '../../components/common/ConfirmModal'
import DataTable, { type DataTableColumn } from '../../components/common/DataTable'
import FormItem from '../../components/common/FormItem'
import SearchField from '../../components/common/SearchField'
import StatusBadge, { type BadgeTone } from '../../components/common/StatusBadge'
import { type Admin, type AdminRole, useAdminManagement } from './store'

const roleTone: Record<AdminRole, BadgeTone> = { 근무자: 'neutral', 관리자: 'info', 총무부: 'positive' }

function AdminManagementPage() {
  const toast = useToast()
  const { admins, setAdmins } = useAdminManagement()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Admin | null>(null)
  const [bulkRoleModalOpen, setBulkRoleModalOpen] = useState(false)
  const [bulkRole, setBulkRole] = useState<AdminRole>('근무자')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [draft, setDraft] = useState<Omit<Admin, 'id'>>({ name: '', studentId: '', role: '근무자' })
  const filtered = admins.filter((admin) => !search.trim() || admin.name.includes(search.trim()) || admin.studentId.includes(search.trim()))

  const openAdd = () => {
    setEditing(null)
    setDraft({ name: '', studentId: '', role: '근무자' })
    setModalOpen(true)
  }
  const openEdit = (admin: Admin) => {
    setEditing(admin)
    setDraft({ name: admin.name, studentId: admin.studentId, role: admin.role })
    setModalOpen(true)
  }
  const save = () => {
    if (!draft.name.trim() || !draft.studentId.trim()) return
    if (editing) setAdmins((prev) => prev.map((admin) => admin.id === editing.id ? { ...draft, id: admin.id } : admin))
    else setAdmins((prev) => [...prev, { ...draft, id: `admin_${Date.now()}` }])
    toast({ content: editing ? '관리자 정보를 수정했어요.' : '관리자를 추가했어요.', variant: 'positive' })
    setModalOpen(false)
  }
  const columns: DataTableColumn<Admin>[] = [
    {
      key: 'select', header: <Checkbox checked={filtered.length > 0 && filtered.every((admin) => selectedIds.includes(admin.id))} onCheckedChange={(checked) => setSelectedIds(checked ? filtered.map((admin) => admin.id) : [])} />,
      width: 48, align: 'center', render: (row) => <Checkbox checked={selectedIds.includes(row.id)} onCheckedChange={(checked) => setSelectedIds((prev) => checked ? [...prev, row.id] : prev.filter((id) => id !== row.id))} />,
    },
    { key: 'name', header: '이름', render: (row) => row.name },
    { key: 'studentId', header: '학번', width: 180, render: (row) => row.studentId },
    { key: 'role', header: '권한', width: 140, render: (row) => <StatusBadge label={row.role} tone={roleTone[row.role]} /> },
    { key: 'edit', header: '', width: 56, align: 'right', render: (row) => <Tooltip mode="hover"><TooltipTrigger><IconButton variant="normal" size="small" aria-label={`${row.name} 수정`} onClick={() => openEdit(row)}><IconPencil width={18} height={18} /></IconButton></TooltipTrigger><TooltipContent>수정</TooltipContent></Tooltip> },
  ]

  return (
    <>
      <PageHeader title="관리자 관리" description="Stream 관리자 계정과 권한을 관리해요." />
      <FlexBox justifyContent="flex-end" alignItems="center" style={{ gap: 12, marginBottom: 16 }}>
        <SearchField value={search} onChange={setSearch} placeholder="이름 또는 학번 검색" />
        <Button variant="solid" color="primary" onClick={openAdd}>+ 관리자 추가하기</Button>
      </FlexBox>
      <FlexBox style={{ position: 'relative', width: '100%' }}>
      {selectedIds.length > 0 && (
        <FlexBox
          alignItems="center"
          style={{
            position: 'absolute',
            left: 0,
            bottom: 'calc(100% + 12px)',
            width: 'fit-content',
            height: 48,
            overflow: 'hidden',
            border: '1px solid var(--semantic-line-normal-normal)',
            borderRadius: 12,
            background: 'var(--semantic-background-elevated-normal)',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
          }}
        >
          <FlexBox alignItems="center" style={{ height: '100%', padding: '0 18px', borderRight: '1px solid var(--semantic-line-normal-normal)' }}>
            <Typography variant="body1" weight="bold" style={{ color: 'var(--semantic-primary-normal)' }}>{selectedIds.length}개 선택됨</Typography>
          </FlexBox>
          <button type="button" onClick={() => setBulkRoleModalOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 6, padding: '0 18px', border: 0, background: 'transparent', color: 'var(--semantic-label-normal)', font: 'inherit', fontWeight: 600, cursor: 'pointer' }}>
            <IconPencil width={18} height={18} />권한 수정
          </button>
          <button type="button" aria-label="선택한 관리자 삭제" onClick={() => setDeleteModalOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: '100%', padding: 0, border: 0, borderLeft: '1px solid var(--semantic-line-normal-normal)', background: 'transparent', color: 'var(--semantic-status-negative)', cursor: 'pointer' }}>
            <IconTrash width={20} height={20} />
          </button>
        </FlexBox>
      )}
      <DataTable columns={columns} rows={filtered} rowKey={(row) => row.id} rowNumberPosition="after-first-column" emptyMessage="등록된 관리자가 없어요." style={{ width: '100%' }} />
      </FlexBox>
      <Modal open={modalOpen} onOpenChange={setModalOpen}>
        <ModalContainer size="small"><ModalContent>
          <ModalContentItem><ModalHeading>{editing ? '관리자 정보 수정' : '관리자 추가'}</ModalHeading></ModalContentItem>
          <ModalContentItem style={{ gap: 20 }}>
            <FormItem label="이름"><TextField value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></FormItem>
            <FormItem label="학번"><TextField value={draft.studentId} onChange={(event) => setDraft({ ...draft, studentId: event.target.value })} /></FormItem>
            <FormItem label="권한"><Select value={draft.role} onChange={(value) => setDraft({ ...draft, role: value as AdminRole })}><Option value="근무자">근무자</Option><Option value="관리자">관리자</Option><Option value="총무부">총무부</Option></Select></FormItem>
          </ModalContentItem>
          <ModalContentItem style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}><Button variant="outlined" color="assistive" onClick={() => setModalOpen(false)}>취소</Button><Button variant="solid" color="primary" onClick={save}>저장</Button></ModalContentItem>
        </ModalContent></ModalContainer>
      </Modal>
      <Modal open={bulkRoleModalOpen} onOpenChange={setBulkRoleModalOpen}>
        <ModalContainer size="small"><ModalContent>
          <ModalContentItem><ModalHeading>권한 일괄 수정</ModalHeading></ModalContentItem>
          <ModalContentItem><FormItem label="변경할 권한"><Select value={bulkRole} onChange={(value) => setBulkRole(value as AdminRole)}><Option value="근무자">근무자</Option><Option value="관리자">관리자</Option><Option value="총무부">총무부</Option></Select></FormItem></ModalContentItem>
          <ModalContentItem style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}><Button variant="outlined" color="assistive" onClick={() => setBulkRoleModalOpen(false)}>취소</Button><Button variant="solid" color="primary" onClick={() => { setAdmins((prev) => prev.map((admin) => selectedIds.includes(admin.id) ? { ...admin, role: bulkRole } : admin)); setBulkRoleModalOpen(false); toast({ content: `${selectedIds.length}명의 권한을 수정했어요.`, variant: 'positive' }) }}>수정</Button></ModalContentItem>
        </ModalContent></ModalContainer>
      </Modal>
      <ConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="선택한 관리자를 삭제할까요?"
        description={`선택한 ${selectedIds.length}명의 관리자 권한이 삭제돼요.`}
        confirmLabel="삭제"
        tone="negative"
        onConfirm={() => { setAdmins((prev) => prev.filter((admin) => !selectedIds.includes(admin.id))); setSelectedIds([]); toast({ content: '선택한 관리자를 삭제했어요.', variant: 'positive' }) }}
      />
    </>
  )
}

export default AdminManagementPage
