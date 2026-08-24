import type { ComponentType, SVGProps } from "react";
import {
  IconHome,
  IconCalendar,
  IconStorage,
  IconPouch,
  IconMessage,
  IconCircleQuestion,
  IconFolder,
  IconFlag,
  IconMegaphone,
  IconBubble,
  IconPersons,
  IconDocumentText,
} from "@wanteddev/wds-icon";

export type NavIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type NavItem = {
  label: string;
  path: string;
  icon: NavIcon;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: "",
    items: [{ label: "홈", path: "/", icon: IconHome }],
  },
  {
    label: "운영",
    items: [
      { label: "행사 관리", path: "/events", icon: IconCalendar },
      { label: "사물함 관리", path: "/lockers", icon: IconStorage },
      { label: "빌릴게 관리", path: "/rentals", icon: IconPouch },
    ],
  },
  {
    label: "콘텐츠",
    items: [
      { label: "공지 관리", path: "/notices", icon: IconMessage },
      { label: "열린피드백 관리", path: "/feedback", icon: IconCircleQuestion },
      { label: "아카이빙 게시물 관리", path: "/archiving", icon: IconFolder },
      { label: "슬랑제 게시물 관리", path: "/slangje", icon: IconFlag },
      { label: "홈 공지 배너 관리", path: "/home-banner", icon: IconMegaphone },
    ],
  },
  {
    label: "기타 관리",
    items: [
      { label: "챗봇 관리", path: "/chatbot", icon: IconBubble },
      { label: "학생회비 관리", path: "/student-council", icon: IconPersons },
      { label: "약관/정책 관리", path: "/policies", icon: IconDocumentText },
    ],
  },
];

export const navItems: NavItem[] = navGroups.flatMap((group) => group.items);
