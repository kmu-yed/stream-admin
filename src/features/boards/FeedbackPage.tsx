import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Button,
  DateCalendar,
  FlexBox,
  IconButton,
  Modal,
  ModalContainer,
  ModalContent,
  ModalContentItem,
  ModalHeading,
  Menu,
  MenuContent,
  MenuItem,
  MenuList,
  MenuTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tab,
  TabList,
  TabListItem,
  TabPanel,
  TextField,
  Typography,
  useToast,
} from "@wanteddev/wds";
import { IconChevronDown } from "@wanteddev/wds-icon";
import type { ThemeColorsToken } from "@wanteddev/wds-engine";
import PageHeader from "../../components/common/PageHeader";
import DataTable, {
  type DataTableColumn,
} from "../../components/common/DataTable";
import StatusBadge, {
  type BadgeTone,
} from "../../components/common/StatusBadge";
import BoldMarkupText from "../../components/common/BoldMarkupText";
import FormItem from "../../components/common/FormItem";
import SearchField from "../../components/common/SearchField";
import { useBoards } from "./store";
import type {
  FeedbackAnswer,
  FeedbackPeriod,
  FeedbackQuestion,
  FeedbackQuestionStatus,
  FeedbackRound,
} from "./types";

const questionStatusTone: Record<FeedbackQuestionStatus, BadgeTone> = {
  답변완료: "positive",
  대기: "cautionary",
};

function QuestionsPanel() {
  const { questions } = useBoards();
  const navigate = useNavigate();

  const columns: DataTableColumn<FeedbackQuestion>[] = [
    { key: "content", header: "질문", render: (row) => row.content },
    {
      key: "studentName",
      header: "작성자",
      width: 100,
      render: (row) => row.studentName,
    },
    {
      key: "createdAt",
      header: "작성일",
      width: 120,
      render: (row) => row.createdAt,
    },
    {
      key: "status",
      header: "답변 상태",
      width: 110,
      render: (row) => (
        <StatusBadge label={row.status} tone={questionStatusTone[row.status]} />
      ),
    },
  ];

  return (
    <FlexBox flexDirection="column" style={{ gap: 20 }}>
      <FlexBox justifyContent="flex-end">
        <Button
          variant="solid"
          color="primary"
          onClick={() => navigate("/feedback/rounds/new")}
        >
          + N차 피드백 등록
        </Button>
      </FlexBox>
      <DataTable
        columns={columns}
        rows={questions}
        rowKey={(row) => row.id}
        emptyMessage="등록된 질문이 없어요."
      />
    </FlexBox>
  );
}

function formatPeriodDate(date: string) {
  return date.replaceAll("-", ".");
}

