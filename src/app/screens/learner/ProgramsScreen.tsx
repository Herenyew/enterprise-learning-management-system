import { useState } from "react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Flag,
  Target,
  Users,
} from "lucide-react";
import { Chip, PBar } from "../../components/common";
import { COURSES, PROGRAMS } from "../../constants/mockData";
import { P } from "../../constants/theme.constants";
import type { NavigateFn } from "../../models/app.model";

type ProgramMilestone = {
  week: string;
  title: string;
  items: string[];
  status: "done" | "active" | "upcoming";
};

type LearnerProgramAssignment = {
  programId: string;
  cohort: string;
  cohortStart: string;
  cohortEnd: string;
  assignedBy: string;
  courseIds: string[];
  milestones: ProgramMilestone[];
};

const LEARNER_PROGRAM_ASSIGNMENTS: LearnerProgramAssignment[] = [
  {
    programId: "pg1",
    cohort: "Cohort A - 2026",
    cohortStart: "Jun 9, 2026",
    cohortEnd: "Jul 20, 2026",
    assignedBy: "HR Onboarding",
    courseIds: ["4", "1", "3", "7"],
    milestones: [
      {
        week: "Week 1",
        title: "Program kickoff",
        items: ["Orientation", "Baseline assessment"],
        status: "done",
      },
      {
        week: "Week 2",
        title: "Core learning",
        items: ["Communication course", "AI foundations quiz"],
        status: "done",
      },
      {
        week: "Week 3",
        title: "Compliance check",
        items: ["Security assessment", "Policy task"],
        status: "active",
      },
      {
        week: "Week 4",
        title: "Applied work",
        items: ["Manager assignment", "Peer discussion"],
        status: "upcoming",
      },
      {
        week: "Week 5",
        title: "Feedback",
        items: ["Program survey", "Cohort reflection"],
        status: "upcoming",
      },
      {
        week: "Week 6",
        title: "Final review",
        items: ["Capstone submission", "Certificate check"],
        status: "upcoming",
      },
    ],
  },
  {
    programId: "pg2",
    cohort: "Leadership Cohort B",
    cohortStart: "Jul 1, 2026",
    cohortEnd: "Sep 23, 2026",
    assignedBy: "Leadership Academy",
    courseIds: ["2", "7", "6", "8"],
    milestones: [
      {
        week: "Week 1",
        title: "Leadership baseline",
        items: ["Pre-assessment", "Goal setting"],
        status: "done",
      },
      {
        week: "Week 2",
        title: "Decision practice",
        items: ["Leadership course", "Reflection task"],
        status: "active",
      },
      {
        week: "Week 4",
        title: "Team practice",
        items: ["Peer review", "Manager feedback"],
        status: "upcoming",
      },
      {
        week: "Week 6",
        title: "Midpoint review",
        items: ["Cohort survey", "Knowledge check"],
        status: "upcoming",
      },
      {
        week: "Week 9",
        title: "Final project",
        items: ["Case project", "Presentation"],
        status: "upcoming",
      },
      {
        week: "Week 12",
        title: "Completion",
        items: ["Post-assessment", "Certificate review"],
        status: "upcoming",
      },
    ],
  },
  {
    programId: "pg4",
    cohort: "Engineering Cohort 2026",
    cohortStart: "Jul 6, 2026",
    cohortEnd: "Oct 26, 2026",
    assignedBy: "Engineering Enablement",
    courseIds: ["1", "3", "7", "aws-cloud-practitioner", "gcp-digital-leader"],
    milestones: [
      {
        week: "Week 1",
        title: "Technical kickoff",
        items: ["Skills baseline", "Architecture reading"],
        status: "active",
      },
      {
        week: "Week 3",
        title: "Cloud foundations",
        items: ["Provider course", "Cloud quiz"],
        status: "upcoming",
      },
      {
        week: "Week 6",
        title: "Secure delivery",
        items: ["Cybersecurity course", "Lab assignment"],
        status: "upcoming",
      },
      {
        week: "Week 10",
        title: "Engineering review",
        items: ["Peer review", "Pulse survey"],
        status: "upcoming",
      },
      {
        week: "Week 16",
        title: "Capstone",
        items: ["Architecture project", "Manager sign-off"],
        status: "upcoming",
      },
    ],
  },
];

