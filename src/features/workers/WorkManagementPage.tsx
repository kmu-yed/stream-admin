import { useState } from "react";
import {
  Button,
  FlexBox,
  Modal,
  ModalContainer,
  ModalContent,
  ModalContentItem,
  ModalHeading,
  Option,
  Select,
  Tab,
  TabList,
  TabListItem,
  TabPanel,
  Typography,
  useToast,
} from "@wanteddev/wds";
import PageHeader from "../../components/common/PageHeader";
import FormItem from "../../components/common/FormItem";
import AdminManagementPage from "../adminManagement/AdminManagementPage";
import { type Admin, useAdminManagement } from "../adminManagement/store";
import DataTable, {
  type DataTableColumn,
} from "../../components/common/DataTable";
import SearchField from "../../components/common/SearchField";
import MultiPersonPicker from "../../components/common/MultiPersonPicker";

type Worker = { adminId: string };
type Shift = {
  id: string;
  workerId: string;
  weekday: number;
  start: number;
  end: number;
};
type ShiftRange = Pick<Shift, "weekday" | "start" | "end">;
type ShiftDraft = { workerId: string; ranges: ShiftRange[] };
const weekdays = ["월", "화", "수", "목", "금"];
const timeSlots = Array.from({ length: 18 }, (_, index) => 9 + index / 2);
const initialWorkers: Worker[] = [
  { adminId: "admin_1" },
  { adminId: "admin_3" },
  { adminId: "admin_4" },
  { adminId: "admin_5" },
  { adminId: "admin_6" },
];
const initialShifts: Shift[] = [
  { id: "shift_1", workerId: "admin_1", weekday: 0, start: 9, end: 12 },
  { id: "shift_2", workerId: "admin_3", weekday: 0, start: 9, end: 11.5 },
  { id: "shift_3", workerId: "admin_4", weekday: 0, start: 9.5, end: 12 },
  { id: "shift_4", workerId: "admin_3", weekday: 1, start: 13, end: 16 },
  { id: "shift_5", workerId: "admin_5", weekday: 1, start: 13, end: 15 },
  { id: "shift_6", workerId: "admin_6", weekday: 2, start: 10, end: 13 },
  { id: "shift_7", workerId: "admin_1", weekday: 3, start: 15, end: 18 },
  { id: "shift_8", workerId: "admin_4", weekday: 3, start: 15, end: 17 },
  { id: "shift_9", workerId: "admin_3", weekday: 4, start: 9, end: 12 },
  { id: "shift_10", workerId: "admin_5", weekday: 4, start: 9.5, end: 12 },
];

