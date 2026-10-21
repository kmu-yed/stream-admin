import { forwardRef, useState, type MouseEventHandler } from "react";
import {
  Button,
  DatePicker,
  FlexBox,
  IconButton,
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
  type DatePickerFieldProps,
} from "@wanteddev/wds";
import {
  IconCaretDown,
  IconChevronLeft,
  IconChevronRight,
} from "@wanteddev/wds-icon";
import PageHeader from "../../components/common/PageHeader";
import FormItem from "../../components/common/FormItem";
import SearchField from "../../components/common/SearchField";
import ConfirmModal from "../../components/common/ConfirmModal";
import EmptyState from "../../components/common/EmptyState";
import AdminManagementPage from "../adminManagement/AdminManagementPage";
import StreamMemberList from "./StreamMemberList";
import { useAdminManagement } from "../adminManagement/store";

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
const workingHours = [10, 11, 13, 14, 15, 16];
const timeRows = [10, 11, 12, 13, 14, 15, 16];
const startOptions = workingHours;
const endOptions = [11, 12, 14, 15, 16, 17];

function getMonday(date: Date) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function toDateValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatShortDate(date: Date) {
  return `${date.getMonth() + 1}.${String(date.getDate()).padStart(2, "0")}`;
}

function formatWeekLabel(week: Date) {
  const firstDayOffset =
    (new Date(week.getFullYear(), week.getMonth(), 1).getDay() + 6) % 7;
  const weekOfMonth = Math.ceil((week.getDate() + firstDayOffset) / 7);
  return `${week.getMonth() + 1}월 ${weekOfMonth}주차`;
}

const WeekPickerTrigger = forwardRef<HTMLDivElement, DatePickerFieldProps>(
  function WeekPickerTrigger(
    { onClick, disabled, "aria-expanded": expanded },
    ref,
  ) {
    return (
      <div
        ref={ref}
        onClick={onClick as unknown as MouseEventHandler<HTMLDivElement>}
        style={{ display: "inline-flex" }}
      >
        <button
          type="button"
          aria-label="날짜를 선택해 해당 주 시간표 보기"
          aria-haspopup="dialog"
          aria-expanded={expanded}
          disabled={disabled}
          style={{
            width: 28,
            height: 28,
            padding: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "flex-start",
            background: "transparent",
            border: 0,
            color: "var(--semantic-label-normal)",
            cursor: "pointer",
          }}
        >
          <IconCaretDown width={20} height={20} />
        </button>
      </div>
    );
  },
);

function createDemoShifts(week: Date, adminIds: string[]): Shift[] {
  if (adminIds.length === 0) return [];
  const weekNumber = Math.floor(
    Date.UTC(week.getFullYear(), week.getMonth(), week.getDate()) / 604800000,
  );
  const people = Array.from(
    { length: Math.min(5, adminIds.length) },
    (_, index) => adminIds[(weekNumber * 5 + index) % adminIds.length],
  );
  return weekdays.flatMap((_, weekday) =>
    workingHours.flatMap((hour, hourIndex) => {
      // 빈 시간도 일부 남겨 두어 새 근무 시간을 등록해 볼 수 있게 한다.
      if ((weekday + hourIndex + weekNumber) % workingHours.length === 0)
        return [];
      return [
        {
          id: `demo_${toDateValue(week)}_${weekday}_${hour}`,
          workerId:
            people[(weekday * 2 + hourIndex + weekNumber) % people.length],
          weekday,
          start: hour,
          end: hour + 1,
        },
      ];
    }),
  );
}