const assignedPrograms = PROGRAMS.map((program) => {
  const assignment = LEARNER_PROGRAM_ASSIGNMENTS.find((item) => item.programId === program.id);
  return assignment ? { ...program, assignment } : null;
}).filter(Boolean) as Array<(typeof PROGRAMS)[number] & { assignment: LearnerProgramAssignment }>;

function getAssignedCourses(courseIds: string[]) {
  return courseIds
    .map((courseId) => COURSES.find((course) => course.id === courseId))
    .filter((course): course is (typeof COURSES)[number] => Boolean(course));
}

function statusVariant(status: ProgramMilestone["status"]) {
  if (status === "done") return "green";
  if (status === "active") return "olive";
  return "neutral";
}

export function ProgramsScreen({ navigate }: { navigate: NavigateFn }) {
  const [selected, setSelected] = useState<string | null>(null);
  const prog = selected ? assignedPrograms.find((item) => item.id === selected) : null;

  if (prog) {
    const courses = getAssignedCourses(prog.assignment.courseIds);

    return (
      <div className="p-8 space-y-6 max-w-[1280px]">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-2 text-sm font-semibold transition hover:-translate-x-1"
          style={{ color: P.olive }}
        >
          <ChevronLeft size={16} /> Assigned programs
        </button>

        <section
          className="rounded-2xl border bg-white p-6 shadow-sm"
          style={{ borderColor: P.border }}
        >
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl p-3" style={{ background: P.lightSage, color: P.olive }}>
                <Target size={26} />
              </div>
              <div>
                <Chip label={prog.assignment.cohort} variant="olive" />
                <h1
                  className="mt-3 text-2xl font-bold"
                  style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
                >
                  {prog.title}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: P.textMuted }}>
                  {prog.description}
                </p>
              </div>
            </div>
            <div className="min-w-[220px] rounded-2xl p-4" style={{ background: P.paleGreen }}>
              <p
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: P.textMuted }}
              >
                Cohort timeline
              </p>
              <p className="mt-2 text-sm font-bold" style={{ color: P.text }}>
                {prog.assignment.cohortStart} - {prog.assignment.cohortEnd}
              </p>
              <p className="mt-1 text-xs" style={{ color: P.textMuted }}>
                Assigned by {prog.assignment.assignedBy}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex justify-between text-xs" style={{ color: P.textMuted }}>
              <span>Program progress</span>
              <span className="font-semibold" style={{ color: prog.color }}>
                {prog.progress}%
              </span>
            </div>
            <PBar value={prog.progress} color={prog.color} height={8} />
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section
            className="rounded-2xl border bg-white p-5 shadow-sm"
            style={{ borderColor: P.border }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold" style={{ color: P.text }}>
                  Courses in this program
                </h2>
                <p className="text-xs" style={{ color: P.textMuted }}>
                  {courses.length} assigned courses
                </p>
              </div>
              <BookOpen size={18} style={{ color: P.olive }} />
            </div>

            <div className="space-y-3">
              {courses.map((course, index) => (
                <button
                  key={course.id}
                  onClick={() => navigate("course-detail", course.id)}
                  className="group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
                  style={{
                    borderColor: P.border,
                    background: course.progress ? "white" : P.paleGreen,
                  }}
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                    style={{ background: course.color }}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold" style={{ color: P.text }}>
                      {course.title}
                    </span>
                    <span className="mt-1 block text-xs" style={{ color: P.textMuted }}>
                      {course.instructor} - {course.duration}
                    </span>
                    <span className="mt-3 block">
                      <PBar value={course.progress} color={course.color} height={5} />
                    </span>
                  </span>
                  {course.progress === 100 ? (
                    <CheckCircle size={18} style={{ color: P.olive }} />
                  ) : (
                    <ChevronRight
                      size={18}
                      className="transition group-hover:translate-x-1"
                      style={{ color: P.sage }}
                    />
                  )}
                </button>
              ))}
            </div>
          </section>

          <section
            className="rounded-2xl border bg-white p-5 shadow-sm"
            style={{ borderColor: P.border }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold" style={{ color: P.text }}>
                  Weekly milestones
                </h2>
                <p className="text-xs" style={{ color: P.textMuted }}>
                  Assessments, assignments, surveys, and final work
                </p>
              </div>
              <Flag size={18} style={{ color: P.olive }} />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {prog.assignment.milestones.map((milestone) => (
                <div
                  key={`${prog.id}-${milestone.week}`}
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: milestone.status === "active" ? P.sage : P.border,
                    background: milestone.status === "active" ? P.lightSage : "white",
                  }}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={15} style={{ color: P.olive }} />
                      <span className="text-xs font-semibold" style={{ color: P.textMuted }}>
                        {milestone.week}
                      </span>
                    </div>
                    <Chip label={milestone.status} variant={statusVariant(milestone.status)} />
                  </div>
                  <h3 className="text-sm font-bold" style={{ color: P.text }}>
                    {milestone.title}
                  </h3>
                  <div className="mt-3 space-y-2">
                    {milestone.items.map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 text-xs"
                        style={{ color: P.textMuted }}
                      >
                        <ClipboardCheck size={13} style={{ color: P.olive }} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-[1280px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            My Learning Programs
          </h1>
          <p className="mt-1 text-sm" style={{ color: P.textMuted }}>
            Programs assigned to you by HR, grouped by cohort.
          </p>
        </div>
        <div
          className="rounded-full px-4 py-2 text-sm font-semibold"
          style={{ background: P.lightSage, color: P.olive }}
        >
          {assignedPrograms.length} assigned programs
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {assignedPrograms.map((program) => {
          const courses = getAssignedCourses(program.assignment.courseIds);

          return (
            <button
              key={program.id}
              onClick={() => setSelected(program.id)}
              className="group rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg active:scale-[0.99]"
              style={{ borderColor: P.border }}
            >
              <div className="flex items-start justify-between gap-4">
                <div
                  className="rounded-2xl p-3 transition group-hover:scale-105"
                  style={{ background: P.lightSage, color: program.color }}
                >
                  <Target size={24} />
                </div>
                <Chip label={program.assignment.cohort} variant="olive" />
              </div>

              <h2 className="mt-5 text-lg font-bold" style={{ color: P.text }}>
                {program.title}
              </h2>
              <p className="mt-2 line-clamp-2 text-sm leading-6" style={{ color: P.textMuted }}>
                {program.description}
              </p>

              <div className="mt-5 grid grid-cols-3 gap-3 text-xs" style={{ color: P.textMuted }}>
                <span className="flex items-center gap-1.5">
                  <BookOpen size={13} /> {courses.length}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={13} /> {program.duration}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users size={13} /> {program.enrolled}
                </span>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs" style={{ color: P.textMuted }}>
                  <span>
                    {program.assignment.cohortStart} - {program.assignment.cohortEnd}
                  </span>
                  <span className="font-semibold" style={{ color: program.color }}>
                    {program.progress}%
                  </span>
                </div>
                <PBar value={program.progress} color={program.color} height={6} />
              </div>

              <div
                className="mt-5 flex items-center justify-between border-t pt-4"
                style={{ borderColor: P.border }}
              >
                <span className="text-xs" style={{ color: P.textMuted }}>
                  {program.assignment.assignedBy}
                </span>
                <span
                  className="flex items-center gap-1 text-sm font-semibold"
                  style={{ color: P.olive }}
                >
                  View plan <ChevronRight size={15} />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