export default function WorkManagementPage() {
  const toast = useToast();
  const { admins } = useAdminManagement();
  const [tab, setTab] = useState("admins");
  const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [workerOpen, setWorkerOpen] = useState(false);
  const [selectedAdminIds, setSelectedAdminIds] = useState<string[]>([]);
  const [workerSearch, setWorkerSearch] = useState("");
  const [shiftOpen, setShiftOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [draft, setDraft] = useState<ShiftDraft>({
    workerId: "",
    ranges: [{ weekday: 0, start: 9, end: 10 }],
  });
  const [scheduleSearch, setScheduleSearch] = useState("");
  const workerAdmins = workers
    .map((worker) => admins.find((admin) => admin.id === worker.adminId))
    .filter(Boolean);
  const availableAdmins = admins.filter(
    (admin) => !workers.some((worker) => worker.adminId === admin.id),
  );
  const workerSearchResults = availableAdmins.filter(
    (admin) =>
      !workerSearch.trim() ||
      admin.name.includes(workerSearch.trim()) ||
      admin.studentId.includes(workerSearch.trim()),
  );
  const workerRows = workerAdmins.filter((admin): admin is Admin =>
    Boolean(admin),
  );
  const workerColumns: DataTableColumn<Admin>[] = [
    { key: "name", header: "이름", render: (row) => row.name },
    {
      key: "studentId",
      header: "학번",
      width: 160,
      render: (row) => row.studentId,
    },
    {
      key: "department",
      header: "학생회 부서",
      width: 180,
      render: (row) => row.councilDepartment ?? "-",
    },
  ];
  const openCreateShift = () => {
    setEditingShift(null);
    setDraft({
      workerId: workers[0]?.adminId ?? "",
      ranges: [{ weekday: 0, start: 9, end: 9.5 }],
    });
    setShiftOpen(true);
  };
  const openEditShift = (shift: Shift) => {
    setEditingShift(shift);
    setDraft({
      workerId: shift.workerId,
      ranges: [{ weekday: shift.weekday, start: shift.start, end: shift.end }],
    });
    setShiftOpen(true);
  };
  const saveShift = () => {
    if (
      !draft.workerId ||
      draft.ranges.some((range) => range.end <= range.start)
    ) {
      toast({
        content: "근무자와 올바른 근무 시간을 입력해주세요.",
        variant: "negative",
      });
      return;
    }
    if (editingShift)
      setShifts((previous) =>
        previous.map((shift) =>
          shift.id === editingShift.id
            ? { ...draft.ranges[0], workerId: draft.workerId, id: shift.id }
            : shift,
        ),
      );
    else
      setShifts((previous) => [
        ...previous,
        ...draft.ranges.map((range, index) => ({
          ...range,
          workerId: draft.workerId,
          id: `shift_${Date.now()}_${index}`,
        })),
      ]);
    toast({
      content: editingShift
        ? "근무 시간을 수정했어요."
        : `${draft.ranges.length}개 시간대를 등록했어요.`,
      variant: "positive",
    });
    setShiftOpen(false);
  };
  return (
    <>
      <PageHeader
        title="관리자 및 근무 관리"
        description="관리자 권한·근무자·시간표를 관리해요."
      />
      <Tab value={tab} onValueChange={setTab}>
        <TabList size="medium" style={{ marginBottom: 20 }}>
          <TabListItem value="admins">관리자 관리</TabListItem>
          <TabListItem value="workers">근무자 목록</TabListItem>
          <TabListItem value="schedule">근무 시간표 관리</TabListItem>
        </TabList>
        <TabPanel value="admins">
          <AdminManagementPage embedded />
        </TabPanel>
        <TabPanel value="workers">
          <FlexBox className="app-page-toolbar" justifyContent="flex-end" style={{ marginBottom: 16 }}>
            <Button
              variant="solid"
              color="primary"
              onClick={() => {
                setWorkerSearch("");
                setSelectedAdminIds([]);
                setWorkerOpen(true);
              }}
            >
              + 근무자 등록
            </Button>
          </FlexBox>
          <DataTable
            columns={workerColumns}
            rows={workerRows}
            rowKey={(row) => row.id}
            emptyMessage="등록된 근무자가 없어요."
          />
        </TabPanel>
        <TabPanel value="schedule">
          <FlexBox
            className="app-page-toolbar"
            justifyContent="flex-end"
            alignItems="center"
            style={{ gap: 12, marginBottom: 16 }}
          >
            <SearchField
              value={scheduleSearch}
              onChange={setScheduleSearch}
              placeholder="근무자 이름 검색"
            />
            <Button variant="solid" color="primary" size="medium" onClick={openCreateShift}>
              + 근무 시간 등록
            </Button>
          </FlexBox>
          <div
            className="work-schedule-scroll"
            style={{
              overflowX: "auto",
              border: "1px solid var(--semantic-line-normal-normal)",
              borderRadius: 12,
            }}
          >
            <div
              className="work-schedule-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "72px repeat(5, minmax(156px, 1fr))",
                minWidth: 860,
              }}
            >
              <div
                style={{
                  padding: 12,
                  background: "var(--semantic-fill-normal)",
                  borderBottom: "1px solid var(--semantic-line-normal-normal)",
                }}
              />
              {weekdays.map((day) => (
                <div
                  className="work-schedule-day"
                  key={day}
                  style={{
                    padding: 12,
                    textAlign: "center",
                    fontWeight: 700,
                    background: "var(--semantic-fill-normal)",
                    borderLeft: "1px solid var(--semantic-line-normal-normal)",
                    borderBottom:
                      "1px solid var(--semantic-line-normal-normal)",
                  }}
                >
                  {day}
                </div>
              ))}
              {timeSlots.flatMap((time) => [
                <div
                  className="work-schedule-time"
                  key={`${time}-time`}
                  style={{
                    minHeight: 54,
                    padding: 10,
                    fontSize: 13,
                    color: "var(--semantic-label-alternative)",
                    borderBottom:
                      "1px solid var(--semantic-line-normal-normal)",
                  }}
                >
                  {String(Math.floor(time)).padStart(2, "0")}:
                  {time % 1 ? "30" : "00"}
                </div>,
                ...weekdays.map((_, weekday) => {
                  const cellShifts = shifts.filter(
                    (shift) =>
                      shift.weekday === weekday &&
                      shift.start <= time &&
                      shift.end > time,
                  );
                  return (
                    <div
                      className="work-schedule-cell"
                      key={`${time}-${weekday}`}
                      style={{
                        minHeight: 54,
                        padding: 5,
                        borderLeft:
                          "1px solid var(--semantic-line-normal-normal)",
                        borderBottom:
                          "1px solid var(--semantic-line-normal-normal)",
                      }}
                    >
                      {cellShifts.map((shift) => {
                        const worker = admins.find(
                          (admin) => admin.id === shift.workerId,
                        );
                        const isSearching = Boolean(scheduleSearch.trim());
                        const matched =
                          !isSearching ||
                          worker?.name.includes(scheduleSearch.trim()) ||
                          worker?.studentId.includes(scheduleSearch.trim());
                        return (
                          <button
                            className="work-schedule-person"
                            key={shift.id}
                            type="button"
                            onClick={() => openEditShift(shift)}
                            style={{
                              width: "100%",
                              padding: "5px 7px",
                              marginBottom: 3,
                              border: 0,
                              borderRadius: 6,
                              background: isSearching && matched
                                ? "rgba(0, 102, 255, 0.09)"
                                : "var(--semantic-background-normal-normal)",
                              color: isSearching && matched
                                ? "var(--semantic-primary-normal)"
                                : "var(--semantic-label-normal)",
                              textAlign: "left",
                              cursor: "pointer",
                              font: "inherit",
                              fontSize: 12,
                              fontWeight: 600,
                              transition:
                                "background-color .16s ease, color .16s ease",
                            }}
                          >
                            {worker?.name ?? "알 수 없음"}
                          </button>
                        );
                      })}
                    </div>
                  );
                }),
              ])}
            </div>
          </div>
        </TabPanel>
      </Tab>
      <Modal open={workerOpen} onOpenChange={(open) => { setWorkerOpen(open); if (!open) setSelectedAdminIds([]) }}>
        <ModalContainer size="medium">
          <ModalContent>
            <ModalContentItem>
              <ModalHeading>근무자 등록</ModalHeading>
            </ModalContentItem>
            <ModalContentItem style={{ gap: 16 }}>
              <FormItem label="관리자 목록 검색">
                <SearchField
                  value={workerSearch}
                  onChange={setWorkerSearch}
                  placeholder="이름 또는 학번 검색"
                  width="100%"
                />
              </FormItem>
              <MultiPersonPicker
                items={workerSearchResults.map((admin) => ({ id: admin.id, name: admin.name, detail: `${admin.studentId} · ${admin.councilDepartment ?? '소속 없음'}` }))}
                selectedItems={admins.filter((admin) => selectedAdminIds.includes(admin.id)).map((admin) => ({ id: admin.id, name: admin.name, detail: `${admin.studentId} · ${admin.councilDepartment ?? '소속 없음'}` }))}
                selectedIds={selectedAdminIds}
                onToggle={(id) => setSelectedAdminIds((previous) => previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id])}
                onClear={() => setSelectedAdminIds([])}
              />
            </ModalContentItem>
            <ModalContentItem
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <Button
                variant="outlined"
                color="assistive"
                onClick={() => setWorkerOpen(false)}
              >
                취소
              </Button>
              <Button
                variant="solid"
                color="primary"
                disabled={selectedAdminIds.length === 0}
                onClick={() => {
                  const ids = selectedAdminIds.filter((id) => !workers.some((worker) => worker.adminId === id));
                  if (ids.length === 0) return;
                  setWorkers((previous) => [...previous, ...ids.map((adminId) => ({ adminId }))]);
                  setWorkerOpen(false);
                  setSelectedAdminIds([]);
                  toast({
                    content: `${ids.length}명을 근무자로 등록했어요.`,
                    variant: "positive",
                  });
                }}
              >
                {selectedAdminIds.length ? `${selectedAdminIds.length}명 등록` : '등록'}
              </Button>
            </ModalContentItem>
          </ModalContent>
        </ModalContainer>
      </Modal>
      <Modal open={shiftOpen} onOpenChange={setShiftOpen}>
        <ModalContainer
          size="xlarge"
          style={{ width: 560, maxWidth: "calc(100vw - 48px)" }}
        >
          <ModalContent>
            <ModalContentItem>
              <ModalHeading>
                {editingShift ? "근무 시간 수정" : "근무 시간 등록"}
              </ModalHeading>
            </ModalContentItem>
            <ModalContentItem style={{ gap: 16 }}>
              <FormItem label="근무자">
                <Select
                  value={draft.workerId}
                  onChange={(value) => setDraft({ ...draft, workerId: value })}
                >
                  {workers.map((worker) => {
                    const admin = admins.find(
                      (item) => item.id === worker.adminId,
                    );
                    return admin ? (
                      <Option key={admin.id} value={admin.id}>
                        {admin.name} · {admin.studentId}
                      </Option>
                    ) : null;
                  })}
                </Select>
              </FormItem>
              <FormItem label="근무 시간대">
                <FlexBox flexDirection="column" style={{ gap: 10 }}>
                  {draft.ranges.map((range, index) => (
                    <div
                      key={`${range.weekday}-${index}`}
                      className="work-shift-range"
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "minmax(96px, 1fr) minmax(88px, 1fr) 12px minmax(88px, 1fr) auto",
                        gap: 8,
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <FlexBox style={{ flex: 1, minWidth: 0 }}>
                        <Select
                          style={{ width: "100%" }}
                          value={String(range.weekday)}
                          onChange={(value) =>
                            setDraft((previous) => ({
                              ...previous,
                              ranges: previous.ranges.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, weekday: Number(value) }
                                  : item,
                              ),
                            }))
                          }
                        >
                          {weekdays.map((day, weekday) => (
                            <Option key={day} value={String(weekday)}>
                              {day}요일
                            </Option>
                          ))}
                        </Select>
                      </FlexBox>
                      <FlexBox style={{ flex: 1, minWidth: 0 }}>
                        <Select
                          style={{ width: "100%" }}
                          value={String(range.start)}
                          onChange={(value) =>
                            setDraft((previous) => ({
                              ...previous,
                              ranges: previous.ranges.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, start: Number(value) }
                                  : item,
                              ),
                            }))
                          }
                        >
                          {timeSlots.map((time) => (
                            <Option key={time} value={String(time)}>
                              {String(Math.floor(time)).padStart(2, "0")}:
                              {time % 1 ? "30" : "00"}
                            </Option>
                          ))}
                        </Select>
                      </FlexBox>
                      <Typography
                        variant="body2"
                        color="semantic.label.alternative"
                        style={{ textAlign: "center" }}
                      >
                        ~
                      </Typography>
                      <FlexBox style={{ flex: 1, minWidth: 0 }}>
                        <Select
                          style={{ width: "100%" }}
                          value={String(range.end)}
                          onChange={(value) =>
                            setDraft((previous) => ({
                              ...previous,
                              ranges: previous.ranges.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, end: Number(value) }
                                  : item,
                              ),
                            }))
                          }
                        >
                          {[...timeSlots.slice(1), 18].map((time) => (
                            <Option key={time} value={String(time)}>
                              {String(Math.floor(time)).padStart(2, "0")}:
                              {time % 1 ? "30" : "00"}
                            </Option>
                          ))}
                        </Select>
                      </FlexBox>
                      {!editingShift && draft.ranges.length > 1 && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="assistive"
                          style={{ height: 40, whiteSpace: "nowrap" }}
                          onClick={() =>
                            setDraft((previous) => ({
                              ...previous,
                              ranges: previous.ranges.filter(
                                (_, itemIndex) => itemIndex !== index,
                              ),
                            }))
                          }
                        >
                          삭제
                        </Button>
                      )}
                    </div>
                  ))}
                  {!editingShift && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="assistive"
                      onClick={() =>
                        setDraft((previous) => ({
                          ...previous,
                          ranges: [
                            ...previous.ranges,
                            { weekday: 0, start: 9, end: 9.5 },
                          ],
                        }))
                      }
                    >
                      + 시간대 추가
                    </Button>
                  )}
                </FlexBox>
              </FormItem>
            </ModalContentItem>
            <ModalContentItem
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              {editingShift ? (
                <Button
                  variant="outlined"
                  color="assistive"
                  style={{ color: "var(--semantic-status-negative)" }}
                  onClick={() => {
                    setShifts((previous) =>
                      previous.filter((shift) => shift.id !== editingShift.id),
                    );
                    setShiftOpen(false);
                    toast({
                      content: "근무 시간을 삭제했어요.",
                      variant: "positive",
                    });
                  }}
                >
                  삭제
                </Button>
              ) : (
                <span />
              )}
              <FlexBox style={{ gap: 8 }}>
                <Button
                  variant="outlined"
                  color="assistive"
                  onClick={() => setShiftOpen(false)}
                >
                  취소
                </Button>
                <Button variant="solid" color="primary" onClick={saveShift}>
                  저장
                </Button>
              </FlexBox>
            </ModalContentItem>
          </ModalContent>
        </ModalContainer>
      </Modal>
    </>
  );
}
