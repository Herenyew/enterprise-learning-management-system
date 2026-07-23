import { Bell, GraduationCap, Settings } from "lucide-react";
import { ADMIN_NAV_GROUPS, HR_NAV_GROUPS, ROLE_NAV } from "../../constants/navigation.constants";
import { P } from "../../constants/theme.constants";
import type { NavigateFn, Role, Screen } from "../../models/app.model";
import { Av } from "../common";
import { GroupedSidebarNav } from "./GroupedSidebarNav";
import { SidebarNavBtn } from "./SidebarNavBtn";

export function Sidebar({
  screen,
  navigate,
  role,
}: {
  screen: Screen;
  navigate: NavigateFn;
  role: Role;
}) {
  const useGrouped = role === "hr" || role === "admin";
  const nav = ROLE_NAV[role];
  const groups = role === "admin" ? ADMIN_NAV_GROUPS : HR_NAV_GROUPS;

  return (
    <aside
      className="w-[250px] flex-shrink-0 flex flex-col h-full overflow-y-auto"
      style={{ background: P.deepOlive }}
    >
      <div className="px-6 py-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: P.olive }}
          >
            <GraduationCap size={16} className="text-white" />
          </div>
          <div>
            <p
              className="text-sm font-bold text-white"
              style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}
            >
              LearnOS
            </p>
            <p className="text-[10px] font-medium" style={{ color: P.sage }}>
              Enterprise Learning
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-5 px-4 overflow-y-auto">
        {useGrouped ? (
          <GroupedSidebarNav groups={groups} screen={screen} navigate={navigate} />
        ) : (
          <div className="space-y-2">
            <p
              className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-3"
              style={{ color: "rgba(110,231,183,0.4)" }}
            >
              Navigation
            </p>
            {nav.map((item) => (
              <SidebarNavBtn key={item.id} {...item} screen={screen} navigate={navigate} />
            ))}
          </div>
        )}
        <div className="pt-5 mt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <SidebarNavBtn
            id="notifications"
            label="Notifications"
            icon={Bell}
            screen={screen}
            navigate={navigate}
          />
        </div>
      </nav>

      <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div
          className="flex items-center gap-3 p-3 rounded-xl cursor-pointer"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <Av initials="AM" size={32} color={P.olive} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Alex Mercer</p>
            <p className="text-[10px] truncate" style={{ color: P.sage }}>
              Senior Engineer - L8
            </p>
          </div>
          <Settings size={13} style={{ color: P.sage }} className="flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
}
