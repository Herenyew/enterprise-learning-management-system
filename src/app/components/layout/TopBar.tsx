import { Bell, HelpCircle, Search, X } from "lucide-react";
import { P } from "../../constants/theme.constants";
import type { NavigateFn, Role } from "../../models/app.model";
import { Av } from "../common";

// ─── TopBar ───────────────────────────────────────────────────

export function TopBar({
  navigate,
  role,
  searchQuery,
  setSearchQuery,
}: {
  navigate: NavigateFn;
  role: Role;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}) {
  const roleLabel: Record<Role, string> = {
    learner: "Learner Portal",
    hr: "HR Administration",
    manager: "Manager View",
    creator: "Course Creator Studio",
    admin: "System Administration",
  };
  return (
    <header
      className="bg-white px-8 py-4 flex items-center gap-6 flex-shrink-0"
      style={{ borderBottom: `1px solid ${P.border}` }}
    >
      <div className="flex-1">
        <div className="relative max-w-xl">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: P.sage }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) navigate("catalog");
            }}
            placeholder="Search courses, programs, people..."
            className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2"
            style={{ background: P.bg, border: `1px solid ${P.border}`, color: P.text }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md"
              style={{ color: P.textMuted }}
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs font-medium hidden md:block" style={{ color: P.textMuted }}>
          {roleLabel[role]}
        </span>
        <div className="w-px h-5 hidden md:block" style={{ background: P.border }} />
        <button
          onClick={() => navigate("notifications")}
          className="relative p-2.5 rounded-xl transition-colors"
          style={{ background: "transparent" }}
        >
          <Bell size={18} style={{ color: P.textMuted }} />
          <span
            className="absolute top-1 right-1 w-2 h-2 rounded-full border-2 border-white"
            style={{ background: "#C0392B" }}
          />
        </button>
        <button className="p-2.5 rounded-xl transition-colors" data-prototype-action="true">
          <HelpCircle size={18} style={{ color: P.textMuted }} />
        </button>
        <div
          className="flex items-center gap-2 pl-2"
          style={{ borderLeft: `1px solid ${P.border}` }}
        >
          <Av initials="AM" size={34} color={P.olive} />
          <div className="hidden sm:block">
            <p className="text-xs font-semibold" style={{ color: P.text }}>
              Alex Mercer
            </p>
            <p className="text-[10px]" style={{ color: P.textMuted }}>
              ADIU PLC - Engineering
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
