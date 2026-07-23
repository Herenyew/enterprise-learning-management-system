// Extensions3.tsx — Configuration Center, Analytics Center, Course Builder,
// Certification Management, Gamification, Two-Level Moderation
// Olive / Sage / Gold enterprise design language

import React, { useEffect, useState } from "react";
import {
  ContentWorkflowModal,
  DEFAULT_QUESTION_TYPE_CONFIG,
  describeAttemptScoringPolicy,
  loadAttemptScoringPolicy,
  saveAttemptScoringPolicy,
  type AttemptScoringMode,
  type AttemptScoringPolicy,
  type ContentAttachment,
  type ContentType,
  type QuestionTypeConfig,
  SavedContentItem,
  QuizOnlyModal,
  QuizRow,
  QuizPreviewModal,
} from "../../Extensions6";
import {
  EnrollmentRulesCrud,
  ReportsCrud,
  WidgetsCrud,
  WorkflowsCrud,
  XPRulesCrud,
} from "../../Extensions5";
import {
  BookOpen,
  Award,
  BarChart2,
  Target,
  CheckCircle,
  AlertCircle,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  MessageSquare,
  Star,
  Play,
  Video,
  FileText,
  HelpCircle,
  Globe,
  Search,
  Sparkles,
  TrendingUp,
  TrendingDown,
  X,
  Copy,
  Archive,
  Send,
  Link,
  UserCheck,
  Layers,
  Shield,
  Eye,
  Settings,
  Zap,
  Lock,
  Users,
  Clock,
  Filter,
  MoreHorizontal,
  Flag,
  Upload,
  User,
  LayoutDashboard,
  Activity,
  Cpu,
  Music,
  RefreshCw,
  GitBranch,
  Tag,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
  Trophy,
  Medal,
  Check,
  Wand2,
  PlusCircle,
  FileCheck,
  Bookmark,
  AlertTriangle,
  Image as ImageIcon,
  MousePointer2,
  Move,
  Palette,
  Square,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart as ReBarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  AICard,
  ANALYTICS_TREND,
  Av,
  CERT_TEMPLATES,
  CERT_TEMPLATE_STORAGE_KEY,
  CONTENT_TYPES,
  CONTENT_TYPE_ICONS,
  COURSES_MINI,
  COURSE_COMMENTS,
  COURSE_TEMPLATE_STORAGE_KEY,
  CREATOR_CERTIFICATE_TEMPLATES,
  CertificateTemplateReviewModal,
  CertificationTemplate,
  CfgField,
  CfgSection,
  CfgToggle,
  Chip,
  CourseContentTypeConfig,
  CourseCreationTemplate,
  CourseDraftDetails,
  CourseMini,
  CourseTemplateChapter,
  CourseTemplateContentItem,
  CreatorCertificateTemplate,
  DEFAULT_CONFIG_PROGRAM_TEMPLATES,
  DEFAULT_CONTENT_TYPE_CONFIG,
  DEFAULT_COURSE_CREATION_TEMPLATES,
  EMPLOYEES,
  EXTERNAL_PROVIDERS,
  LearningProgramTemplate,
  LearningProgramTemplateDraft,
  MODERATION_ITEMS,
  ModerationItem,
  P,
  PBar,
  PROGRAM_TEMPLATE_CONFIG_STORAGE_KEY,
  PageHeader,
  PreCourseAssessmentPolicy,
  SaveBar,
  SavedCreatorCourse,
  VERSIONS,
  contentSourceLabelFor,
  createBlankCourseTemplate,
  createCourseContentItemFromSaved,
  createCourseDraftFromTemplate,
  createCustomCourseDraft,
  createExistingCourseDraft,
  createProgramTemplateDraft,
  createSavedCreatorCourseDraft,
  getContentItemAttachments,
  loadConfigProgramTemplates,
  loadCourseCreationTemplates,
  normalizeConfigProgramTemplate,
  parseCourseTemplateChapters,
  saveConfigProgramTemplates,
  saveCourseCreationTemplates,
  serializeCourseTemplateChapters,
  splitTemplateLines,
} from "./configuration.shared";

