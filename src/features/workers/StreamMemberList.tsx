import { useState } from "react";
import { FlexBox, Option, Select } from "@wanteddev/wds";
import DataTable, {
  type DataTableColumn,
} from "../../components/common/DataTable";
import SearchField from "../../components/common/SearchField";
import TableCheckboxFilter from "../../components/common/TableCheckboxFilter";

type StreamMember = {
  id: string;
  name: string;
  studentId: string;
  email: string;
  department: "소프트웨어학부" | "인공지능학부";
};

const streamMembers: StreamMember[] = [
  {
    id: "stream_1",
    name: "김학생",
    studentId: "20231234",
    email: "student.kim@kookmin.ac.kr",
    department: "소프트웨어학부",
  },
  {
    id: "stream_2",
    name: "박새내",
    studentId: "20241001",
    email: "saenae.park@kookmin.ac.kr",
    department: "소프트웨어학부",
  },
  {
    id: "stream_3",
    name: "정학생",
    studentId: "20230789",
    email: "student.jung@kookmin.ac.kr",
    department: "소프트웨어학부",
  },
  {
    id: "stream_4",
    name: "최가온",
    studentId: "20231102",
    email: "gaon.choi@kookmin.ac.kr",
    department: "인공지능학부",
  },
  {
    id: "stream_5",
    name: "정하늘",
    studentId: "20231218",
    email: "haneul.jung@kookmin.ac.kr",
    department: "인공지능학부",
  },
  {
    id: "stream_6",
    name: "윤서준",
    studentId: "20240115",
    email: "seojun.yoon@kookmin.ac.kr",
    department: "소프트웨어학부",
  },
  {
    id: "stream_7",
    name: "한유진",
    studentId: "20240207",
    email: "yujin.han@kookmin.ac.kr",
    department: "인공지능학부",
  },
  {
    id: "stream_8",
    name: "서민지",
    studentId: "20240322",
    email: "minji.seo@kookmin.ac.kr",
    department: "소프트웨어학부",
  },
  {
    id: "stream_9",
    name: "임도윤",
    studentId: "20240411",
    email: "doyoon.lim@kookmin.ac.kr",
    department: "인공지능학부",
  },
  {
    id: "stream_10",
    name: "강지후",
    studentId: "20240509",
    email: "jihoo.kang@kookmin.ac.kr",
    department: "소프트웨어학부",
  },
  {
    id: "stream_11",
    name: "오수빈",
    studentId: "20240614",
    email: "subin.oh@kookmin.ac.kr",
    department: "인공지능학부",
  },
  {
    id: "stream_12",
    name: "배현우",
    studentId: "20240703",
    email: "hyunwoo.bae@kookmin.ac.kr",
    department: "소프트웨어학부",
  },
  {
    id: "stream_13",
    name: "신채원",
    studentId: "20240826",
    email: "chaewon.shin@kookmin.ac.kr",
    department: "인공지능학부",
  },
  {
    id: "stream_14",
    name: "문지아",
    studentId: "20250601",
    email: "jia.moon@kookmin.ac.kr",
    department: "소프트웨어학부",
  },
];

type SortOption =
  | "name-asc"
  | "name-desc"
  | "student-id-asc"
  | "student-id-desc";

export default function StreamMemberList() {
  const [search, setSearch] = useState("");
  const [departmentFilters, setDepartmentFilters] = useState<string[]>(["all"]);
  const [sortOption, setSortOption] = useState<SortOption>("name-asc");

  const keyword = search.trim();
  const filtered = streamMembers
    .filter(
      (member) =>
        (!keyword ||
          member.name.includes(keyword) ||
          member.studentId.includes(keyword) ||
          member.email.includes(keyword)) &&
        (departmentFilters.includes("all") ||
          departmentFilters.includes(member.department)),
    )
    .sort((a, b) => {
      if (sortOption === "name-asc") return a.name.localeCompare(b.name, "ko");
      if (sortOption === "name-desc") return b.name.localeCompare(a.name, "ko");
      return sortOption === "student-id-asc"
        ? a.studentId.localeCompare(b.studentId)
        : b.studentId.localeCompare(a.studentId);
    });

  const columns: DataTableColumn<StreamMember>[] = [
    {
      key: "name",
      header: "이름",
      width: 140,
      render: (member) => member.name,
    },
    {
      key: "studentId",
      header: "학번",
      width: 160,
      render: (member) => member.studentId,
    },
    {
      key: "department",
      header: (
        <TableCheckboxFilter
          label="학과"
          ariaLabel="회원 학과 필터"
          options={[
            ...new Set(streamMembers.map((member) => member.department)),
          ]}
          value={departmentFilters}
          onChange={setDepartmentFilters}
        />
      ),
      width: "23%",
      render: (member) => member.department,
    },
    { key: "email", header: "이메일", render: (member) => member.email },
  ];

  return (
    <>
      <FlexBox
        className="app-page-toolbar"
        justifyContent="flex-end"
        alignItems="center"
        style={{ marginBottom: 16, gap: 12 }}
      >
        <FlexBox alignItems="center" style={{ gap: 12 }}>
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="이름, 학번 또는 이메일 검색"
          />
          <Select
            className="stream-member-sort"
            aria-label="stream 회원 정렬 기준"
            value={sortOption}
            onChange={(value) => setSortOption(value as SortOption)}
            width={170}
            height={40}
            style={{ flexShrink: 0 }}
          >
            <Option value="name-asc">이름 가나다순</Option>
            <Option value="name-desc">이름 가나다 역순</Option>
            <Option value="student-id-asc">입학년도순</Option>
            <Option value="student-id-desc">입학년도 역순</Option>
          </Select>
        </FlexBox>
      </FlexBox>
      <FlexBox style={{ width: "100%" }}>
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(member) => member.id}
          emptyMessage={
            streamMembers.length === 0
              ? "가입한 stream 회원이 없어요."
              : "조건에 맞는 회원이 없어요."
          }
          emptyDescription={
            streamMembers.length > 0
              ? "검색어나 필터를 변경해 보세요."
              : undefined
          }
          minWidth={620}
          style={{ width: "100%" }}
        />
      </FlexBox>
    </>
  );
}
