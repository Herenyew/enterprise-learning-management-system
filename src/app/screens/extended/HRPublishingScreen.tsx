import React, { useEffect, useState } from "react";
import {
  AICard,
  AlertCircle,
  Archive,
  Area,
  AreaChart,
  Av,
  Award,
  Badge,
  Bar,
  BarChart2,
  BookOpen,
  Bot,
  Building,
  CERT_TEMPLATES,
  Calendar,
  CartesianGrid,
  Cell,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  ConfigPublishing,
  Copy,
  Cpu,
  Download,
  Edit,
  EditableSelect,
  Eye,
  FilePlus,
  FileText,
  Filter,
  Flag,
  Globe,
  HelpCircle,
  Input,
  Layers,
  Link,
  Lock,
  MODERATION_ITEMS,
  Medal,
  MessageSquare,
  MoreHorizontal,
  P,
  PBar,
  PROGRAMS_DATA,
  PROGRAM_TASKS_INITIAL,
  PROGRAM_TEMPLATE_LIBRARY,
  PROGRAM_TYPE_DEFAULTS,
  PUBLISHING_QUEUE,
  PageHeader,
  Pie,
  PieChart,
  Play,
  Plus,
  PlusCircle,
  ReBarChart,
  RefreshCw,
  ResponsiveContainer,
  SCORM_PACKAGES,
  Search,
  Select,
  Send,
  Settings,
  Shield,
  Signature,
  Sparkles,
  Stamp,
  Star,
  StatCard,
  TEAM_MEMBERS,
  TNA_DEPT_DATA,
  TNA_REQUESTS,
  TNA_TREND,
  Target,
  Textarea,
  ToggleLeft,
  ToggleRight,
  Tooltip,
  Trash2,
  TrendingDown,
  TrendingUp,
  Trophy,
  Upload,
  User,
  UserCheck,
  Users,
  Video,
  Wand2,
  X,
  XAxis,
  YAxis,
  Zap,
} from "./extended.shared";
import type { Screen } from "../../models/app.model";
import type {
  HRProgram,
  ProgramCohort,
  ProgramTask,
  ProgramTaskSource,
  ProgramTaskType,
  ProgramTemplate,
  ProgramTypeOption,
} from "./extended.shared";

export function HRPublishingScreen({ navigate }: { navigate: (s: string) => void }) {
  const [filter, setFilter] = useState("In Review");
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"queue" | "rules">("queue");

  return (
    <div className="p-6 space-y-5 max-w-[1300px]">
      <PageHeader
        title="Publishing Governance"
        sub="Review course submissions and configure publishing governance before courses go live"
      />

      <div className="flex gap-2 border-b" style={{ borderColor: P.border }}>
        {(
          [
            ["queue", "Review Queue"],
            ["rules", "Governance Rules"],
          ] as [typeof activeTab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="px-4 py-2 text-sm font-semibold border-b-2 transition-colors"
            style={{
              borderColor: activeTab === id ? P.olive : "transparent",
              color: activeTab === id ? P.olive : P.textMuted,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "rules" ? (
        <ConfigPublishing />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {(
              [
                ["In Review", "3", Target, P.gold, P.goldLight],
                ["Approved", "8", CheckCircle, "#5A7A2A", "#D8EDCC"],
                ["Published", "124", Globe, P.olive, P.lightSage],
                ["Rejected", "6", X, "#C0392B", "#FEE2E2"],
              ] as [string, string, React.ElementType, string, string][]
            ).map(([l, v, Icon, color, bg]) => (
              <div
                key={l}
                onClick={() => setFilter(l)}
                className="bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all"
                style={{
                  borderColor: filter === l ? P.olive : P.border,
                  background: filter === l ? P.paleGreen : "white",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-medium" style={{ color: P.textMuted }}>
                    {l}
                  </p>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: bg }}
                  >
                    <Icon size={13} style={{ color }} />
                  </div>
                </div>
                <p
                  className="text-2xl font-bold"
                  style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
                >
                  {v}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {PUBLISHING_QUEUE.filter((q) => filter === "All" || q.status === filter).map(
              (course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl border p-5"
                  style={{ borderColor: P.border }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${P.olive}14` }}
                    >
                      <BookOpen size={22} style={{ color: P.olive }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold" style={{ color: P.text }}>
                          {course.title}
                        </p>
                        <Badge
                          label={course.status}
                          variant={
                            course.status === "Approved"
                              ? "green"
                              : course.status === "In Review"
                                ? "gold"
                                : "red"
                          }
                        />
                        <Badge
                          label={course.risk + " Risk"}
                          variant={
                            course.risk === "Low"
                              ? "green"
                              : course.risk === "Medium"
                                ? "gold"
                                : "red"
                          }
                        />
                      </div>
                      <div
                        className="flex flex-wrap items-center gap-3 text-[11px]"
                        style={{ color: P.textMuted }}
                      >
                        <span className="flex items-center gap-1">
                          <User size={11} />
                          {course.creator}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building size={11} />
                          {course.dept}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen size={11} />
                          {course.level}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText size={11} />
                          {course.lessons} lessons
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          Submitted {course.submittedDate}
                        </span>
                      </div>
                    </div>
                    {course.status === "In Review" && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white"
                          style={{ background: "#5A7A2A" }}
                          data-prototype-action="true"
                        >
                          <CheckCircle size={12} /> Approve
                        </button>
                        <button
                          onClick={() => setRejectModal(course.id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold"
                          style={{ background: "#FEE2E2", color: "#C0392B" }}
                        >
                          <X size={12} /> Reject
                        </button>
                        <button
                          className="p-2 rounded-lg"
                          style={{ border: `1px solid ${P.border}` }}
                          data-prototype-action="true"
                        >
                          <Eye size={14} style={{ color: P.textMuted }} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>

          {rejectModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-6"
              style={{ background: "rgba(46,58,21,0.7)" }}
              onClick={() => setRejectModal(null)}
            >
              <div
                className="bg-white rounded-2xl border p-6 max-w-md w-full"
                style={{ borderColor: P.border }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-base font-bold mb-1" style={{ color: P.text }}>
                  Reject Course Submission
                </h3>
                <p className="text-xs mb-4" style={{ color: P.textMuted }}>
                  The course creator will be notified with your feedback.
                </p>
                <Textarea
                  label="Rejection Reason"
                  placeholder="Explain what needs to be revised before resubmission…"
                  rows={4}
                  required
                />
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setRejectModal(null)}
                    className="flex-1 py-2.5 rounded-xl text-sm"
                    style={{ border: `1px solid ${P.border}`, color: P.textMid }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setRejectModal(null)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: "#C0392B", color: "white" }}
                  >
                    Send Rejection
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. HR CONTENT MODERATION
// ─────────────────────────────────────────────────────────────