function OperatingSettingsPanel() {
  const { feedbackPeriods, updateFeedbackPeriod } = useBoards();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const currentPeriod = feedbackPeriods.find(
    (period) => period.openDate <= today && today <= period.closeDate,
  );
  const pastPeriods = feedbackPeriods
    .filter((period) => period.closeDate < today)
    .sort((a, b) => b.closeDate.localeCompare(a.closeDate));
  const [draft, setDraft] = useState(() => ({
    openDate: currentPeriod?.openDate ?? "",
    closeDate: currentPeriod?.closeDate ?? "",
  }));
  const [error, setError] = useState<string>();

  const beginEdit = () => {
    if (!currentPeriod) return;
    setDraft({
      openDate: currentPeriod.openDate,
      closeDate: currentPeriod.closeDate,
    });
    setError(undefined);
    setEditing(true);
  };

  const saveCurrentPeriod = () => {
    if (!currentPeriod) return;
    if (!draft.openDate || !draft.closeDate) {
      setError("접수 시작일과 종료일을 모두 선택해주세요.");
      return;
    }
    if (draft.openDate > draft.closeDate) {
      setError("종료일은 시작일 이후여야 해요.");
      return;
    }
    updateFeedbackPeriod(currentPeriod.id, draft);
    setEditing(false);
    setError(undefined);
    toast({ content: "현재 접수 기간이 수정되었어요.", variant: "positive" });
  };

  const historyColumns: DataTableColumn<FeedbackPeriod>[] = [
    {
      key: "period",
      header: "접수 기간",
      render: (row) =>
        `${formatPeriodDate(row.openDate)} ~ ${formatPeriodDate(row.closeDate)}`,
    },
    {
      key: "createdAt",
      header: "등록일",
      width: 140,
      render: (row) => formatPeriodDate(row.createdAt),
    },
    {
      key: "status",
      header: "상태",
      width: 110,
      render: () => <StatusBadge label="종료" tone="neutral" />,
    },
  ];

  return (
    <FlexBox flexDirection="column" style={{ gap: 32 }}>
      <FlexBox
        flexDirection="column"
        style={{
          gap: 20,
          padding: 24,
          borderRadius: 16,
          border: "1px solid var(--semantic-line-normal-normal)",
          background: "var(--semantic-background-normal-normal)",
        }}
      >
        <FlexBox justifyContent="space-between" alignItems="center">
          <FlexBox alignItems="center" style={{ gap: 8 }}>
            <Typography variant="body1" weight="bold">
              현재 접수 기간
            </Typography>
            <StatusBadge label="접수 중" tone="positive" />
          </FlexBox>
          {!editing && currentPeriod && (
            <Button variant="outlined" color="primary" onClick={beginEdit}>
              수정
            </Button>
          )}
        </FlexBox>

        {currentPeriod ? (
          editing ? (
            <>
              <FlexBox style={{ gap: 16 }}>
                <FlexBox style={{ flex: 1 }}>
                  <FormItem label="접수 시작일" required>
                    <TextField
                      type="date"
                      value={draft.openDate}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          openDate: event.target.value,
                        }))
                      }
                    />
                  </FormItem>
                </FlexBox>
                <FlexBox style={{ flex: 1 }}>
                  <FormItem label="접수 종료일" required error={error}>
                    <TextField
                      type="date"
                      value={draft.closeDate}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          closeDate: event.target.value,
                        }))
                      }
                    />
                  </FormItem>
                </FlexBox>
              </FlexBox>
              <FlexBox justifyContent="flex-end" style={{ gap: 8 }}>
                <Button
                  variant="outlined"
                  color="assistive"
                  onClick={() => setEditing(false)}
                >
                  취소
                </Button>
                <Button
                  variant="solid"
                  color="primary"
                  onClick={saveCurrentPeriod}
                >
                  저장
                </Button>
              </FlexBox>
            </>
          ) : (
            <Typography variant="body1" weight="medium">
              {formatPeriodDate(currentPeriod.openDate)} —{" "}
              {formatPeriodDate(currentPeriod.closeDate)}
            </Typography>
          )
        ) : (
          <Typography variant="body1" color="semantic.label.alternative">
            현재 접수 중인 기간이 없어요.
          </Typography>
        )}
      </FlexBox>

      <FlexBox flexDirection="column" style={{ gap: 12 }}>
        <Typography variant="body1" weight="bold">
          지난 접수 기간 이력
        </Typography>
        <DataTable
          columns={historyColumns}
          rows={pastPeriods}
          rowKey={(row) => row.id}
          emptyMessage="종료된 접수 기간이 없어요."
        />
      </FlexBox>
    </FlexBox>
  );
}

type FlatAnswer = {
  round: FeedbackRound;
  answer: FeedbackAnswer;
  question?: FeedbackQuestion;
};

