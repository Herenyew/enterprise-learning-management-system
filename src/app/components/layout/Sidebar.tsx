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
  setRole,
}: {
  screen: Screen;
  navigate: NavigateFn;
  role: Role;
  setRole: (r: Role) => void;
}) {
  const useGrouped = role === "hr" || role === "admin";
  const nav = ROLE_NAV[role];
  const groups = role === "admin" ? ADMIN_NAV_GROUPS : HR_NAV_GROUPS;
  const roles: { id: Role; label: string }[] = [
    { id: "learner", label: "Learner" },
    { id: "hr", label: "HR Admin" },
    { id: "manager", label: "Manager" },
    { id: "creator", label: "Creator" },
    { id: "admin", label: "Admin" },
  ];
  const defaultScreen: Record<Role, Screen> = {
    learner: "dashboard",
    hr: "hr-dashboard",
    manager: "manager",
    creator: "my-courses-builder",
    admin: "hr-dashboard",
  };

  return (
    <aside
      className="w-[230px] flex-shrink-0 flex flex-col h-full overflow-y-auto"
      style={{ background: P.deepOlive }}
    >
      <div className="px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2.5">
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

      <div className="px-3 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <p
          className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-1.5"
          style={{ color: "rgba(168,181,138,0.45)" }}
        >
          Demo Role
        </p>
        <div className="flex flex-wrap gap-1">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setRole(r.id);
                navigate(defaultScreen[r.id]);
              }}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md transition-colors"
              style={role === r.id ? { background: P.olive, color: "white" } : { color: P.sage }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <nav className="flex-1 py-3 px-3 overflow-y-auto">
        {useGrouped ? (
          <GroupedSidebarNav groups={groups} screen={screen} navigate={navigate} />
        ) : (
          <div className="space-y-0.5">
            <p
              className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-2"
              style={{ color: "rgba(168,181,138,0.4)" }}
            >
              Navigation
            </p>
            {nav.map((item) => (
              <SidebarNavBtn key={item.id} {...item} screen={screen} navigate={navigate} />
            ))}
          </div>
        )}
        <div className="pt-3 mt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <SidebarNavBtn
            id="notifications"
            label="Notifications"
            icon={Bell}
            screen={screen}
            navigate={navigate}
          />
        </div>
      </nav>

      <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div
          className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <Av initials="AM" size={32} color={P.olive} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Alex Mercer</p>
            <p className="text-[10px] truncate" style={{ color: P.sage }}>
              Senior Engineer · L8
            </p>
          </div>
          <Settings size={13} style={{ color: P.sage }} className="flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
}
