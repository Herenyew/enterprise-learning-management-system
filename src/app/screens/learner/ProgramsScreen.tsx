import React, { useState } from "react";
import {
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Users,
} from "lucide-react";
import { Chip, PBar } from "../../components/common";
import { COURSES, PROGRAMS } from "../../constants/mockData";
import { P } from "../../constants/theme.constants";
import type { NavigateFn } from "../../models/app.model";
export function ProgramsScreen({ navigate }: { navigate: NavigateFn }) {
  const [selected, setSelected] = useState<string | null>(null);
  const prog = selected ? PROGRAMS.find((p) => p.id === selected) : null;

  return (
    <div className="p-6 space-y-5 max-w-[1200px]">
      {!selected ? (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-xl font-bold mb-1"
                style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
              >
                Learning Programs
              </h1>
              <p className="text-sm" style={{ color: P.textMuted }}>
                Structured learning paths to advance your career
              </p>
            </div>
            <button
              className="flex items-center gap-1.5 text-sm font-medium"
              style={{ color: P.olive }}
              data-prototype-action="true"
            >
              <Sparkles size={14} style={{ color: P.gold }} /> AI-suggested programs
            </button>
          </div>
          <div
            className="rounded-2xl p-6 text-white flex items-center justify-between"
            style={{ background: `linear-gradient(135deg, ${P.darkOlive}, ${P.olive})` }}
          >
            <div>
              <Chip label="Featured Program" variant="gold" />
              <h2
                className="text-xl font-bold mt-2 mb-1"
                style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}
              >
                Future-Ready Leader Track 🌿
              </h2>
              <p className="text-sm mb-4 max-w-lg" style={{ color: "rgba(231,238,220,0.85)" }}>
                Complete all 6 courses to earn the coveted Future-Ready Leader certification —
                recognized across 120+ organizations.
              </p>
              <button
                onClick={() => setSelected("p1")}
                className="px-5 py-2 rounded-xl text-sm font-semibold"
                style={{ background: "white", color: P.darkOlive }}
              >
                Explore Program →
              </button>
            </div>
            <div className="hidden md:block text-6xl">🌿</div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {PROGRAMS.map((prog, i) => (
              <div
                key={prog.id}
                onClick={() => setSelected(prog.id)}
                className="bg-white rounded-xl border p-5 cursor-pointer group fade-in-up"
                style={{
                  borderColor: P.border,
                  animationDelay: `${i * 70}ms`,
                  transition:
                    "transform 200ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 200ms ease, border-color 200ms ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(-5px) scale(1.018)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 10px 28px rgba(107,122,58,0.14)";
                  (e.currentTarget as HTMLDivElement).style.borderColor = P.sage;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "";
                  (e.currentTarget as HTMLDivElement).style.borderColor = P.border;
                }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-3xl transition-transform duration-200 group-hover:scale-110">
                    {prog.badge}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold" style={{ color: P.text }}>
                      {prog.title}
                    </h3>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: P.textMuted }}>
                      {prog.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {prog.skills.map((s) => (
                    <Chip key={s} label={s} variant="sage" />
                  ))}
                </div>
                <div
                  className="flex items-center gap-4 text-[11px] mb-3"
                  style={{ color: P.textMuted }}
                >
                  <span className="flex items-center gap-1">
                    <BookOpen size={11} />
                    {prog.courses} courses
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {prog.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={11} />
                    {prog.enrolled.toLocaleString()}
                  </span>
                </div>
                {prog.progress > 0 ? (
                  <div>
                    <div
                      className="flex justify-between text-[10px] mb-1"
                      style={{ color: P.textMuted }}
                    >
                      <span>Progress</span>
                      <span style={{ color: prog.color }}>{prog.progress}%</span>
                    </div>
                    <PBar value={prog.progress} color={prog.color} height={5} />
                  </div>
                ) : (
                  <button
                    className="w-full py-2 text-white rounded-lg text-xs font-semibold"
                    style={{
                      background: P.darkOlive,
                      transition: "transform 150ms ease, box-shadow 150ms ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 4px 12px rgba(77,91,42,0.4)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.transform = "";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "";
                    }}
                    data-prototype-action="true"
                  >
                    Start Program →
                  </button>
                )}
                {/* Hover-reveal details */}
                <div
                  className="overflow-hidden transition-all duration-250 ease-out"
                  style={{ maxHeight: 0, opacity: 0 }}
                  ref={(el) => {
                    if (el) {
                      const p = el.closest(".group");
                      if (p) {
                        const show = () => {
                          el.style.maxHeight = "80px";
                          el.style.opacity = "1";
                          el.style.marginTop = "12px";
                        };
                        const hide = () => {
                          el.style.maxHeight = "0";
                          el.style.opacity = "0";
                          el.style.marginTop = "0";
                        };
                        p.addEventListener("mouseenter", show);
                        p.addEventListener("mouseleave", hide);
                      }
                    }
                  }}
                >
                  <div
                    className="pt-3 flex items-center justify-between text-[10px]"
                    style={{ borderTop: `1px solid ${P.border}`, color: P.textMuted }}
                  >
                    <span>🏆 {Math.round(prog.enrolled * 0.55).toLocaleString()} completed</span>
                    <span>
                      📅 Next milestone in <strong style={{ color: P.text }}>7 days</strong>
                    </span>
                    <span className="font-semibold" style={{ color: P.olive }}>
                      View →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        prog && (
          <>
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-1.5 text-sm"
              style={{ color: P.textMuted }}
            >
              <ChevronLeft size={16} /> All Programs
            </button>
            <div className="flex items-start gap-4">
              <div className="text-5xl">{prog.badge}</div>
              <div>
                <h1
                  className="text-2xl font-bold"
                  style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
                >
                  {prog.title}
                </h1>
                <p className="text-sm mt-1 mb-3" style={{ color: P.textMuted }}>
                  {prog.description}
                </p>
                <div className="flex items-center gap-4 text-xs" style={{ color: P.textMuted }}>
                  <span>
                    {prog.courses} courses · {prog.duration}
                  </span>
                  <span>{prog.enrolled.toLocaleString()} enrolled</span>
                  <span className="font-semibold" style={{ color: "#5A7A2A" }}>
                    {prog.progress > 0 ? `${prog.progress}% complete` : "Not started"}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {COURSES.slice(0, prog.courses).map((course, i) => (
                <div
                  key={course.id}
                  onClick={() => navigate("course-detail", course.id)}
                  className="bg-white rounded-xl border p-4 hover:shadow-md cursor-pointer flex items-center gap-3"
                  style={{ borderColor: P.border }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: course.color }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: P.text }}>
                      {course.title}
                    </p>
                    <p className="text-[10px]" style={{ color: P.textMuted }}>
                      {course.instructor} · {course.duration}
                    </p>
                    {course.progress > 0 && (
                      <PBar value={course.progress} color={course.color} height={3} />
                    )}
                  </div>
                  {course.progress === 100 ? (
                    <CheckCircle size={16} style={{ color: "#5A7A2A" }} className="flex-shrink-0" />
                  ) : (
                    <ChevronRight size={16} style={{ color: P.sage }} className="flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </>
        )
      )}
    </div>
  );
}

// ─── 11. HR DASHBOARD ─────────────────────────────────────────
