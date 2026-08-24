import { useState } from "react";
import {
  FlexBox,
  IconButton,
  Option,
  Select,
  SegmentedControl,
  SegmentedControlItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  useToast,
} from "@wanteddev/wds";
import { IconCheck, IconDownload, IconPencil } from "@wanteddev/wds-icon";
import PageHeader from "../../components/common/PageHeader";
import DataTable, {
  type DataTableColumn,
} from "../../components/common/DataTable";
import SearchField from "../../components/common/SearchField";
import StatusBadge, { type BadgeTone } from "../../components/common/StatusBadge";
import { useStudentCouncil } from "./store";
import type { PaymentStatus, StudentMember } from "./types";

type Filter = "all" | PaymentStatus;

const statusTone: Record<PaymentStatus, BadgeTone> = {
  납부: "positive",
  미납: "negative",
};

function toCsv(rows: StudentMember[]) {
  const header = ["이름", "학번", "학과", "납부일", "상태"];
  const lines = rows.map((row) =>
    [row.name, row.studentId, row.department, row.paidAt ?? "-", row.status]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

function StudentCouncilPage() {
  const { members, updatePaymentStatus } = useStudentCouncil();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [editMode, setEditMode] = useState(false);

  const filtered = members.filter((m) => {
    if (filter !== "all" && m.status !== filter) return false;
    const keyword = search.trim();
    if (!keyword) return true;
    return m.name.includes(keyword) || m.studentId.includes(keyword);
  });
  const unpaidCount = members.filter((m) => m.status === "미납").length;

  const handleExport = () => {
    const csv = toCsv(filtered);
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "학생회비_납부명단.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast({ content: "명단을 내보냈어요.", variant: "positive" });
  };

  const handleStatusChange = (member: StudentMember, status: PaymentStatus) => {
    if (status === member.status) return;
    updatePaymentStatus(member.id, status);
    toast({
      content: `${member.name}님의 납부 상태를 ${status}(으)로 변경했어요.`,
      variant: "positive",
    });
  };

  const columns: DataTableColumn<StudentMember>[] = [
    { key: "name", header: "이름", width: 120, render: (row) => row.name },
    {
      key: "studentId",
      header: "학번",
      width: 140,
      render: (row) => row.studentId,
    },
    { key: "department", header: "학과", render: (row) => row.department },
    {
      key: "paidAt",
      header: "납부일",
      width: 120,
      render: (row) => row.paidAt ?? "-",
    },
    {
      key: "status",
      header: "상태",
      width: 120,
      render: (row) =>
        editMode ? (
          <FlexBox style={{ width: 100 }}>
            <Select
              value={row.status}
              onChange={(v) => handleStatusChange(row, v as PaymentStatus)}
            >
              <Option value="납부">납부</Option>
              <Option value="미납">미납</Option>
            </Select>
          </FlexBox>
        ) : (
          <StatusBadge label={row.status} tone={statusTone[row.status]} />
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="학생회비 관리"
        description={`총 ${members.length}명 중 미납 ${unpaidCount}명. 수정 버튼을 눌러야 납부 상태를 변경할 수 있어요.`}
      />

      <FlexBox
        justifyContent="space-between"
        alignItems="center"
        style={{ marginBottom: 16, gap: 12 }}
      >
        <SegmentedControl
          value={filter}
          onValueChange={(v) => setFilter(v as Filter)}
          size="small"
          style={{ width: 300 }}
        >
          <SegmentedControlItem value="all">전체</SegmentedControlItem>
          <SegmentedControlItem value="납부">납부</SegmentedControlItem>
          <SegmentedControlItem value="미납">미납</SegmentedControlItem>
        </SegmentedControl>
        <FlexBox alignItems="center" style={{ gap: 12 }}>
          <SearchField value={search} onChange={setSearch} placeholder="이름 또는 학번 검색" />
          <Tooltip mode="hover">
            <TooltipTrigger>
              <IconButton
                variant={editMode ? "solid" : "outlined"}
                color={editMode ? undefined : "semantic.label.assistive"}
                size="medium"
                onClick={() => setEditMode((prev) => !prev)}
              >
                {editMode ? <IconCheck /> : <IconPencil />}
              </IconButton>
            </TooltipTrigger>
            <TooltipContent>{editMode ? "완료" : "수정"}</TooltipContent>
          </Tooltip>
          <Tooltip mode="hover">
            <TooltipTrigger>
              <IconButton variant="outlined" color="semantic.label.assistive" size="medium" onClick={handleExport}>
                <IconDownload />
              </IconButton>
            </TooltipTrigger>
            <TooltipContent>엑셀 내보내기</TooltipContent>
          </Tooltip>
        </FlexBox>
      </FlexBox>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(row) => row.id}
        emptyMessage="명단이 없어요."
      />
    </>
  );
}

export default StudentCouncilPage;
