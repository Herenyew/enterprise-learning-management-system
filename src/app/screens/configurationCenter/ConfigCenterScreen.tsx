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

import { ConfigCertifications } from "./ConfigCertifications";
import { ConfigContentTypes } from "./ConfigContentTypes";
import { ConfigEnrollment } from "./ConfigEnrollment";
import { ConfigLearningPrograms } from "./ConfigLearningPrograms";
import { ConfigNotifications } from "./ConfigNotifications";
import { ConfigPublishing } from "./ConfigPublishing";
import { ConfigQuestionTypes } from "./ConfigQuestionTypes";
import { ConfigTemplates } from "./ConfigTemplates";
import { ConfigTNA } from "./ConfigTNA";
import { ConfigTrainingEffectiveness } from "./ConfigTrainingEffectiveness";
import { ConfigXPGamification } from "./ConfigXPGamification";

export function ConfigCenterScreen({
  navigate,
  contentTypes,
  setContentTypes,
  questionTypes,
  setQuestionTypes,
  governanceSections,
}: {
  navigate: (s: string) => void;
  contentTypes?: CourseContentTypeConfig[];
  setContentTypes?: React.Dispatch<React.SetStateAction<CourseContentTypeConfig[]>>;
  questionTypes?: QuestionTypeConfig[];
  setQuestionTypes?: React.Dispatch<React.SetStateAction<QuestionTypeConfig[]>>;
  governanceSections?: {
    contentModeration?: React.ReactNode;
    certificateManagement?: React.ReactNode;
    leaderboardRules?: React.ReactNode;
    catalogConfiguration?: React.ReactNode;
  };
}) {
  type ConfigSection =
    | "programs"
    | "approval-workflows"
    | "publishing-governance"
    | "content-moderation"
    | "xp"
    | "leaderboard-rules"
    | "certificate-management"
    | "tna"
    | "enrollment"
    | "notifications"
    | "templates"
    | "catalog-configuration"
    | "saved-reports"
    | "dashboard-widgets"
    | "content-types"
    | "question-types"
    | "effectiveness";
  const [active, setActive] = useState<ConfigSection>("programs");

  const NAV: { id: ConfigSection; label: string; icon: React.ElementType; desc: string }[] = [
    {
      id: "programs",
      label: "Learning Programs",
      icon: Layers,
      desc: "Types, templates, workflows, cohorts",
    },
    {
      id: "approval-workflows",
      label: "Approval Workflows",
      icon: GitBranch,
      desc: "Create, edit, enable, disable",
    },
    {
      id: "publishing-governance",
      label: "Publishing Governance",
      icon: Shield,
      desc: "Publishing workflow, approvals, review checklist, moderation rules",
    },
    {
      id: "content-moderation",
      label: "Content Moderation",
      icon: Eye,
      desc: "Review course comments, ratings, flagged content, and moderation history",
    },
    { id: "xp", label: "XP & Gamification", icon: Zap, desc: "Points, levels, XP rules" },
    {
      id: "leaderboard-rules",
      label: "Leaderboard Rules",
      icon: Trophy,
      desc: "Analytics, ranking basis, program defaults, and leaderboard visibility",
    },
    {
      id: "certificate-management",
      label: "Certificate Management",
      icon: Award,
      desc: "Templates, signers, issued certificates, expiry, providers, and renewals",
    },
    { id: "tna", label: "TNA", icon: Target, desc: "Request types, approval, budget" },
    {
      id: "enrollment",
      label: "Enrollment Policies & Rules",
      icon: UserCheck,
      desc: "Policies, rules, auto-assign, waitlists",
    },
    {
      id: "notifications",
      label: "Notification Settings",
      icon: MessageSquare,
      desc: "Events, channels, digest settings",
    },
    {
      id: "templates",
      label: "Template Management",
      icon: FileText,
      desc: "Email, program, course, quiz, certificate templates",
    },
    {
      id: "catalog-configuration",
      label: "Catalog Configuration",
      icon: BookOpen,
      desc: "Course categories, learning levels, program types, and catalog metadata",
    },
    {
      id: "saved-reports",
      label: "Saved Reports",
      icon: BarChart2,
      desc: "Create, schedule, export",
    },
    {
      id: "dashboard-widgets",
      label: "Dashboard Widgets",
      icon: LayoutDashboard,
      desc: "Create, edit, enable, disable",
    },
    {
      id: "content-types",
      label: "Content Types",
      icon: BookOpen,
      desc: "Formats, categories, difficulty levels",
    },
    {
      id: "question-types",
      label: "Question Types",
      icon: HelpCircle,
      desc: "Quiz formats available to course creators",
    },
    {
      id: "effectiveness",
      label: "Training Effectiveness",
      icon: TrendingUp,
      desc: "KPIs, measurement model, reporting",
    },
  ];

  const CONTENT: Record<ConfigSection, React.ReactNode> = {
    programs: <ConfigLearningPrograms />,
    "approval-workflows": <WorkflowsCrud />,
    "publishing-governance": <ConfigPublishing />,
    "content-moderation": governanceSections?.contentModeration ?? <ConfigPublishing />,
    xp: <ConfigXPGamification />,
    "leaderboard-rules": governanceSections?.leaderboardRules ?? <ConfigXPGamification />,
    "certificate-management": governanceSections?.certificateManagement ?? <ConfigCertifications />,
    tna: <ConfigTNA />,
    enrollment: <ConfigEnrollment />,
    notifications: <ConfigNotifications />,
    templates: <ConfigTemplates />,
    "catalog-configuration": governanceSections?.catalogConfiguration ?? (
      <ConfigContentTypes contentTypes={contentTypes} setContentTypes={setContentTypes} />
    ),
    "saved-reports": <ReportsCrud />,
    "dashboard-widgets": <WidgetsCrud />,
    "content-types": (
      <ConfigContentTypes contentTypes={contentTypes} setContentTypes={setContentTypes} />
    ),
    "question-types": (
      <ConfigQuestionTypes questionTypes={questionTypes} setQuestionTypes={setQuestionTypes} />
    ),
    effectiveness: <ConfigTrainingEffectiveness />,
  };

  const current = NAV.find((n) => n.id === active)!;
  const embeddedWorkspaceSections = new Set<ConfigSection>([
    "content-moderation",
    "leaderboard-rules",
    "certificate-management",
    "catalog-configuration",
  ]);
  const isEmbeddedWorkspace = embeddedWorkspaceSections.has(active);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left nav */}
      <aside
        className="w-56 flex-shrink-0 overflow-y-auto p-3 space-y-0.5"
        style={{ background: "white", borderRight: `1px solid ${P.border}` }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-widest px-2 py-2"
          style={{ color: P.textMuted }}
        >
          Configuration
        </p>
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all"
            style={
              active === id
                ? {
                    background: P.lightSage,
                    color: P.darkOlive,
                    borderLeft: `3px solid ${P.olive}`,
                    paddingLeft: 9,
                  }
                : { color: P.textMuted }
            }
          >
            <Icon size={14} className="flex-shrink-0" />
            <span className="text-[12px] font-medium leading-tight">{label}</span>
          </button>
        ))}
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className={`${isEmbeddedWorkspace ? "max-w-[1200px]" : "max-w-[860px]"} space-y-5`}>
          {!isEmbeddedWorkspace && (
            <div>
              <h1
                className="text-lg font-bold"
                style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
              >
                {current.label}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: P.textMuted }}>
                {current.desc}
              </p>
            </div>
          )}
          {CONTENT[active]}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. ANALYTICS CENTER
// ─────────────────────────────────────────────────────────────

// ─── Analytics Center — moved to Extensions4.tsx ─────────────
export { AnalyticsCenterScreen } from "../../Extensions4";

// 3. TWO-LEVEL CONTENT MODERATION
// ─────────────────────────────────────────────────────────────