export default function WorkManagementPage({ mode = "members" }: { mode?: "members" | "schedule" }) {
  const toast = useToast();
  const { admins } = useAdminManagement();
  const [tab, setTab] = useState(mode === "schedule" ? "schedule" : "members");
  const [selectedWeek, setSelectedWeek] = useState(() => getMonday(new Date()));
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [shiftsByWeek, setShiftsByWeek] = useState<Record<string, Shift[]>>({});
  const [scheduleSearch, setScheduleSearch] = useState("");
  const [shiftOpen, setShiftOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Shift | null>(null);
  const [draft, setDraft] = useState<ShiftDraft>({
    workerId: "",
    ranges: [{ weekday: 0, start: 10, end: 11 }],
  });

  const weekKey = toDateValue(selectedWeek);
  const shifts =
    shiftsByWeek[weekKey] ??
    createDemoShifts(
      selectedWeek,
      admins.map((admin) => admin.id),
    );
  const weekLabel = formatWeekLabel(selectedWeek);
  const weekDates = `${String(selectedWeek.getFullYear()).slice(-2)}.${formatShortDate(selectedWeek)} ~ ${formatShortDate(addDays(selectedWeek, 4))}`;
  const currentWeekStart = getMonday(new Date()).getTime();
  const isPastWeek = selectedWeek.getTime() < currentWeekStart;

  const changeWeek = (date: Date) => {
    setSelectedWeek(getMonday(date));
    setCalendarOpen(false);
    setShiftOpen(false);
  };

  const openCreateShift = (slot?: { weekday: number; hour: number }) => {
    if (isPastWeek) return;
    const firstFree = weekdays
      .flatMap((_, weekday) => workingHours.map((hour) => ({ weekday, hour })))
      .find(
        ({ weekday, hour }) =>
          !shifts.some(
            (shift) =>
              shift.weekday === weekday &&
              shift.start <= hour &&
              shift.end > hour,
          ),
      );
    setEditingShift(null);
    setDraft({
      workerId: admins[0]?.id ?? "",
      ranges: [
        {
          weekday: slot?.weekday ?? firstFree?.weekday ?? 0,
          start: slot?.hour ?? firstFree?.hour ?? 10,
          end: (slot?.hour ?? firstFree?.hour ?? 10) + 1,
        },
      ],
    });
    setShiftOpen(true);
  };

  const openEditShift = (shift: Shift) => {
    if (isPastWeek) return;
    setEditingShift(shift);
    setDraft({
      workerId: shift.workerId,
      ranges: [{ weekday: shift.weekday, start: shift.start, end: shift.end }],
    });
    setShiftOpen(true);
  };

  const saveShift = () => {
    if (selectedWeek.getTime() < getMonday(new Date()).getTime()) return;
    if (
      !draft.workerId ||
      draft.ranges.length === 0 ||
      draft.ranges.some(
        ({ start, end }) =>
          start < 10 ||
          end > 17 ||
          end <= start ||
          !Number.isInteger(start) ||
          !Number.isInteger(end) ||
          (start < 13 && end > 12),
      )
    ) {
      toast({
        content:
          "10~17시 사이의 근무 시간을 1시간 단위로 선택해 주세요. 12~13시는 점심시간이에요.",
        variant: "negative",
      });
      return;
    }
    const otherShifts = shifts.filter((shift) => shift.id !== editingShift?.id);
    const allRanges = [...otherShifts, ...draft.ranges];
    const hasOverlap = weekdays.some((_, weekday) =>
      workingHours.some(
        (hour) =>
          allRanges.filter(
            (range) =>
              range.weekday === weekday &&
              range.start <= hour &&
              range.end > hour,
          ).length > 1,
      ),
    );
    if (hasOverlap) {
      toast({
        content:
          "이미 근무자가 배정된 시간이에요. 한 시간에는 한 명만 등록할 수 있어요.",
        variant: "negative",
      });
      return;
    }
    const nextShifts: Shift[] = editingShift
      ? [
          ...otherShifts,
          { ...draft.ranges[0], workerId: draft.workerId, id: editingShift.id },
        ]
      : [
          ...shifts,
          ...draft.ranges.map((range, index) => ({
            ...range,
            workerId: draft.workerId,
            id: `shift_${Date.now()}_${index}`,
          })),
        ];
    setShiftsByWeek((previous) => ({ ...previous, [weekKey]: nextShifts }));
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
        title={mode === "schedule" ? "근무 시간표 관리" : "회원 및 관리자 관리"}
        description={mode === "schedule" ? "주차별 관리자 근무 시간표를 관리해요." : "stream 회원과 관리자 권한을 관리해요."}
      />
      <Tab value={tab} onValueChange={setTab}>
        {mode === "members" && <TabList size="medium" style={{ marginBottom: 20 }}>
          <TabListItem value="members">stream 회원 목록</TabListItem>
          <TabListItem value="admins">관리자 관리</TabListItem>
        </TabList>}
        {mode === "schedule" && <TabList style={{ display: "none" }}>
          <TabListItem value="schedule">근무 시간표 관리</TabListItem>
        </TabList>}
        {mode === "members" && <TabPanel value="members">
          <StreamMemberList />
        </TabPanel>}
        {mode === "members" && <TabPanel value="admins">
          <AdminManagementPage embedded />
        </TabPanel>}
        <TabPanel value="schedule">
          <FlexBox
            className="app-page-toolbar work-week-toolbar"
            justifyContent="space-between"
            alignItems="center"
            style={{ gap: 12, marginBottom: 16 }}
          >
            <FlexBox alignItems="center" style={{ gap: 4, minWidth: 0 }}>
              <IconButton
                variant="outlined"
                size="medium"
                aria-label="이전 주"
                style={{ flexShrink: 0 }}
                onClick={() => changeWeek(addDays(selectedWeek, -7))}
              >
                <IconChevronLeft width={20} height={20} />
              </IconButton>
              <FlexBox
                flexDirection="column"
                style={{ width: 110, flexShrink: 0 }}
              >
                <FlexBox
                  alignItems="center"
                  style={{ width: "100%", gap: 4 }}
                >
                  <Typography
                    variant="body1"
                    weight="bold"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {weekLabel}
                  </Typography>
                  <DatePicker
                    input={WeekPickerTrigger}
                    value={selectedWeek}
                    open={calendarOpen}
                    onOpenChange={setCalendarOpen}
                    onClick={() => setCalendarOpen((open) => !open)}
                    onChange={(value) =>
                      value &&
                      changeWeek(
                        typeof value === "string"
                          ? new Date(`${value.slice(0, 10)}T00:00:00`)
                          : value,
                      )
                    }
                    format="YYYY-MM-DD"
                  />
                </FlexBox>
                <Typography
                  variant="caption1"
                  color="semantic.label.alternative"
                  style={{ whiteSpace: "nowrap" }}
                >
                  {weekDates}
                </Typography>
              </FlexBox>
              <IconButton
                variant="outlined"
                size="medium"
                aria-label="다음 주"
                style={{ flexShrink: 0 }}
                onClick={() => changeWeek(addDays(selectedWeek, 7))}
              >
                <IconChevronRight width={20} height={20} />
              </IconButton>
            </FlexBox>
            <FlexBox alignItems="center" style={{ gap: 12 }}>
              <SearchField
                value={scheduleSearch}
                onChange={setScheduleSearch}
                placeholder="근무자 이름 검색"
              />
              <Button
                variant="solid"
                color="primary"
                size="medium"
                disabled={admins.length === 0 || isPastWeek}
                onClick={() => openCreateShift()}
              >
                + 근무 시간 등록
              </Button>
            </FlexBox>
          </FlexBox>
          {admins.length === 0 && <EmptyState message="등록된 관리자가 없어요." description="회원 및 관리자 관리 메뉴에서 관리자를 먼저 등록해 주세요." variant="compact" />}
          {admins.length > 0 && shifts.length === 0 && <EmptyState message="선택한 주차에 등록된 근무 시간이 없어요." description={isPastWeek ? "다른 주차의 시간표를 확인해 보세요." : "근무 시간을 등록하거나 다른 주차를 확인해 보세요."} variant="compact" />}
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
                gridTemplateColumns: "116px repeat(5, minmax(156px, 1fr))",
                minWidth: 904,
              }}
            >
              <div
                style={{
                  padding: 12,
                  background: "var(--semantic-fill-normal)",
                  borderBottom: "1px solid var(--semantic-line-normal-normal)",
                }}
              />
              {weekdays.map((day, weekday) => (
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
                  <Typography
                    variant="caption1"
                    color="semantic.label.alternative"
                    style={{ display: "block" }}
                  >
                    {formatShortDate(addDays(selectedWeek, weekday))}
                  </Typography>
                </div>
              ))}
              {timeRows.flatMap((hour) => [
                <div
                  className="work-schedule-time"
                  key={`${hour}-time`}
                  style={{
                    minHeight: 60,
                    padding: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    color: "var(--semantic-label-alternative)",
                    whiteSpace: "nowrap",
                    borderBottom:
                      "1px solid var(--semantic-line-normal-normal)",
                    background:
                      hour === 12 ? "var(--semantic-fill-normal)" : undefined,
                  }}
                >
                  {String(hour).padStart(2, "0")}:00 - {String(hour + 1).padStart(2, "0")}:00
                </div>,
                ...(hour === 12
                  ? [
                      <div
                        key="lunch"
                        style={{
                          gridColumn: "2 / -1",
                          minHeight: 60,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderLeft: "1px solid var(--semantic-line-normal-normal)",
                          borderBottom: "1px solid var(--semantic-line-normal-normal)",
                          background: "var(--semantic-fill-normal)",
                        }}
                      >
                        <Typography variant="caption1" color="semantic.label.alternative">
                          점심시간
                        </Typography>
                      </div>,
                    ]
                  : weekdays.map((_, weekday) => {
                  const shift = shifts.find(
                    (item) => item.weekday === weekday && item.start <= hour && item.end > hour,
                  );
                  const worker = admins.find(
                    (admin) => admin.id === shift?.workerId,
                  );
                  const isSearching = Boolean(scheduleSearch.trim());
                  const matched =
                    isSearching &&
                    Boolean(
                      worker?.name.includes(scheduleSearch.trim()) ||
                      worker?.studentId.includes(scheduleSearch.trim()),
                    );
                  return (
                    <button
                      className={`work-schedule-cell${!isPastWeek && admins.length > 0 ? " work-schedule-cell--editable" : ""}`}
                      key={`${hour}-${weekday}`}
                      type="button"
                      disabled={isPastWeek || admins.length === 0}
                      aria-label={shift
                        ? `${weekdays[weekday]}요일 ${String(hour).padStart(2, "0")}시 ${worker?.name ?? "알 수 없음"} 근무 시간 수정`
                        : `${weekdays[weekday]}요일 ${String(hour).padStart(2, "0")}시 근무 시간 등록`}
                      onClick={() => shift ? openEditShift(shift) : openCreateShift({ weekday, hour })}
                      style={{
                        minHeight: 60,
                        minWidth: 0,
                        width: "100%",
                        padding: 5,
                        borderTop: 0,
                        borderRight: 0,
                        borderLeft:
                          "1px solid var(--semantic-line-normal-normal)",
                        borderBottom:
                          "1px solid var(--semantic-line-normal-normal)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        font: "inherit",
                        color: "inherit",
                        textAlign: "center",
                        cursor: isPastWeek || admins.length === 0 ? "default" : "pointer",
                      }}
                    >
                      {shift ? (
                        <span
                          className="work-schedule-person"
                          style={{
                            width: "100%",
                            padding: "8px 7px",
                            borderRadius: 6,
                            background: matched
                              ? "rgba(0, 102, 255, 0.09)"
                              : "transparent",
                            color: matched
                              ? "var(--semantic-primary-normal)"
                              : isSearching
                                ? "var(--semantic-label-alternative)"
                                : "var(--semantic-label-normal)",
                            textAlign: "center",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {worker?.name ?? "알 수 없음"}
                        </span>
                      ) : (
                        <Typography
                          variant="caption1"
                          color="semantic.label.alternative"
                        >
                          -
                        </Typography>
                      )}
                    </button>
                  );
                })),
              ])}
            </div>
          </div>
        </TabPanel>
      </Tab>

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
              <Typography variant="caption1" color="semantic.label.alternative">
                {weekLabel} · {weekDates}
              </Typography>
            </ModalContentItem>
            <ModalContentItem style={{ gap: 16 }}>
              <FormItem label="근무자">
                <Select
                  value={draft.workerId}
                  onChange={(value) => setDraft({ ...draft, workerId: value })}
                >
                  {admins.map((admin) => (
                    <Option key={admin.id} value={admin.id}>
                      {admin.name} · {admin.studentId}
                    </Option>
                  ))}
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
                        {startOptions.map((hour) => (
                          <Option key={hour} value={String(hour)}>
                            {String(hour).padStart(2, "0")}:00
                          </Option>
                        ))}
                      </Select>
                      <Typography
                        variant="body2"
                        color="semantic.label.alternative"
                        style={{ textAlign: "center" }}
                      >
                        ~
                      </Typography>
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
                        {endOptions.map((hour) => (
                          <Option key={hour} value={String(hour)}>
                            {String(hour).padStart(2, "0")}:00
                          </Option>
                        ))}
                      </Select>
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
                            { weekday: 0, start: 10, end: 11 },
                          ],
                        }))
                      }
                    >
                      + 시간대 추가
                    </Button>
                  )}
                  <Typography
                    variant="caption1"
                    color="semantic.label.alternative"
                  >
                    12:00~13:00는 점심시간으로 근무자를 등록할 수 없어요.
                  </Typography>
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
                  onClick={() => setDeleteTarget(editingShift)}
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
      <ConfirmModal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="근무 시간을 삭제할까요?"
        description={`${weekLabel}에 등록된 근무 시간만 삭제돼요.`}
        confirmLabel="삭제"
        tone="negative"
        onConfirm={() => {
          if (!deleteTarget || selectedWeek.getTime() < getMonday(new Date()).getTime()) return;
          setShiftsByWeek((previous) => ({
            ...previous,
            [weekKey]: shifts.filter((shift) => shift.id !== deleteTarget.id),
          }));
          setShiftOpen(false);
          setDeleteTarget(null);
          toast({ content: "근무 시간을 삭제했어요.", variant: "positive" });
        }}
      />
    </>
  );
}
