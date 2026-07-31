import React from "react";
import { Av, P, Plus, TEAM_MEMBERS, Trash2, X } from "./extended.shared";
import type { HRProgramCreateTabContext } from "./HRProgramCreateTab";

export function HRProgramCohortsAssignmentSection({ ctx }: { ctx: HRProgramCreateTabContext }) {
  const {
    addProgramCohort,
    assignmentMode,
    cohortName,
    cohortStartDate,
    cohortsEnabled,
    programCohorts,
    removeEmployeeFromCohort,
    removeProgramCohort,
    saveAsTemplate,
    selectedCohortId,
    setAssignmentMode,
    setCohortName,
    setCohortStartDate,
    setCohortsEnabled,
    setSaveAsTemplate,
    setSelectedCohortId,
    toggleEmployeeInSelectedCohort,
  } = ctx;

  return (
    <>
      <div className="p-4 rounded-xl border" style={{ borderColor: P.border }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold" style={{ color: P.text }}>
              Cohorts
            </p>
            <p className="text-[10px]" style={{ color: P.textMuted }}>
              Group learners into cohorts with separate start dates
            </p>
          </div>
          <input
            type="checkbox"
            checked={cohortsEnabled}
            onChange={(e) => setCohortsEnabled(e.target.checked)}
            style={{ accentColor: P.olive, width: 15, height: 15 }}
          />
        </div>
        {cohortsEnabled && (
          <div className="space-y-3">
            <div className="grid md:grid-cols-[1fr_170px_auto] gap-2 items-end">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  Cohort Name
                </label>
                <input
                  value={cohortName}
                  onChange={(e) => setCohortName(e.target.value)}
                  placeholder="e.g. Cohort A - Jan 2025"
                  className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  Cohort Start Date
                </label>
                <input
                  type="date"
                  value={cohortStartDate}
                  onChange={(e) => setCohortStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
              </div>
              <button
                type="button"
                onClick={addProgramCohort}
                disabled={!cohortName.trim() || !cohortStartDate}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-1.5"
                style={{
                  background: !cohortName.trim() || !cohortStartDate ? P.sage : P.olive,
                  opacity: !cohortName.trim() || !cohortStartDate ? 0.65 : 1,
                }}
              >
                <Plus size={12} /> Add Cohort
              </button>
            </div>

            <div className="space-y-2">
              {programCohorts.map((cohort, index) => (
                <div
                  key={cohort.id}
                  className="flex items-center gap-3 rounded-lg border px-3 py-2"
                  style={{ borderColor: P.border, background: P.bg }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ background: P.lightSage, color: P.darkOlive }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: P.text }}>
                      {cohort.name}
                    </p>
                    <p className="text-[10px]" style={{ color: P.textMuted }}>
                      Starts {cohort.startDate}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProgramCohort(cohort.id)}
                    className="p-1.5 rounded hover:bg-red-50"
                  >
                    <Trash2 size={12} style={{ color: "#C0392B" }} />
                  </button>
                </div>
              ))}
              {!programCohorts.length && (
                <div
                  className="rounded-lg border px-3 py-2 text-[11px]"
                  style={{ borderColor: P.border, color: P.textMuted, background: P.bg }}
                >
                  No cohorts added yet. Add one or more cohorts to schedule separate starts.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Save as template */}
      <div
        className="flex items-center justify-between p-3 rounded-lg"
        style={{ background: P.bg }}
      >
        <div>
          <p className="text-xs font-medium" style={{ color: P.textMid }}>
            Save as Reusable Template
          </p>
          <p className="text-[10px]" style={{ color: P.textMuted }}>
            Others can duplicate this program structure
          </p>
        </div>
        <input
          type="checkbox"
          checked={saveAsTemplate}
          onChange={(e) => setSaveAsTemplate(e.target.checked)}
          style={{ accentColor: P.olive, width: 15, height: 15 }}
        />
      </div>

      <div>
        <p className="text-xs font-semibold mb-3" style={{ color: P.textMid }}>
          Assign Employees
        </p>
        <div className="flex gap-2 mb-3">
          {(["Individual", "By Department", "By Role", "Import CSV"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setAssignmentMode(m)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{
                background: assignmentMode === m ? P.olive : "white",
                color: assignmentMode === m ? "white" : P.textMid,
                border: `1px solid ${assignmentMode === m ? P.olive : P.border}`,
              }}
            >
              {m}
            </button>
          ))}
        </div>
        {assignmentMode === "Individual" ? (
          <div
            className="rounded-xl border p-3 space-y-3"
            style={{ borderColor: P.border, background: P.bg }}
          >
            <div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  Cohort
                </label>
                <select
                  value={selectedCohortId}
                  onChange={(e) => setSelectedCohortId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                  disabled={!cohortsEnabled || programCohorts.length === 0}
                >
                  <option value="">Select cohort...</option>
                  {programCohorts.map((cohort) => (
                    <option key={cohort.id} value={cohort.id}>
                      {cohort.name} - {cohort.startDate}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedCohortId && (
              <div>
                <p className="mb-2 text-xs font-semibold" style={{ color: P.textMid }}>
                  Select Employees
                </p>
                <div className="grid gap-2 md:grid-cols-2">
                  {TEAM_MEMBERS.map((employee) => {
                    const assignedCohort = programCohorts.find((cohort) =>
                      (cohort.employeeNames ?? []).includes(employee.name),
                    );
                    const checked = assignedCohort?.id === selectedCohortId;
                    const assignedElsewhere = Boolean(assignedCohort && !checked);

                    return (
                      <label
                        key={employee.name}
                        className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2"
                        style={{
                          borderColor: checked ? P.olive : P.border,
                          background: checked ? P.paleGreen : "white",
                          cursor: assignedElsewhere ? "not-allowed" : "pointer",
                          opacity: assignedElsewhere ? 0.55 : 1,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={assignedElsewhere}
                          onChange={(event) =>
                            toggleEmployeeInSelectedCohort(employee.name, event.target.checked)
                          }
                          style={{ accentColor: P.olive, width: 15, height: 15 }}
                        />
                        <Av initials={employee.av} size={24} color={employee.color} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-medium" style={{ color: P.text }}>
                            {employee.name}
                          </span>
                          <span className="block truncate text-[10px]" style={{ color: P.textMuted }}>
                            {assignedElsewhere
                              ? `Assigned to ${assignedCohort?.name}`
                              : employee.role}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {(!cohortsEnabled || programCohorts.length === 0) && (
              <div
                className="rounded-lg border px-3 py-2 text-[11px]"
                style={{ borderColor: P.border, color: P.textMuted, background: "white" }}
              >
                Add at least one cohort above before assigning individual employees.
              </div>
            )}

            {programCohorts.length > 0 && (
              <div className="space-y-2">
                {programCohorts.map((cohort) => {
                  const assignedNames = cohort.employeeNames ?? [];

                  return (
                    <div
                      key={cohort.id}
                      className="rounded-lg border p-3"
                      style={{ borderColor: P.border, background: "white" }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold" style={{ color: P.text }}>
                            {cohort.name}
                          </p>
                          <p className="text-[10px]" style={{ color: P.textMuted }}>
                            {assignedNames.length} employee
                            {assignedNames.length === 1 ? "" : "s"} assigned
                          </p>
                        </div>
                        <span
                          className="rounded-full px-2 py-1 text-[10px] font-semibold"
                          style={{ background: P.lightSage, color: P.olive }}
                        >
                          Starts {cohort.startDate}
                        </span>
                      </div>
                      {assignedNames.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {assignedNames.map((name) => {
                            const employee = TEAM_MEMBERS.find((member) => member.name === name);

                            return (
                              <span
                                key={name}
                                className="inline-flex items-center gap-2 rounded-full border px-2 py-1"
                                style={{ borderColor: P.border, background: P.paleGreen }}
                              >
                                <Av
                                  initials={employee?.av ?? name.slice(0, 2).toUpperCase()}
                                  size={20}
                                  color={employee?.color ?? P.olive}
                                />
                                <span className="text-[11px] font-medium" style={{ color: P.text }}>
                                  {name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeEmployeeFromCohort(cohort.id, name)}
                                  className="rounded-full p-0.5 hover:bg-red-50"
                                  aria-label={`Remove ${name} from ${cohort.name}`}
                                >
                                  <X size={11} style={{ color: "#C0392B" }} />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="mt-3 text-[11px]" style={{ color: P.textMuted }}>
                          No employees assigned to this cohort yet.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div
            className="rounded-xl border px-3 py-2 text-[11px]"
            style={{ borderColor: P.border, color: P.textMuted, background: P.bg }}
          >
            {assignmentMode} assignment can be configured after the individual cohort roster is
            saved.
          </div>
        )}
      </div>
    </>
  );
}
