import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  DatePicker,
  FlexBox,
  Option,
  Select,
  TextField,
  Typography,
  useToast,
  type DateType,
} from "@wanteddev/wds";
import PageHeader from "../../components/common/PageHeader";
import FormItem from "../../components/common/FormItem";
import InfoNotice from "../../components/common/InfoNotice";
import { useLockers } from "./store";
import { formatSemesterLabel } from "./types";

const emptyForm = {
  year: new Date().getFullYear(),
  term: 1 as 1 | 2,
  applyStartDate: "",
  applyEndDate: "",
  useStartDate: "",
  useEndDate: "",
};

function toDateValue(value: DateType) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

function LockerSemesterFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { semesters, addSemester, updateSemester } = useLockers();
  const toast = useToast();

  const existing = id
    ? semesters.find((semester) => semester.id === id)
    : undefined;
  const [form, setForm] = useState(() =>
    existing
      ? {
          year: existing.year,
          term: existing.term,
          applyStartDate: existing.applyStartDate,
          applyEndDate: existing.applyEndDate,
          useStartDate: existing.useStartDate,
          useEndDate: existing.useEndDate,
        }
      : emptyForm,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const today = new Date().toISOString().slice(0, 10);
  const isApplying = Boolean(existing && today >= existing.applyStartDate && today <= existing.applyEndDate);
  const isEnded = Boolean(existing && today > existing.applyEndDate);

  const goBackToSchedule = () => navigate("/lockers?tab=schedule");

  const handleSubmit = () => {
    if (isEnded) return;
    const nextErrors: Record<string, string> = {};
    if (!form.applyStartDate || !form.applyEndDate) {
      nextErrors.apply = "신청 시작일과 마감일을 모두 입력해주세요.";
    } else if (form.applyStartDate > form.applyEndDate) {
      nextErrors.apply = "신청 마감일은 신청 시작일 이후여야 해요.";
    } else if (isApplying && existing && form.applyEndDate < existing.applyEndDate) {
      nextErrors.apply = "진행 중인 일정의 신청 마감일은 기존 날짜보다 앞당길 수 없어요.";
    }
    if (!form.useStartDate || !form.useEndDate) {
      nextErrors.use = "사용 시작일과 종료일을 모두 입력해주세요.";
    } else if (form.useStartDate > form.useEndDate) {
      nextErrors.use = "사용 종료일은 사용 시작일 이후여야 해요.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (isEdit && id) {
      updateSemester(id, form);
      toast({
        content: `${formatSemesterLabel(form)} 일정이 수정되었어요.`,
        variant: "positive",
      });
    } else {
      addSemester(form);
      toast({
        content: `${formatSemesterLabel(form)} 신청 일정이 등록되었어요.`,
        variant: "positive",
      });
    }
    goBackToSchedule();
  };

  return (
    <>
      <PageHeader
        title={isEdit ? "신청 일정 수정" : "새 학기 신청 일정 등록"}
      />
      {isApplying && <InfoNotice>신청이 진행 중이라 학기와 신청 시작일은 수정할 수 없어요. 신청 마감일은 연장만 가능하며, 사용 가능 기간은 수정할 수 있어요.</InfoNotice>}
      {isEnded && <InfoNotice>신청이 종료된 일정은 읽기 전용이에요.</InfoNotice>}

      <fieldset disabled={isEnded} style={{ margin: 0, padding: 0, border: 0 }}><FlexBox className="locker-semester-form" flexDirection="column" style={{ gap: 20, maxWidth: 640 }}>
        <FlexBox
          className="locker-semester-section"
          flexDirection="column"
          style={{
            gap: 12,
            padding: 24,
            borderRadius: 20,
            border: "1px solid var(--semantic-line-normal-normal)",
          }}
        >
          <Typography variant="body1" weight="bold">
            학기 설정
          </Typography>
          <fieldset disabled={isEdit} style={{ margin: 0, padding: 0, border: 0 }}><FlexBox className="locker-semester-term-fields" style={{ gap: 16 }}>
            <FlexBox className="locker-semester-term-field" style={{ width: 160 }}>
              <FormItem
                label="연도"
                required
                labelVariant="body1"
                labelWeight="regular"
              >
                <TextField
                  type="number"
                  disabled={isEdit || isEnded}
                  value={String(form.year)}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      year: Number(e.target.value) || form.year,
                    })
                  }
                />
              </FormItem>
            </FlexBox>
            <FlexBox className="locker-semester-term-field" style={{ width: 160 }}>
              <FormItem
                label="학기"
                required
                labelVariant="body1"
                labelWeight="regular"
              >
                <Select
                  disabled={isEdit || isEnded}
                  value={String(form.term)}
                  onChange={(v) =>
                    setForm({ ...form, term: Number(v) as 1 | 2 })
                  }
                >
                  <Option value="1">1학기</Option>
                  <Option value="2">2학기</Option>
                </Select>
              </FormItem>
            </FlexBox>
          </FlexBox></fieldset>
        </FlexBox>

        <FlexBox
          className="locker-semester-section"
          flexDirection="column"
          style={{
            gap: 12,
            padding: 24,
            borderRadius: 20,
            border: "1px solid var(--semantic-line-normal-normal)",
          }}
        >
          <Typography variant="body1" weight="bold">
            신청 기간
          </Typography>
          <FlexBox
            className="locker-semester-date-range"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
              gap: 12,
              alignItems: "end",
              width: "100%",
            }}
          >
            <fieldset disabled={isApplying} style={{ margin: 0, padding: 0, border: 0, minWidth: 0 }}><FlexBox style={{ minWidth: 0 }}>
              <FormItem
                label="신청 시작일"
                required
                error={errors.apply}
                labelVariant="body1"
                labelWeight="regular"
                style={{ width: "100%" }}
              >
                <DatePicker
                  width="100%"
                  format="YYYY-MM-DD"
                  disabled={isApplying || isEnded}
                  value={form.applyStartDate ? new Date(`${form.applyStartDate}T00:00:00`) : undefined}
                  onChange={(value) => setForm({ ...form, applyStartDate: toDateValue(value) })}
                />
              </FormItem>
            </FlexBox></fieldset>
            <FlexBox
              className="locker-semester-date-separator"
              alignItems="center"
              justifyContent="center"
              style={{ height: 48 }}
            >
              <Typography variant="body1" color="semantic.label.alternative">
                ~
              </Typography>
            </FlexBox>
            <FlexBox style={{ minWidth: 0 }}>
              <FormItem
                label="신청 마감일"
                required
                labelVariant="body1"
                labelWeight="regular"
                style={{ width: "100%" }}
              >
                <DatePicker
                  width="100%"
                  format="YYYY-MM-DD"
                  disabled={isEnded}
                  value={form.applyEndDate ? new Date(`${form.applyEndDate}T00:00:00`) : undefined}
                  onChange={(value) => setForm({ ...form, applyEndDate: toDateValue(value) })}
                />
              </FormItem>
            </FlexBox>
          </FlexBox>
        </FlexBox>

        <FlexBox
          className="locker-semester-section"
          flexDirection="column"
          style={{
            gap: 12,
            padding: 24,
            borderRadius: 20,
            border: "1px solid var(--semantic-line-normal-normal)",
          }}
        >
          <Typography variant="body1" weight="bold">
            사용 가능 기간
          </Typography>
          <FlexBox
            className="locker-semester-date-range"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
              gap: 12,
              alignItems: "end",
              width: "100%",
            }}
          >
            <FlexBox style={{ minWidth: 0 }}>
              <FormItem
                label="사용 시작일"
                required
                error={errors.use}
                labelVariant="body1"
                labelWeight="regular"
                style={{ width: "100%" }}
              >
                <DatePicker
                  width="100%"
                  format="YYYY-MM-DD"
                  disabled={isEnded}
                  value={form.useStartDate ? new Date(`${form.useStartDate}T00:00:00`) : undefined}
                  onChange={(value) => setForm({ ...form, useStartDate: toDateValue(value) })}
                />
              </FormItem>
            </FlexBox>
            <FlexBox
              className="locker-semester-date-separator"
              alignItems="center"
              justifyContent="center"
              style={{ height: 48 }}
            >
              <Typography variant="body1" color="semantic.label.alternative">
                ~
              </Typography>
            </FlexBox>
            <FlexBox style={{ minWidth: 0 }}>
              <FormItem
                label="사용 종료일"
                required
                labelVariant="body1"
                labelWeight="regular"
                style={{ width: "100%" }}
              >
                <DatePicker
                  width="100%"
                  format="YYYY-MM-DD"
                  disabled={isEnded}
                  value={form.useEndDate ? new Date(`${form.useEndDate}T00:00:00`) : undefined}
                  onChange={(value) => setForm({ ...form, useEndDate: toDateValue(value) })}
                />
              </FormItem>
            </FlexBox>
          </FlexBox>
        </FlexBox>

        <FlexBox justifyContent="flex-end" style={{ gap: 8 }}>
          <Button variant="solid" color="primary" disabled={isEnded} onClick={handleSubmit}>
            {isEdit ? "수정 완료" : "등록하기"}
          </Button>
          <Button
            variant="outlined"
            color="assistive"
            onClick={goBackToSchedule}
          >
            취소
          </Button>
        </FlexBox>
      </FlexBox></fieldset>
    </>
  );
}

export default LockerSemesterFormPage;
