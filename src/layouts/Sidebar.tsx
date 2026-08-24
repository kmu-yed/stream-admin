import { Fragment } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FlexBox,
  IconButton,
  List,
  ListCell,
  ListCellContent,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Typography,
} from "@wanteddev/wds";
import { IconSidebarCollapse, IconSidebarExpand } from "../components/icons/SidebarToggleIcons";
import { navGroups } from "../nav/navConfig";

const SIDEBAR_WIDTH = 248;
const SIDEBAR_COLLAPSED_WIDTH = 72;

type SidebarProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

function Sidebar({ collapsed, onToggleCollapsed }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <FlexBox
      as="nav"
      flexDirection="column"
      style={{
        width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        flexShrink: 0,
        height: "100vh",
        borderRight: "1px solid var(--semantic-line-normal-normal)",
        background: "var(--semantic-background-normal-alternative)",
        overflowX: "hidden",
        overflowY: "auto",
        transition: "width 0.2s ease",
      }}
    >
      <FlexBox
        alignItems="center"
        justifyContent={collapsed ? "center" : "space-between"}
        style={{ height: 64, padding: collapsed ? "0 12px" : "0 12px 0 24px", flexShrink: 0 }}
      >
        {!collapsed && (
          <Typography variant="heading2" weight="bold" style={{ whiteSpace: "nowrap" }}>
            Stream 관리자
          </Typography>
        )}
        <IconButton variant="normal" size="small" onClick={onToggleCollapsed}>
          {collapsed ? (
            <IconSidebarExpand style={{ width: 20, height: 20, color: "var(--semantic-label-assistive)" }} />
          ) : (
            <IconSidebarCollapse style={{ width: 20, height: 20, color: "var(--semantic-label-assistive)" }} />
          )}
        </IconButton>
      </FlexBox>

      <FlexBox
        flexDirection="column"
        style={{ padding: collapsed ? "12px 12px 32px" : "12px 16px 32px", gap: 28 }}
      >
        {navGroups.map((group) => (
          <FlexBox key={group.label || group.items[0]?.path} flexDirection="column" style={{ gap: 6 }}>
            {!collapsed && group.label && (
              <FlexBox style={{ padding: "6px 12px" }}>
                <Typography
                  variant="caption1"
                  color="semantic.label.alternative"
                  weight="medium"
                >
                  {group.label}
                </Typography>
              </FlexBox>
            )}
            <List style={{ gap: 0 }}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const selected =
                  item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);
                const listCell = (
                  <ListCell
                    selected={selected}
                    verticalPadding="small"
                    alignItems="center"
                    onClick={() => navigate(item.path)}
                    textProps={{ variant: "body2" }}
                    style={{
                      height: 40,
                      borderRadius: 8,
                      cursor: "pointer",
                      paddingLeft: collapsed ? 0 : 12,
                      paddingRight: collapsed ? 0 : 12,
                      justifyContent: collapsed ? "center" : undefined,
                    }}
                    leadingContent={
                      <ListCellContent variant="icon">
                        <Icon
                          width={20}
                          height={20}
                          style={{
                            color: selected
                              ? "var(--semantic-primary-normal)"
                              : "var(--semantic-label-alternative)",
                          }}
                        />
                      </ListCellContent>
                    }
                  >
                    {!collapsed && item.label}
                  </ListCell>
                );

                return collapsed ? (
                  <Tooltip mode="hover" key={item.path}>
                    <TooltipTrigger>{listCell}</TooltipTrigger>
                    <TooltipContent position="right-center">{item.label}</TooltipContent>
                  </Tooltip>
                ) : (
                  <Fragment key={item.path}>{listCell}</Fragment>
                );
              })}
            </List>
          </FlexBox>
        ))}
      </FlexBox>
    </FlexBox>
  );
}

export default Sidebar;
