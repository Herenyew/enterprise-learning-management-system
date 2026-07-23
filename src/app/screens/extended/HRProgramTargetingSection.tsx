import React from "react";
import { Edit, EditableSelect, Input, P, Plus, Settings, Trash2, X } from "./extended.shared";
import type { HRProgramCreateTabContext } from "./HRProgramCreateTab";

export function HRProgramTargetingSection({ ctx }: { ctx: HRProgramCreateTabContext }) {
  const {
    addManagedOption,
    departments,
    duration,
    editIdx,
    editingList,
    editVal,
    programOwner,
    programOwnerOptions,
    roles,
    setDepartments,
    setDuration,
    setEditIdx,
    setEditingList,
    setEditVal,
    setNewItem,
    setProgramOwner,
    setProgramOwnerOptions,
    setRoles,
    setTargetAudience,
    setTargetAudienceOptions,
    setTargetDepartment,
    setTargetRole,
    setVisibility,
    targetAudience,
    targetAudienceOptions,
    targetDepartment,
    targetRole,
    visibility,
    newItem,
  } = ctx;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
          Duration
        </label>
        <input
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="e.g. 8 weeks"
          className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
          style={{ border: `1px solid ${P.border}`, color: P.text }}
        />
      </div>
      <Input label="Start Date" type="date" required />
      <Input label="End Date" type="date" required />

      <EditableSelect
        label="Program Owner"
        required
        options={programOwnerOptions}
        value={programOwner}
        onChange={setProgramOwner}
        onAdd={(value) => addManagedOption(setProgramOwnerOptions, value)}
      />

      <EditableSelect
        label="Target Audience"
        required
        options={targetAudienceOptions}
        value={targetAudience}
        onChange={setTargetAudience}
        onAdd={(value) => addManagedOption(setTargetAudienceOptions, value)}
      />

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
          Visibility <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(["Public", "Private"] as const).map((option) => (
            <button
              key={option}
              onClick={() => setVisibility(option)}
              className="px-3 py-2 rounded-lg text-xs font-semibold"
              style={{
                background: visibility === option ? P.lightSage : "white",
                border: `1px solid ${visibility === option ? P.olive : P.border}`,
                color: visibility === option ? P.olive : P.textMid,
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Target Department management */}
      <div>
        {editingList !== "depts" ? (
          <EditableSelect
            label="Target Department"
            options={departments.filter((d) => d !== "All")}
            value={targetDepartment}
            onChange={setTargetDepartment}
            onAdd={(value) => addManagedOption(setDepartments, value)}
            actionSlot={
              <button
                type="button"
                onClick={() => {
                  setEditingList("depts");
                  setEditIdx(null);
                  setNewItem("");
                }}
                className="text-[10px] font-semibold flex items-center gap-1"
                style={{ color: P.olive }}
              >
                <Settings size={11} /> Manage List
              </button>
            }
          />
        ) : (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: P.border }}>
            <div
              className="flex items-center justify-between px-3 py-2"
              style={{ background: P.paleGreen, borderBottom: `1px solid ${P.border}` }}
            >
              <p className="text-xs font-semibold" style={{ color: P.textMid }}>
                Target Departments
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingList(null);
                  setEditIdx(null);
                  setEditVal("");
                }}
                className="text-[10px] font-semibold flex items-center gap-1"
                style={{ color: "#C0392B" }}
              >
                <X size={11} /> Done
              </button>
            </div>
            {departments.map((d, i) => (
              <div
                key={d}
                className="flex items-center gap-2 px-3 py-1.5"
                style={{ borderBottom: `1px solid ${P.border}40`, background: "white" }}
              >
                {editIdx === i + 1000 ? (
                  <>
                    <input
                      value={editVal}
                      onChange={(e) => setEditVal(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs rounded bg-white focus:outline-none"
                      style={{ border: `1px solid ${P.olive}`, color: P.text }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && editVal.trim()) {
                          const nextValue = editVal.trim();
                          setDepartments((items) =>
                            items.map((item, index) => (index === i ? nextValue : item)),
                          );
                          if (targetDepartment === d) setTargetDepartment(nextValue);
                          setEditIdx(null);
                          setEditVal("");
                        }
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!editVal.trim()) return;
                        const nextValue = editVal.trim();
                        setDepartments((items) =>
                          items.map((item, index) => (index === i ? nextValue : item)),
                        );
                        if (targetDepartment === d) setTargetDepartment(nextValue);
                        setEditIdx(null);
                        setEditVal("");
                      }}
                      className="text-[10px] font-semibold px-2 py-1 rounded text-white"
                      style={{ background: P.olive }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditIdx(null);
                        setEditVal("");
                      }}
                      className="text-[10px]"
                      style={{ color: P.textMuted }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-xs" style={{ color: P.textMid }}>
                      {d}
                    </span>
                    {d !== "All" && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditIdx(i + 1000);
                          setEditVal(d);
                        }}
                        className="p-1 rounded hover:bg-[#F0F4E8]"
                        style={{ color: P.olive }}
                      >
                        <Edit size={10} />
                      </button>
                    )}
                    {d !== "All" && (
                      <button
                        type="button"
                        onClick={() => {
                          setDepartments((p) => p.filter((_, j) => j !== i));
                          if (targetDepartment === d) setTargetDepartment("");
                        }}
                        className="p-1 rounded hover:bg-red-50"
                        style={{ color: "#C0392B" }}
                      >
                        <Trash2 size={10} />
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
            <div className="flex gap-1.5 p-2" style={{ background: P.bg }}>
              <input
                value={editingList === "depts" && editIdx === null ? newItem : ""}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Add department..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newItem.trim()) {
                    const nextValue = newItem.trim();
                    addManagedOption(setDepartments, nextValue);
                    setTargetDepartment(nextValue);
                    setNewItem("");
                  }
                }}
                className="flex-1 px-2 py-1 text-xs rounded-lg bg-white focus:outline-none"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
              <button
                type="button"
                onClick={() => {
                  if (newItem.trim()) {
                    const nextValue = newItem.trim();
                    addManagedOption(setDepartments, nextValue);
                    setTargetDepartment(nextValue);
                    setNewItem("");
                  }
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg text-white"
                style={{ background: P.olive }}
              >
                <Plus size={11} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Target Role management */}
      <div>
        {editingList !== "roles" ? (
          <EditableSelect
            label="Target Role"
            options={roles.filter((r) => r !== "All")}
            value={targetRole}
            onChange={setTargetRole}
            onAdd={(value) => addManagedOption(setRoles, value)}
            actionSlot={
              <button
                type="button"
                onClick={() => {
                  setEditingList("roles");
                  setEditIdx(null);
                  setNewItem("");
                }}
                className="text-[10px] font-semibold flex items-center gap-1"
                style={{ color: P.olive }}
              >
                <Settings size={11} /> Manage List
              </button>
            }
          />
        ) : (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: P.border }}>
            <div
              className="flex items-center justify-between px-3 py-2"
              style={{ background: P.paleGreen, borderBottom: `1px solid ${P.border}` }}
            >
              <p className="text-xs font-semibold" style={{ color: P.textMid }}>
                Target Roles
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingList(null);
                  setEditIdx(null);
                  setEditVal("");
                }}
                className="text-[10px] font-semibold flex items-center gap-1"
                style={{ color: "#C0392B" }}
              >
                <X size={11} /> Done
              </button>
            </div>
            {roles.map((r, i) => (
              <div
                key={r}
                className="flex items-center gap-2 px-3 py-1.5"
                style={{ borderBottom: `1px solid ${P.border}40`, background: "white" }}
              >
                {editIdx === i + 2000 ? (
                  <>
                    <input
                      value={editVal}
                      onChange={(e) => setEditVal(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs rounded bg-white focus:outline-none"
                      style={{ border: `1px solid ${P.olive}`, color: P.text }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && editVal.trim()) {
                          const nextValue = editVal.trim();
                          setRoles((items) =>
                            items.map((item, index) => (index === i ? nextValue : item)),
                          );
                          if (targetRole === r) setTargetRole(nextValue);
                          setEditIdx(null);
                          setEditVal("");
                        }
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!editVal.trim()) return;
                        const nextValue = editVal.trim();
                        setRoles((items) =>
                          items.map((item, index) => (index === i ? nextValue : item)),
                        );
                        if (targetRole === r) setTargetRole(nextValue);
                        setEditIdx(null);
                        setEditVal("");
                      }}
                      className="text-[10px] font-semibold px-2 py-1 rounded text-white"
                      style={{ background: P.olive }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditIdx(null);
                        setEditVal("");
                      }}
                      className="text-[10px]"
                      style={{ color: P.textMuted }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-xs" style={{ color: P.textMid }}>
                      {r}
                    </span>
                    {r !== "All" && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditIdx(i + 2000);
                          setEditVal(r);
                        }}
                        className="p-1 rounded hover:bg-[#F0F4E8]"
                        style={{ color: P.olive }}
                      >
                        <Edit size={10} />
                      </button>
                    )}
                    {r !== "All" && (
                      <button
                        type="button"
                        onClick={() => {
                          setRoles((p) => p.filter((_, j) => j !== i));
                          if (targetRole === r) setTargetRole("");
                        }}
                        className="p-1 rounded hover:bg-red-50"
                        style={{ color: "#C0392B" }}
                      >
                        <Trash2 size={10} />
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
            <div className="flex gap-1.5 p-2" style={{ background: P.bg }}>
              <input
                value={editingList === "roles" && editIdx === null ? newItem : ""}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Add role..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newItem.trim()) {
                    const nextValue = newItem.trim();
                    addManagedOption(setRoles, nextValue);
                    setTargetRole(nextValue);
                    setNewItem("");
                  }
                }}
                className="flex-1 px-2 py-1 text-xs rounded-lg bg-white focus:outline-none"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
              <button
                type="button"
                onClick={() => {
                  if (newItem.trim()) {
                    const nextValue = newItem.trim();
                    addManagedOption(setRoles, nextValue);
                    setTargetRole(nextValue);
                    setNewItem("");
                  }
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg text-white"
                style={{ background: P.olive }}
              >
                <Plus size={11} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
