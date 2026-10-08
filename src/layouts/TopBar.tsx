import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Button,
  FlexBox,
  IconButton,
  Menu,
  MenuContent,
  MenuTrigger,
  Typography,
} from "@wanteddev/wds";
import {
  IconChevronDownSmall,
  IconLogout,
  IconMenu,
} from "@wanteddev/wds-icon";
import ConfirmModal from "../components/common/ConfirmModal";
import { useAuth } from "../features/auth/store";
import { useAdminManagement } from "../features/adminManagement/store";

function TopBar({
  onOpenMobileSidebar,
  compact,
  scrolled,
}: {
  onOpenMobileSidebar: () => void;
  compact: boolean;
  scrolled: boolean;
}) {
  const navigate = useNavigate();
  const { logout, studentId } = useAuth();
  const { admins } = useAdminManagement();
  const account = admins.find((admin) => admin.studentId === studentId);
  const role = account?.role ?? "학생";
  const [logoutMenuOpen, setLogoutMenuOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  return (
    <FlexBox
      as="header"
      className={`admin-topbar${compact ? " mobile-header-compact" : ""}`}
      alignItems="center"
      justifyContent="space-between"
      style={{
        flexShrink: 0,
        zIndex: 20,
        padding: "12px 96px 12px 80px",
        background: compact ? 'transparent' : "rgba(255, 255, 255, 0.78)",
        backdropFilter: compact ? 'none' : "blur(14px)",
        WebkitBackdropFilter: compact ? 'none' : "blur(14px)",
        borderBottom: !compact && scrolled
          ? "1px solid rgba(20, 35, 60, 0.05)"
          : "1px solid transparent",
      }}
    >
      <FlexBox
        className="mobile-topbar-brand"
        alignItems="center"
        style={{ gap: 12 }}
      >
        <IconButton
          variant="normal"
          size="medium"
          aria-label="메뉴 열기"
          onClick={onOpenMobileSidebar}
        >
          <IconMenu width={24} height={24} />
        </IconButton>
        <FlexBox
          className="mobile-topbar-wordmark"
          alignItems="center"
          style={{ gap: 5 }}
        >
          <img
            src="/brand/favicon.png"
            alt="Stream"
            style={{ width: 21, height: 21, objectFit: "contain" }}
          />
          <img
            src="/brand/stream-watermark.svg"
            alt="Stream"
            style={{ width: 75, height: 16.2, objectFit: "contain" }}
          />
          <Typography
            variant="label2"
            weight="medium"
            color="semantic.label.alternative"
            style={{ transform: "translateY(2px)" }}
          >
            관리자
          </Typography>
        </FlexBox>
      </FlexBox>
      <FlexBox
        className="desktop-topbar-account"
        style={{ marginLeft: "auto" }}
      >
        <Menu open={logoutMenuOpen} onOpenChange={setLogoutMenuOpen}>
          <MenuTrigger>
            <FlexBox
              className="topbar-account-trigger app-hoverable"
              alignItems="center"
              justifyContent="flex-end"
              style={{
                gap: 12,
                padding: "6px 8px",
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              <Avatar variant="person" size="small" />
              <FlexBox
                className="topbar-account-copy"
                flexDirection="column"
                alignItems="flex-start"
                style={{ gap: 1 }}
              >
                <FlexBox alignItems="center" style={{ gap: 5 }}>
                  <Typography variant="label1" weight="medium">
                    {account?.name ?? "학생회 관리자"}
                  </Typography>
                  <Typography variant="label1" color="semantic.label.assistive">
                    |
                  </Typography>
                  <Typography
                    variant="label1"
                    weight="medium"
                    style={{
                      color:
                        role === "관리자"
                          ? "var(--semantic-primary-normal)"
                          : "var(--semantic-label-alternative)",
                    }}
                  >
                    {role}
                  </Typography>
                </FlexBox>
              </FlexBox>
              <IconChevronDownSmall
                width={16}
                height={16}
                style={{ color: "var(--semantic-label-assistive)" }}
              />
            </FlexBox>
          </MenuTrigger>
          <MenuContent
            position="bottom-end"
            offset={8}
            className="topbar-account-menu"
            style={{ zIndex: 200 }}
          >
            <FlexBox flexDirection="column">
              <FlexBox
                className="account-menu-profile"
                flexDirection="column"
                alignItems="flex-start"
              >
                <FlexBox alignItems="center" style={{ gap: 5 }}>
                  <Typography variant="label1" weight="medium">
                    {account?.name ?? "학생회 관리자"}
                  </Typography>
                  <Typography variant="label1" color="semantic.label.assistive">
                    |
                  </Typography>
                  <Typography
                    variant="label1"
                    weight="medium"
                    style={{
                      color:
                        role === "관리자"
                          ? "var(--semantic-primary-normal)"
                          : "var(--semantic-label-alternative)",
                    }}
                  >
                    {role}
                  </Typography>
                </FlexBox>
                <Typography
                  variant="caption1"
                  color="semantic.label.alternative"
                >
                  {studentId}
                </Typography>
                <Typography
                  variant="caption1"
                  color="semantic.label.alternative"
                >
                  학생회 부서 · {account?.councilDepartment ?? "소속 없음"}
                </Typography>
              </FlexBox>
              <FlexBox style={{ padding: 8 }}>
                <Button
                  variant="outlined"
                  color="assistive"
                  leadingContent={<IconLogout width={18} height={18} />}
                  style={{
                    width: "100%",
                    color: "var(--semantic-status-negative)",
                    borderColor: "rgba(255, 77, 79, .4)",
                  }}
                  onClick={() => {
                    setLogoutMenuOpen(false);
                    setLogoutConfirmOpen(true);
                  }}
                >
                  로그아웃
                </Button>
              </FlexBox>
            </FlexBox>
          </MenuContent>
        </Menu>
      </FlexBox>
      <ConfirmModal
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        title="로그아웃하시겠어요?"
        description="현재 관리자 계정에서 로그아웃해요."
        confirmLabel="로그아웃"
        tone="negative"
        onConfirm={() => {
          logout();
          navigate("/login", { replace: true });
        }}
      />
    </FlexBox>
  );
}

export default TopBar;
