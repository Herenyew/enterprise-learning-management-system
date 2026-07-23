import React from "react";
import { EditableSelect, P, Textarea } from "./extended.shared";
import type { HRProgramCreateTabContext } from "./HRProgramCreateTab";

export function HRProgramDefaultsSection({ ctx }: { ctx: HRProgramCreateTabContext }) {
  const {
    addManagedOption,
    approvalWorkflow,
    approvalWorkflowOptions,
    certTemplate,
    certTemplateOptions,
    duration,
    programDescription,
    programType,
    setApprovalWorkflow,
    setApprovalWorkflowOptions,
    setCertTemplate,
    setCertTemplateOptions,
    setProgramDescription,
    setXpMultiplier,
    setXpMultiplierOptions,
    xpMultiplier,
    xpMultiplierOptions,
  } = ctx;

  return (
    <>
      <Textarea
        label="Program Description"
        value={programDescription}
        onChange={setProgramDescription}
        placeholder="Describe the purpose and learning outcomes of this program…"
        rows={3}
      />

      <div className="grid md:grid-cols-3 gap-3">
        <div className="rounded-xl border p-3" style={{ borderColor: P.border }}>
          <EditableSelect
            label="Certification Template"
            options={certTemplateOptions}
            value={certTemplate}
            onChange={setCertTemplate}
            onAdd={(value) => addManagedOption(setCertTemplateOptions, value)}
          />
        </div>
        <div className="rounded-xl border p-3" style={{ borderColor: P.border }}>
          <EditableSelect
            label="XP Multiplier"
            options={xpMultiplierOptions}
            value={xpMultiplier}
            onChange={setXpMultiplier}
            onAdd={(value) => addManagedOption(setXpMultiplierOptions, value)}
          />
        </div>
        <div className="rounded-xl border p-3" style={{ borderColor: P.border }}>
          <EditableSelect
            label="Approval Workflow"
            options={approvalWorkflowOptions}
            value={approvalWorkflow}
            onChange={setApprovalWorkflow}
            onAdd={(value) => addManagedOption(setApprovalWorkflowOptions, value)}
          />
        </div>
      </div>

      <div
        className="rounded-xl border p-4"
        style={{ borderColor: P.border, background: P.paleGreen }}
      >
        <p className="text-xs font-semibold" style={{ color: P.text }}>
          Defaults applied for {programType}
        </p>
        <div className="grid md:grid-cols-3 gap-3 mt-3">
          {[
            ["Duration", duration],
            ["Certificate", certTemplate],
            ["Approval", approvalWorkflow],
          ].map(([label, value]) => (
            <div key={label} className="text-[10px]" style={{ color: P.textMuted }}>
              <span className="block font-bold uppercase">{label}</span>
              <span style={{ color: P.textMid }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