export function ConfigLearningPrograms() {
  const [progTypes, setProgTypes] = useState([
    "New Employee",
    "Graduate Trainee",
    "Leadership",
    "Technical",
    "Compliance",
  ]);
  const [newType, setNewType] = useState("");
  const [approvalSteps, setApprovalSteps] = useState([
    { id: "s1", label: "Line Manager", role: "Manager", required: true },
    { id: "s2", label: "HR Review", role: "HR Admin", required: true },
    { id: "s3", label: "L&D Sign-off", role: "L&D Manager", required: false },
  ]);
  const [enrollRules, setEnrollRules] = useState([
    { id: "r1", label: "Auto-enroll on hire", enabled: true },
    { id: "r2", label: "Require manager approval", enabled: false },
    { id: "r3", label: "Enforce pre-requisites", enabled: true },
    { id: "r4", label: "Waitlist when at capacity", enabled: true },
  ]);

  return (
    <div className="space-y-5">
      {/* Program Types */}
      <CfgSection title="Program Types">
        <div className="flex flex-wrap gap-2 mb-3">
          {progTypes.map((t) => (
            <div
              key={t}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: P.lightSage, color: P.darkOlive }}
            >
              {t}
              <button onClick={() => setProgTypes((p) => p.filter((x) => x !== t))}>
                <X size={10} className="ml-0.5 hover:text-red-600" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            placeholder="Add program type…"
            onKeyDown={(e) => {
              if (e.key === "Enter" && newType.trim()) {
                setProgTypes((p) => [...p, newType.trim()]);
                setNewType("");
              }
            }}
            className="flex-1 px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
            style={{ border: `1px solid ${P.border}`, color: P.text }}
          />
          <button
            onClick={() => {
              if (newType.trim()) {
                setProgTypes((p) => [...p, newType.trim()]);
                setNewType("");
              }
            }}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: P.olive }}
          >
            Add
          </button>
        </div>
      </CfgSection>

      {/* Program Metadata */}
      <CfgSection title="Program Metadata">
        <div className="grid sm:grid-cols-2 gap-4">
          <CfgField
            label="Default Program Visibility"
            options={["Company-wide", "Department-only", "Invite-only", "Hidden"]}
          />
          <CfgField
            label="Default Program Owner Role"
            options={["HR Admin", "L&D Manager", "Department Head", "Course Creator"]}
          />
          <CfgField label="Default Duration Unit" options={["Weeks", "Months", "Days"]} />
          <CfgField label="Minimum Program Duration" value="2" type="number" />
        </div>
        <CfgToggle
          label="Require Program Description"
          desc="Enforce a minimum description before publishing"
          defaultOn={true}
        />
        <CfgToggle
          label="Allow Custom Metadata Fields"
          desc="HR can define extra fields per program type"
        />
      </CfgSection>

      {/* Scheduling */}
      <CfgSection title="Program Scheduling">
        <div className="grid sm:grid-cols-2 gap-4">
          <CfgField
            label="Default Start Date Offset (days after enrollment)"
            value="0"
            type="number"
          />
          <CfgField label="Grace Period after End Date (days)" value="7" type="number" />
        </div>
        <CfgToggle
          label="Allow Rolling Enrollment"
          desc="Learners can join at any point within the program window"
          defaultOn={true}
        />
        <CfgToggle
          label="Send Start-Date Reminder"
          desc="Notify learners 3 days before program begins"
          defaultOn={true}
        />
        <CfgToggle
          label="Auto-close on End Date"
          desc="Prevent new enrollments after the program end date"
        />
      </CfgSection>

      {/* Milestones */}
      <CfgSection title="Program Milestones">
        <p className="text-[11px] mb-3" style={{ color: P.textMuted }}>
          Define the milestone checkpoints applied to all programs by default. Program owners can
          override these.
        </p>
        {[
          ["25%", "Quarter-way check-in"],
          ["50%", "Mid-program review"],
          ["75%", "Final stretch nudge"],
          ["100%", "Completion & certificate"],
        ].map(([pct, label]) => (
          <div
            key={pct}
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ background: P.bg }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold font-mono w-10" style={{ color: P.olive }}>
                {pct}
              </span>
              <p className="text-xs font-medium" style={{ color: P.textMid }}>
                {label}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="text-xs px-2 py-1 rounded-lg bg-white"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              >
                <option>Email</option>
                <option>In-app</option>
                <option>Both</option>
                <option>None</option>
              </select>
            </div>
          </div>
        ))}
      </CfgSection>

      {/* Cohorts */}
      <CfgSection title="Program Cohorts">
        <CfgToggle
          label="Enable Cohort Mode"
          desc="Group learners into cohorts with separate timelines"
          defaultOn={true}
        />
        <CfgField label="Max Cohort Size" value="50" type="number" />
        <CfgField
          label="Cohort Naming Format"
          options={["Cohort A / B / C", "Jan 2025 / Feb 2025", "Custom"]}
        />
        <CfgToggle
          label="Allow Cross-Cohort Discussion"
          desc="Learners in different cohorts can interact on forums"
        />
      </CfgSection>

      {/* Tasks */}
      <CfgSection title="Program Tasks">
        <CfgToggle
          label="Enable Program Tasks"
          desc="Allow HR to attach tasks (readings, submissions, check-ins) to programs"
          defaultOn={true}
        />
        <CfgField
          label="Default Task Submission Type"
          options={["File Upload", "Text Entry", "External Link", "Manager Sign-off"]}
        />
        <CfgToggle
          label="Mark Tasks as Blocking"
          desc="Learners cannot progress until blocking tasks are completed"
          defaultOn={true}
        />
        <CfgToggle
          label="Allow Learners to Mark Tasks Done"
          desc="Self-reported task completion (no submission required)"
        />
      </CfgSection>

      {/* Validation Rules */}
      <CfgSection title="Program Validation Rules">
        <p className="text-[11px] mb-3" style={{ color: P.textMuted }}>
          Rules applied before a program can be published.
        </p>
        {[
          ["Must have at least 1 course", "Enforced", true],
          ["Must have a defined owner", "Enforced", true],
          ["Must have start & end dates", "Enforced", false],
          ["Must have a program description", "Warning only", false],
          ["All courses must be published", "Enforced", true],
        ].map(([rule, level, on]) => (
          <div
            key={rule as string}
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ background: P.bg }}
          >
            <div>
              <p className="text-xs font-medium" style={{ color: P.textMid }}>
                {rule as string}
              </p>
              <p
                className="text-[10px]"
                style={{ color: (level as string) === "Enforced" ? "#C0392B" : P.gold }}
              >
                {level as string}
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked={on as boolean}
              style={{ accentColor: P.olive, width: 15, height: 15 }}
            />
          </div>
        ))}
      </CfgSection>

      {/* Approval Workflows */}
      <CfgSection title="Program Approval Workflows">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px]" style={{ color: P.textMuted }}>
            Define the approval chain required before a new program goes live.
          </p>
          <button
            onClick={() =>
              setApprovalSteps((s) => [
                ...s,
                { id: `s${Date.now()}`, label: "New Step", role: "HR Admin", required: false },
              ])
            }
            className="flex items-center gap-1 text-xs font-semibold"
            style={{ color: P.olive }}
          >
            <Plus size={12} /> Add Step
          </button>
        </div>
        <div className="space-y-2">
          {approvalSteps.map((step, i) => (
            <div
              key={step.id}
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{ borderColor: P.border, background: "white" }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                style={{ background: P.olive }}
              >
                {i + 1}
              </div>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input
                  defaultValue={step.label}
                  className="px-2.5 py-1.5 text-xs rounded-lg bg-white"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
                <select
                  defaultValue={step.role}
                  className="px-2.5 py-1.5 text-xs rounded-lg bg-white"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                >
                  {["Manager", "HR Admin", "L&D Manager", "CEO", "Department Head"].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <label
                className="flex items-center gap-1.5 text-[10px] flex-shrink-0"
                style={{ color: P.textMuted }}
              >
                <input
                  type="checkbox"
                  defaultChecked={step.required}
                  style={{ accentColor: P.olive }}
                />{" "}
                Required
              </label>
              <button
                onClick={() => setApprovalSteps((s) => s.filter((x) => x.id !== step.id))}
                style={{ color: "#C0392B" }}
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
        <CfgToggle
          label="Notify all approvers simultaneously"
          desc="Send approval requests in parallel rather than sequentially"
        />
        <CfgToggle
          label="Auto-approve if no response in 5 days"
          desc="Escalate and auto-approve stalled requests"
          defaultOn
        />
      </CfgSection>

      {/* Enrollment Rules */}
      <CfgSection title="Program Enrollment Rules">
        {enrollRules.map((rule) => (
          <div
            key={rule.id}
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ background: P.bg }}
          >
            <p className="text-xs font-medium" style={{ color: P.textMid }}>
              {rule.label}
            </p>
            <button
              onClick={() =>
                setEnrollRules((r) =>
                  r.map((x) => (x.id === rule.id ? { ...x, enabled: !x.enabled } : x)),
                )
              }
              className="w-10 h-5 rounded-full relative transition-colors flex-shrink-0"
              style={{ background: rule.enabled ? P.olive : P.border }}
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                style={{ left: rule.enabled ? "22px" : "2px" }}
              />
            </button>
          </div>
        ))}
        <CfgField label="Maximum Enrollments per Program" value="500" type="number" />
        <CfgField label="Enrollment Deadline (days before start)" value="0" type="number" />
      </CfgSection>

      <EnrollmentRulesCrud />

      <SaveBar />
    </div>
  );
}

// ─── XP & Gamification Config ─────────────────────────────────
