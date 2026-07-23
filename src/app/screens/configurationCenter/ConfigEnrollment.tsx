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

export function ConfigEnrollment() {
  const [prerequisites, setPrerequisites] = useState([
    {
      id: "pr1",
      course: "Cybersecurity Fundamentals",
      prerequisite: "Data Privacy 101",
      enforced: true,
    },
    {
      id: "pr2",
      course: "AI & ML for Leaders",
      prerequisite: "Data Fundamentals for Business",
      enforced: true,
    },
    {
      id: "pr3",
      course: "Financial Modeling Advanced",
      prerequisite: "Financial Modeling Basics",
      enforced: false,
    },
  ]);
  const [learningPaths, setLearningPaths] = useState([
    {
      id: "lp1",
      trigger: "Completes Cybersecurity Fundamentals",
      action: "Enroll in Advanced Security Compliance",
      active: true,
    },
    {
      id: "lp2",
      trigger: "Joins Engineering department",
      action: "Assign Engineering Excellence Track",
      active: true,
    },
    {
      id: "lp3",
      trigger: "Promoted to Manager level",
      action: "Enroll in Future Leaders Initiative",
      active: false,
    },
    {
      id: "lp4",
      trigger: "Fails quiz with score < 60%",
      action: "Re-assign refresher module",
      active: true,
    },
  ]);

  return (
    <div className="space-y-5">
      {/* Open Enrollment */}
      <CfgSection title="Open Enrollment">
        <CfgToggle
          label="Allow open / self-enrollment"
          desc="Learners can browse the catalog and enroll themselves in any non-restricted course"
          defaultOn
        />
        <CfgToggle
          label="Require manager approval for self-enrollment"
          desc="Self-enrollment triggers a manager approval request before access is granted"
        />
        <CfgField label="Self-enrollment approval timeout (days)" value="5" type="number" />
        <CfgToggle
          label="Show enrollment count to learners"
          desc="Course cards display how many people are enrolled"
          defaultOn
        />
        <CfgToggle
          label="Allow learners to unenroll themselves"
          desc="Learners can drop a course before completing it"
          defaultOn
        />
        <CfgField label="Unenroll lock window (days before deadline)" value="3" type="number" />
      </CfgSection>

      {/* Invitation Enrollment */}
      <CfgSection title="Invitation Enrollment">
        <CfgToggle
          label="Enable invitation-only courses"
          desc="Some courses require an HR or manager invitation to enroll"
          defaultOn
        />
        <CfgField
          label="Who can send enrollment invitations"
          options={["HR Admin only", "HR + Managers", "HR + Managers + Creators", "Any admin role"]}
        />
        <CfgToggle
          label="Allow learner to decline an invitation"
          desc="Learners can reject invitations with a reason"
          defaultOn
        />
        <CfgToggle label="Notify HR when invitation is declined" defaultOn />
        <CfgField label="Invitation expiry (days)" value="14" type="number" />
        <CfgToggle
          label="Auto-enroll if invitation not actioned within expiry"
          desc="Learner is automatically enrolled when invitation expires"
        />
      </CfgSection>

      {/* Paid Enrollment */}
      <CfgSection title="Paid Enrollment">
        <CfgToggle
          label="Enable paid course enrollment"
          desc="Allow courses to have a learner-facing price"
        />
        <CfgField
          label="Default payment method"
          options={[
            "Cost center allocation",
            "Direct card payment",
            "Manager approval + cost center",
            "Invoice",
          ]}
        />
        <CfgField label="Maximum individual course price (USD)" value="500" type="number" />
        <CfgToggle
          label="Require finance approval for paid enrollments above threshold"
          defaultOn
        />
        <CfgField label="Finance approval threshold (USD)" value="200" type="number" />
        <CfgToggle label="Issue refund on unenrollment before start date" defaultOn />
        <CfgToggle label="Show pricing to learners in catalog" defaultOn />
      </CfgSection>

      {/* Capacity Limits */}
      <CfgSection title="Capacity Limits">
        <CfgToggle label="Enable per-course capacity limits" defaultOn />
        <CfgField label="Default course capacity (learners)" value="200" type="number" />
        <CfgField label="Default program capacity (learners)" value="500" type="number" />
        <CfgToggle
          label="Allow course owners to override capacity"
          desc="Individual course creators can set their own capacity limit"
          defaultOn
        />
        <CfgToggle label="Alert HR when a course reaches 80% capacity" defaultOn />
        <CfgToggle
          label="Notify learners when spots open up"
          desc="Waitlisted learners are notified when a seat becomes available"
          defaultOn
        />
      </CfgSection>

      {/* Waitlists */}
      <CfgSection title="Waitlists">
        <CfgToggle
          label="Enable course waitlisting"
          desc="When a course is full, learners are queued and notified when a spot opens"
          defaultOn
        />
        <CfgField label="Maximum waitlist size" value="50" type="number" />
        <CfgField
          label="Waitlist priority"
          options={[
            "First come, first served",
            "Manager-prioritised",
            "Seniority-based",
            "Custom rule",
          ]}
        />
        <CfgToggle label="Notify learner of their position in the waitlist" defaultOn />
        <CfgToggle
          label="Auto-enroll from waitlist when a spot opens"
          desc="Next learner on the waitlist is automatically enrolled"
          defaultOn
        />
        <CfgField label="Auto-enroll response window (hours)" value="48" type="number" />
        <CfgToggle
          label="Allow manager to jump queue for direct reports"
          desc="Managers can escalate a direct report's waitlist position"
        />
      </CfgSection>

      {/* Auto Enrollment */}
      <CfgSection title="Auto Enrollment">
        <p className="text-[11px] mb-3" style={{ color: P.textMuted }}>
          Rules that automatically enroll learners based on events or attributes.
        </p>
        {[
          ["Auto-enroll on new hire", "Assign onboarding program when a new employee joins", true],
          [
            "Auto-enroll based on job role",
            "Role-mapped courses are assigned when role is set or changed",
            true,
          ],
          [
            "Auto-enroll on department transfer",
            "Trigger role-specific courses when a learner moves departments",
            true,
          ],
          [
            "Auto-enroll annual compliance refresh",
            "Re-assign mandatory compliance courses each year",
            true,
          ],
          [
            "Auto-enroll when prerequisite is completed",
            "Chain course enrollments automatically on completion",
            false,
          ],
          [
            "Auto-enroll on promotion or level change",
            "Leadership or advanced courses triggered by level-up",
            false,
          ],
        ].map(([l, d, on]) => (
          <CfgToggle
            key={l as string}
            label={l as string}
            desc={d as string}
            defaultOn={on as boolean}
          />
        ))}
        <CfgField
          label="Auto-enrollment deadline offset (days from trigger)"
          value="30"
          type="number"
        />
        <CfgToggle label="Notify learner of auto-enrollment" defaultOn />
        <CfgToggle label="Notify manager of auto-enrollment" defaultOn />
      </CfgSection>

      {/* Prerequisites */}
      <CfgSection title="Prerequisites">
        <p className="text-[11px] mb-3" style={{ color: P.textMuted }}>
          Define prerequisite rules between courses. Learners must complete the prerequisite before
          enrolling.
        </p>
        <div className="space-y-2 mb-3">
          {prerequisites.map((pr) => (
            <div
              key={pr.id}
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{ borderColor: P.border, background: "white" }}
            >
              <div className="flex-1 min-w-0 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] font-semibold mb-1" style={{ color: P.textMuted }}>
                    COURSE
                  </p>
                  <p className="text-xs font-medium truncate" style={{ color: P.text }}>
                    {pr.course}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold mb-1" style={{ color: P.textMuted }}>
                    REQUIRES
                  </p>
                  <p className="text-xs truncate" style={{ color: P.textMid }}>
                    {pr.prerequisite}
                  </p>
                </div>
              </div>
              <label
                className="flex items-center gap-1 text-[10px] flex-shrink-0"
                style={{ color: P.textMuted }}
              >
                <input
                  type="checkbox"
                  defaultChecked={pr.enforced}
                  style={{ accentColor: P.olive }}
                />{" "}
                Enforced
              </label>
              <button
                onClick={() => setPrerequisites((p) => p.filter((x) => x.id !== pr.id))}
                style={{ color: "#C0392B" }}
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            setPrerequisites((p) => [
              ...p,
              {
                id: `pr${Date.now()}`,
                course: "Select course",
                prerequisite: "Select prerequisite",
                enforced: true,
              },
            ])
          }
          className="flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: P.olive }}
        >
          <Plus size={12} /> Add Prerequisite Rule
        </button>
        <CfgToggle
          label="Show prerequisite info to learners in catalog"
          desc="Learners see what they need to complete before enrolling"
          defaultOn
        />
        <CfgToggle
          label="Block enrollment if prerequisite not met"
          desc="Hard block — learner cannot enroll until prerequisite is done"
          defaultOn
        />
        <CfgToggle
          label="Allow manager to waive prerequisite"
          desc="Managers can override the prerequisite for a specific learner"
        />
      </CfgSection>

      {/* Conditional Learning Paths */}
      <CfgSection title="Conditional Learning Paths">
        <p className="text-[11px] mb-3" style={{ color: P.textMuted }}>
          If-then rules that dynamically enroll learners into the next step based on events or
          outcomes.
        </p>
        <div className="space-y-2 mb-3">
          {learningPaths.map((lp) => (
            <div
              key={lp.id}
              className="flex items-start gap-3 p-3 rounded-xl border"
              style={{ borderColor: P.border, background: "white" }}
            >
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start gap-2">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
                    style={{ background: P.lightSage, color: P.darkOlive }}
                  >
                    IF
                  </span>
                  <input
                    defaultValue={lp.trigger}
                    className="flex-1 px-2 py-1 text-xs rounded-lg bg-white"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  />
                </div>
                <div className="flex items-start gap-2">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
                    style={{ background: P.goldLight, color: "#8A6A1A" }}
                  >
                    THEN
                  </span>
                  <input
                    defaultValue={lp.action}
                    className="flex-1 px-2 py-1 text-xs rounded-lg bg-white"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  />
                </div>
                {/* <div className="grid sm:grid-cols-2 gap-2 mt-2">
                  <div className="rounded-lg p-2" style={{ background: P.bg }}>
                    <p className="text-[10px] font-bold uppercase" style={{ color: P.textMuted }}>
                      Task List
                    </p>
                    <p className="text-[10px] mt-1" style={{ color: P.textMid }}>
                      {t.taskList.slice(0, 3).join(" · ")}
                      {t.taskList.length > 3 ? ` · +${t.taskList.length - 3}` : ""}
                    </p>
                  </div>
                  <div className="rounded-lg p-2" style={{ background: P.bg }}>
                    <p className="text-[10px] font-bold uppercase" style={{ color: P.textMuted }}>
                      Milestones
                    </p>
                    <p className="text-[10px] mt-1" style={{ color: P.textMid }}>
                      {t.milestones.slice(0, 3).join(" · ")}
                      {t.milestones.length > 3 ? ` · +${t.milestones.length - 3}` : ""}
                    </p>
                  </div>
                </div> */}
              </div>
              <button
                onClick={() =>
                  setLearningPaths((lps) =>
                    lps.map((x) => (x.id === lp.id ? { ...x, active: !x.active } : x)),
                  )
                }
                className="rounded-full relative transition-colors flex-shrink-0 mt-1"
                style={{ background: lp.active ? P.olive : P.border, width: 36, height: 20 }}
              >
                <span
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                  style={{ left: lp.active ? "18px" : "2px" }}
                />
              </button>
              <button
                onClick={() => setLearningPaths((lps) => lps.filter((x) => x.id !== lp.id))}
                style={{ color: "#C0392B" }}
                className="mt-1"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            setLearningPaths((lps) => [
              ...lps,
              { id: `lp${Date.now()}`, trigger: "", action: "", active: true },
            ])
          }
          className="flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: P.olive }}
        >
          <Plus size={12} /> Add Learning Path Rule
        </button>
        <CfgToggle label="Notify learner when a path rule triggers" defaultOn />
        <CfgToggle
          label="Show conditional path to learner in program view"
          desc="Learners can see what comes next based on their progress"
          defaultOn
        />
      </CfgSection>

      <SaveBar />
    </div>
  );
}
