// Extensions3.tsx — Configuration Center, Analytics Center, Course Builder,
// Certification Management, Gamification, Two-Level Moderation
// Olive / Sage / Gold enterprise design language

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { CfgSection, CfgToggle, P, SaveBar } from "./configuration.shared";

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

      <SaveBar />
    </div>
  );
}

// ─── XP & Gamification Config ─────────────────────────────────
