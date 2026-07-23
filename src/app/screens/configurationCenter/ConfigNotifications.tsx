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

export function ConfigNotifications() {
  type NotifRow = {
    id: string;
    event: string;
    recipients: string[];
    channels: string[];
    on: boolean;
  };

  const mkRow = (
    id: string,
    event: string,
    recipients: string[],
    channels: string[],
    on: boolean,
  ): NotifRow => ({ id, event, recipients, channels, on });

  const [announcements, setAnnouncements] = useState<NotifRow[]>([
    mkRow("a1", "New course published to catalog", ["All Learners"], ["Email", "In-app"], true),
    mkRow(
      "a2",
      "Mandatory course assigned",
      ["Learner", "Line Manager"],
      ["Email", "In-app"],
      true,
    ),
    mkRow("a3", "Course content updated", ["Enrolled Learners"], ["In-app"], true),
    mkRow("a4", "Live session scheduled", ["Invited Learners"], ["Email", "In-app"], true),
    mkRow("a5", "Course removed from catalog", ["Enrolled Learners"], ["Email"], false),
  ]);
  const [reminders, setReminders] = useState<NotifRow[]>([
    mkRow("r1", "Assignment deadline in 7 days", ["Learner"], ["Email"], true),
    mkRow(
      "r2",
      "Assignment deadline in 3 days",
      ["Learner", "Line Manager"],
      ["Email", "In-app"],
      true,
    ),
    mkRow(
      "r3",
      "Assignment deadline tomorrow",
      ["Learner", "Line Manager"],
      ["Email", "In-app", "SMS"],
      true,
    ),
    mkRow("r4", "Assignment overdue", ["Learner", "HR Admin"], ["Email"], true),
    mkRow("r5", "Quiz retake available", ["Learner"], ["In-app"], false),
    mkRow("r6", "Program milestone due", ["Learner"], ["In-app"], true),
  ]);
  const [certAlerts, setCertAlerts] = useState<NotifRow[]>([
    mkRow("c1", "Certificate issued", ["Learner"], ["Email"], true),
    mkRow("c2", "Certificate expiring in 30 days", ["Learner", "Line Manager"], ["Email"], true),
    mkRow(
      "c3",
      "Certificate expiring in 7 days",
      ["Learner", "Line Manager", "HR Admin"],
      ["Email", "In-app"],
      true,
    ),
    mkRow("c4", "Certificate expired", ["Learner", "Line Manager", "HR Admin"], ["Email"], true),
    mkRow("c5", "External certificate uploaded", ["HR Admin"], ["In-app"], true),
    mkRow("c6", "Certificate renewal completed", ["Learner", "Line Manager"], ["Email"], true),
  ]);
  const [programNotifs, setProgramNotifs] = useState<NotifRow[]>([
    mkRow("p1", "Enrolled in a program", ["Learner"], ["Email", "In-app"], true),
    mkRow("p2", "Program started", ["Learner"], ["In-app"], true),
    mkRow("p3", "Program milestone reached", ["Learner"], ["In-app"], false),
    mkRow("p4", "Program completed", ["Learner", "Line Manager"], ["Email", "In-app"], true),
    mkRow("p5", "Cohort assignment changed", ["Learner"], ["Email"], true),
    mkRow("p6", "New course added to enrolled program", ["Learner"], ["In-app"], false),
    mkRow("p7", "Program approval required", ["Approver"], ["Email", "In-app"], true),
    mkRow("p8", "Program approved / rejected", ["Learner", "HR Admin"], ["Email"], true),
  ]);

  const CHANNELS = ["Email", "In-app", "SMS", "Push"];
  const RECIPIENTS = [
    "Learner",
    "Line Manager",
    "HR Admin",
    "All Learners",
    "Enrolled Learners",
    "Invited Learners",
    "Approver",
  ];

  const NotifTable = ({
    rows,
    setRows,
    title,
    sub,
  }: {
    rows: NotifRow[];
    setRows: React.Dispatch<React.SetStateAction<NotifRow[]>>;
    title: string;
    sub: string;
  }) => (
    <CfgSection title={title}>
      <p className="text-[11px] mb-3" style={{ color: P.textMuted }}>
        {sub}
      </p>
      <div className="space-y-1.5">
        {rows.map((row) => (
          <div
            key={row.id}
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: P.border }}
          >
            <div
              className="flex items-center gap-3 px-3 py-2.5"
              style={{ background: row.on ? "white" : P.bg }}
            >
              <p
                className="flex-1 text-xs font-medium"
                style={{ color: row.on ? P.textMid : P.textMuted }}
              >
                {row.event}
              </p>
              <button
                onClick={() =>
                  setRows((rs) => rs.map((x) => (x.id === row.id ? { ...x, on: !x.on } : x)))
                }
                className="rounded-full relative transition-colors flex-shrink-0"
                style={{ background: row.on ? P.olive : P.border, width: 36, height: 20 }}
              >
                <span
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                  style={{ left: row.on ? "18px" : "2px" }}
                />
              </button>
            </div>
            {row.on && (
              <div
                className="px-3 pb-3 pt-1 grid grid-cols-2 gap-3"
                style={{ background: "white", borderTop: `1px solid ${P.border}50` }}
              >
                <div>
                  <p
                    className="text-[9px] font-bold uppercase tracking-widest mb-1.5"
                    style={{ color: P.textMuted }}
                  >
                    Recipients
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {RECIPIENTS.map((r) => {
                      const active = row.recipients.includes(r);
                      return (
                        <button
                          key={r}
                          onClick={() =>
                            setRows((rs) =>
                              rs.map((x) =>
                                x.id === row.id
                                  ? {
                                      ...x,
                                      recipients: active
                                        ? x.recipients.filter((v) => v !== r)
                                        : [...x.recipients, r],
                                    }
                                  : x,
                              ),
                            )
                          }
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors"
                          style={{
                            background: active ? P.lightSage : P.bg,
                            color: active ? P.darkOlive : P.textMuted,
                            border: `1px solid ${active ? P.sage : P.border}`,
                          }}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p
                    className="text-[9px] font-bold uppercase tracking-widest mb-1.5"
                    style={{ color: P.textMuted }}
                  >
                    Channels
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {CHANNELS.map((c) => {
                      const active = row.channels.includes(c);
                      return (
                        <button
                          key={c}
                          onClick={() =>
                            setRows((rs) =>
                              rs.map((x) =>
                                x.id === row.id
                                  ? {
                                      ...x,
                                      channels: active
                                        ? x.channels.filter((v) => v !== c)
                                        : [...x.channels, c],
                                    }
                                  : x,
                              ),
                            )
                          }
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors"
                          style={{
                            background: active ? P.goldLight : P.bg,
                            color: active ? "#8A6A1A" : P.textMuted,
                            border: `1px solid ${active ? P.gold + "80" : P.border}`,
                          }}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </CfgSection>
  );

  return (
    <div className="space-y-5">
      <NotifTable
        rows={announcements}
        setRows={setAnnouncements}
        title="Course Announcements"
        sub="Notifications sent when courses are created, updated, assigned, or removed."
      />

      <NotifTable
        rows={reminders}
        setRows={setReminders}
        title="Assignment Reminders"
        sub="Deadline-based reminders sent to learners and managers before and after due dates."
      />

      <NotifTable
        rows={certAlerts}
        setRows={setCertAlerts}
        title="Certification Expiry Alerts"
        sub="Alerts related to certificate issuance, approaching expiry, and renewal."
      />

      <NotifTable
        rows={programNotifs}
        setRows={setProgramNotifs}
        title="Program Notifications"
        sub="Lifecycle notifications for learning program enrollment, progress, and completion."
      />

      <CfgSection title="Digest & Summary Settings">
        <CfgToggle
          label="Send weekly learning digest to learners"
          desc="Summary of progress, upcoming deadlines, and recommendations"
          defaultOn
        />
        <CfgToggle
          label="Send weekly team learning summary to managers"
          desc="Overview of team completion rates, at-risk learners, upcoming deadlines"
          defaultOn
        />
        <CfgToggle
          label="Send monthly L&D report to HR"
          desc="Platform-wide completion trends, TNA activity, certification status"
          defaultOn
        />
        <div className="grid sm:grid-cols-2 gap-4 pt-1">
          <CfgField
            label="Learner digest — send day"
            options={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]}
          />
          <CfgField label="Learner digest — send time" value="08:00" type="time" />
          <CfgField label="Manager summary — send day" options={["Monday", "Friday"]} />
          <CfgField
            label="HR monthly report — send on"
            options={["1st of month", "Last working day", "Custom date"]}
          />
        </div>
      </CfgSection>

      <CfgSection title="Global Notification Settings">
        <CfgToggle
          label="Allow learners to manage their own notification preferences"
          desc="Learners can opt out of non-mandatory notifications in their profile"
          defaultOn
        />
        <CfgToggle label="Respect quiet hours (no notifications 10pm–7am)" defaultOn />
        <CfgField
          label="Default notification language"
          options={["English", "Amharic", "French", "Arabic"]}
        />
        <CfgToggle label="SMS requires explicit opt-in from learner" defaultOn />
        <CfgToggle label="Log all sent notifications for audit purposes" defaultOn />
      </CfgSection>

      <SaveBar />
    </div>
  );
}
