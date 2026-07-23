import type React from "react";
import { P } from "../../constants/theme.constants";

export function PageHeader({
  title,
  sub,
  actions,
}: {
  title: string;
  sub?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1
          className="text-xl font-bold mb-0.5"
          style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
        >
          {title}
        </h1>
        {sub && (
          <p className="text-sm" style={{ color: P.textMuted }}>
            {sub}
          </p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