function TruncatedText({
  text,
  variant,
  weight,
  color,
  maxWidth,
}: {
  text: string;
  variant: "body1" | "body2";
  weight?: "regular" | "medium";
  color?: ThemeColorsToken;
  maxWidth: number;
}) {
  return (
    <Typography
      variant={variant}
      weight={weight}
      color={color}
      style={{
        display: "block",
        maxWidth,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {text.replace(/\*\*/g, "")}
    </Typography>
  );
}

function AllFeedbackPanel() {
  const { questions, feedbackRounds } = useBoards();
  const [selected, setSelected] = useState<FlatAnswer | null>(null);
  const [roundFilters, setRoundFilters] = useState<string[]>(["all"]);
  const [dateFilter, setDateFilter] = useState("");
  const [search, setSearch] = useState("");
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);

  const flatAnswers: FlatAnswer[] = [...feedbackRounds]
    .sort((a, b) => b.roundNumber - a.roundNumber)
    .flatMap((round) =>
      round.answers.map((answer) => ({
        round,
        answer,
        question: questions.find((q) => q.id === answer.questionId),
      })),
    );

  const roundNumbers = [
    ...new Set(flatAnswers.map(({ round }) => round.roundNumber)),
  ].sort((a, b) => b - a);
  const filteredAnswers = flatAnswers.filter(({ round, answer, question }) => {
    const matchesRound =
      roundFilters.includes("all") ||
      roundFilters.includes(String(round.roundNumber));
    const matchesDate = !dateFilter || round.createdAt === dateFilter;
    const query = search.trim();
    const matchesSearch =
      !query ||
      question?.content.includes(query) ||
      answer.answerText.replace(/\*\*/g, "").includes(query);
    return matchesRound && matchesDate && matchesSearch;
  });

  const columns: DataTableColumn<FlatAnswer>[] = [
    {
      key: "round",
      header: (
        <Menu
          value={roundFilters}
          onValueChange={(value) => {
            if (!Array.isArray(value)) return;
            if (value.length === 0) {
              setRoundFilters(["all"]);
              return;
            }
            if (value.includes("all")) {
              setRoundFilters(
                roundFilters.includes("all")
                  ? value.filter((item) => item !== "all")
                  : ["all"],
              );
              return;
            }
            setRoundFilters(value);
          }}
        >
          <FlexBox alignItems="center" style={{ gap: 4 }}>
            <span>회차</span>
            <MenuTrigger>
              <IconButton
                variant="normal"
                size="small"
                aria-label="회차 필터"
                style={{ width: 12, height: 12 }}
              >
                <IconChevronDown width={4} height={4} />
              </IconButton>
            </MenuTrigger>
          </FlexBox>
          <MenuContent position="bottom-start" offset={4}>
            <MenuList>
              <MenuItem variant="checkbox" value="all">
                전체 회차
              </MenuItem>
              {roundNumbers.map((roundNumber) => (
                <MenuItem
                  key={roundNumber}
                  variant="checkbox"
                  value={String(roundNumber)}
                >
                  {roundNumber}차
                </MenuItem>
              ))}
            </MenuList>
          </MenuContent>
        </Menu>
      ),
      width: 110,
      render: ({ round }) => (
        <StatusBadge label={`${round.roundNumber}차`} tone="info" />
      ),
    },
    {
      key: "answeredAt",
      header: (
        <Popover open={isDateFilterOpen} onOpenChange={setIsDateFilterOpen}>
          <FlexBox alignItems="center" style={{ gap: 4 }}>
            <span>답변일시</span>
            <PopoverTrigger>
              <IconButton
                variant="normal"
                size="small"
                aria-label="답변일시 필터"
                style={{ width: 12, height: 12 }}
              >
                <IconChevronDown width={6} height={6} />
              </IconButton>
            </PopoverTrigger>
          </FlexBox>
          <PopoverContent
            position="bottom-start"
            offset={4}
            disablePortal={false}
          >
            <DateCalendar
              value={dateFilter || undefined}
              onChange={(value) => {
                const nextDate =
                  value instanceof Date
                    ? value.toISOString().slice(0, 10)
                    : (value?.slice(0, 10) ?? "");
                setDateFilter(nextDate);
                setIsDateFilterOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      ),
      width: 140,
      render: ({ round }) => (
        <span style={{ whiteSpace: "nowrap" }}>{round.createdAt}</span>
      ),
    },
    {
      key: "question",
      header: "Q",
      render: ({ question }) => (
        <TruncatedText
          text={question?.content ?? "(삭제된 질문)"}
          variant="body1"
          weight="medium"
          maxWidth={280}
        />
      ),
    },
    {
      key: "answer",
      header: "A",
      render: ({ answer }) => (
        <TruncatedText
          text={answer.answerText}
          variant="body1"
          weight="medium"
          maxWidth={320}
        />
      ),
    },
  ];

  return (
    <>
      <FlexBox justifyContent="flex-end" style={{ marginBottom: 16 }}>
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="질문 또는 답변 검색"
        />
      </FlexBox>
      <DataTable
        columns={columns}
        rows={filteredAnswers}
        rowKey={({ round, answer }) => `${round.id}_${answer.questionId}`}
        emptyMessage="답변한 피드백이 없어요."
        onRowClick={setSelected}
      />

      <Modal
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <ModalContainer size="medium">
          <ModalContent>
            <ModalContentItem style={{ gap: 8 }}>
              <FlexBox alignItems="center" style={{ gap: 6 }}>
                {selected && (
                  <StatusBadge
                    label={`${selected.round.roundNumber}차`}
                    tone="info"
                  />
                )}
                <Typography
                  variant="caption1"
                  color="semantic.label.alternative"
                >
                  {selected?.round.createdAt}
                </Typography>
              </FlexBox>
              <ModalHeading>
                Q. {selected?.question?.content ?? "(삭제된 질문)"}
              </ModalHeading>
            </ModalContentItem>
            <ModalContentItem>
              <Typography variant="body1" color="semantic.label.normal">
                A.{" "}
                {selected && (
                  <BoldMarkupText text={selected.answer.answerText} />
                )}
              </Typography>
            </ModalContentItem>
            <ModalContentItem
              style={{ flexDirection: "row", justifyContent: "flex-end" }}
            >
              <Button
                variant="outlined"
                color="assistive"
                onClick={() => setSelected(null)}
              >
                닫기
              </Button>
            </ModalContentItem>
          </ModalContent>
        </ModalContainer>
      </Modal>
    </>
  );
}

function FeedbackPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") ?? "questions";

  return (
    <>
      <PageHeader
        title="열린피드백 관리"
        description="사용자 질문에 답변하고 피드백을 관리해요."
      />

      <Tab
        value={tab}
        onValueChange={(value) => setSearchParams({ tab: value })}
      >
        <TabList size="medium" style={{ marginBottom: 20 }}>
          <TabListItem value="questions">사용자 질문</TabListItem>
          <TabListItem value="all">전체 피드백</TabListItem>
          <TabListItem value="settings">운영 설정</TabListItem>
        </TabList>

        <TabPanel value="questions">
          <QuestionsPanel />
        </TabPanel>
        <TabPanel value="all">
          <AllFeedbackPanel />
        </TabPanel>
        <TabPanel value="settings">
          <OperatingSettingsPanel />
        </TabPanel>
      </Tab>
    </>
  );
}

export default FeedbackPage;
