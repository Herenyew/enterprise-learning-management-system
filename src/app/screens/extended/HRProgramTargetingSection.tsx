import React from "react";
import { Edit, EditableSelect, Input, P, Plus, Settings, Trash2, X } from "./extended.shared";
import type { HRProgramCreateTabContext } from "./HRProgramCreateTab";

type ListEditorProps = {
  title: string;
  items: string[];
  setItems: React.Dispatch<React.SetStateAction<string[]>>;
  selectedItem: string;
  onSelect: (value: string) => void;
  protectedItem?: string;
  placeholder: string;
  offset: number;
  ctx: HRProgramCreateTabContext;
};

function TargetListEditor({
  title,
  items,
  setItems,
  selectedItem,
  onSelect,
  protectedItem,
  placeholder,
  offset,
  ctx,
}: ListEditorProps) {
  const {
    addManagedOption,
    editIdx,
    editVal,
    newItem,
    setEditIdx,
    setEditingList,
    setEditVal,
    setNewItem,
  } = ctx;

  const saveRename = (index: number, previous: string) => {
    const next = editVal.trim();
    if (!next) return;
    setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? next : item)));
    if (selectedItem === previous) onSelect(next);
    setEditIdx(null);
    setEditVal("");
  };

  const addItem = () => {
    const next = newItem.trim();
    if (!next) return;
    addManagedOption(setItems, next);
    onSelect(next);
    setNewItem("");
  };

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: P.border }}>
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ background: P.paleGreen, borderBottom: `1px solid ${P.border}` }}
      >
        <p className="text-xs font-semibold" style={{ color: P.textMid }}>
          {title}
        </p>
        <button
          type="button"
          onClick={() => {
            setEditingList(null);
            setEditIdx(null);
            setEditVal("");
          }}
          className="flex items-center gap-1 text-[10px] font-semibold"
          style={{ color: P.olive }}
        >
          <X size={11} /> Done
        </button>
      </div>

      {items.map((item, index) => {
        const editable = item !== protectedItem;
        return (
          <div
            key={`${item}-${index}`}
            className="flex items-center gap-2 px-3 py-1.5"
            style={{ borderBottom: `1px solid ${P.border}40`, background: "white" }}
          >
            {editIdx === index + offset ? (
              <>
                <input
                  value={editVal}
                  onChange={(event) => setEditVal(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") saveRename(index, item);
                  }}
                  className="flex-1 rounded bg-white px-2 py-1 text-xs focus:outline-none"
                  style={{ border: `1px solid ${P.olive}`, color: P.text }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => saveRename(index, item)}
                  className="rounded px-2 py-1 text-[10px] font-semibold text-white"
                  style={{ background: P.olive }}
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-xs" style={{ color: P.textMid }}>
                  {item}
                </span>
                {editable && (
                  <button
                    type="button"
                    title={`Edit ${item}`}
                    onClick={() => {
                      setEditIdx(index + offset);
                      setEditVal(item);
                    }}
                    className="rounded p-1 hover:bg-[#ECFDF5]"
                    style={{ color: P.olive }}
                  >
                    <Edit size={11} />
                  </button>
                )}
                {editable && (
                  <button
                    type="button"
                    title={`Delete ${item}`}
                    onClick={() => {
                      setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
                      if (selectedItem === item) onSelect("");
                    }}
                    className="rounded p-1 hover:bg-red-50"
                    style={{ color: "#C0392B" }}
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </>
            )}
          </div>
        );
      })}

      <div className="flex gap-1.5 p-2" style={{ background: P.bg }}>
        <input
          value={editIdx === null ? newItem : ""}
          onChange={(event) => setNewItem(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") addItem();
          }}
          placeholder={placeholder}
          className="flex-1 rounded-lg bg-white px-2 py-1 text-xs focus:outline-none"
          style={{ border: `1px solid ${P.border}`, color: P.text }}
        />
        <button
          type="button"
          title="Add option"
          onClick={addItem}
          className="rounded-lg px-2.5 py-1 text-xs font-semibold text-white"
          style={{ background: P.olive }}
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}

export function HRProgramTargetingSection({ ctx }: { ctx: HRProgramCreateTabContext }) {
  const {
    addManagedOption,
    departments,
    duration,
    editingList,
    programOwner,
    programOwnerOptions,
    roles,
    setDepartments,
    setDuration,
    setEditIdx,
    setEditingList,
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
  } = ctx;

  const selectedTarget = targetDepartment
    ? `department:${targetDepartment}`
    : targetRole
      ? `role:${targetRole}`
      : `audience:${targetAudience}`;

  const selectTarget = (rawValue: string) => {
    const [kind, ...valueParts] = rawValue.split(":");
    const value = valueParts.join(":");

    if (!value) {
      setTargetAudience("All Employees");
      setTargetDepartment("");
      setTargetRole("");
      return;
    }

    if (kind === "department") {
      setTargetAudience(`${value} Department`);
      setTargetDepartment(value);
      setTargetRole("");
      return;
    }

    if (kind === "role") {
      setTargetAudience(value);
      setTargetDepartment("");
      setTargetRole(value);
      return;
    }

    setTargetAudience(value);
    setTargetDepartment("");
    setTargetRole("");
  };

  const openEditor = (list: "audiences" | "depts" | "roles") => {
    setEditingList(list);
    setEditIdx(null);
    setNewItem("");
  };

  const listEditor = (() => {
    if (editingList === "audiences") {
      return (
        <TargetListEditor
          title="Audience Groups"
          items={targetAudienceOptions}
          setItems={setTargetAudienceOptions}
          selectedItem={!targetDepartment && !targetRole ? targetAudience : ""}
          onSelect={(value) => selectTarget(`audience:${value || "All Employees"}`)}
          placeholder="Add audience group..."
          offset={3000}
          ctx={ctx}
        />
      );
    }

    if (editingList === "depts") {
      return (
        <TargetListEditor
          title="Departments"
          items={departments}
          setItems={setDepartments}
          selectedItem={targetDepartment}
          onSelect={(value) =>
            selectTarget(value ? `department:${value}` : "audience:All Employees")
          }
          protectedItem="All"
          placeholder="Add department..."
          offset={1000}
          ctx={ctx}
        />
      );
    }

    if (editingList === "roles") {
      return (
        <TargetListEditor
          title="Roles"
          items={roles}
          setItems={setRoles}
          selectedItem={targetRole}
          onSelect={(value) => selectTarget(value ? `role:${value}` : "audience:All Employees")}
          protectedItem="All"
          placeholder="Add role..."
          offset={2000}
          ctx={ctx}
        />
      );
    }

    return null;
  })();

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold" style={{ color: P.textMid }}>
          Duration
        </label>
        <input
          value={duration}
          onChange={(event) => setDuration(event.target.value)}
          placeholder="e.g. 8 weeks"
          className="w-full rounded-lg bg-white px-3 py-2 text-sm focus:outline-none"
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

      <div>
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <label className="block text-xs font-semibold" style={{ color: P.textMid }}>
            Target Audience <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap justify-end gap-2">
            {(
              [
                ["audiences", "Groups"],
                ["depts", "Departments"],
                ["roles", "Roles"],
              ] as const
            ).map(([list, label]) => (
              <button
                key={list}
                type="button"
                onClick={() => openEditor(list)}
                className="flex items-center gap-1 text-[10px] font-semibold hover:underline"
                style={{ color: P.olive }}
              >
                <Settings size={11} /> {label}
              </button>
            ))}
          </div>
        </div>
        <select
          value={selectedTarget}
          onChange={(event) => selectTarget(event.target.value)}
          className="w-full rounded-lg bg-white px-3 py-2 text-sm focus:outline-none"
          style={{ border: `1px solid ${P.border}`, color: P.text }}
        >
          <optgroup label="Company-wide groups">
            {targetAudienceOptions.map((audience) => (
              <option key={`audience-${audience}`} value={`audience:${audience}`}>
                {audience}
              </option>
            ))}
          </optgroup>
          <optgroup label="Departments">
            {departments
              .filter((department) => department !== "All")
              .map((department) => (
                <option key={`department-${department}`} value={`department:${department}`}>
                  {department}
                </option>
              ))}
          </optgroup>
          <optgroup label="Roles">
            {roles
              .filter((role) => role !== "All")
              .map((role) => (
                <option key={`role-${role}`} value={`role:${role}`}>
                  {role}
                </option>
              ))}
          </optgroup>
        </select>
        <p className="mt-1 text-[10px]" style={{ color: P.textMuted }}>
          Select a company-wide group, department, or role.
        </p>
      </div>

      {listEditor}

      <div>
        <label className="mb-1.5 block text-xs font-semibold" style={{ color: P.textMid }}>
          Visibility <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(["Public", "Private"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setVisibility(option)}
              className="rounded-lg px-3 py-2 text-xs font-semibold"
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
    </div>
  );
}
