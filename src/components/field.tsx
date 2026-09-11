import type { ReactNode } from "react";

export const inputClass =
  "rounded-none border border-line bg-ink-950/60 px-3 py-2.5 text-sm text-fg placeholder:text-fg-muted transition focus:border-cyan-dim";

export const buttonClass =
  "tracked text-label border border-cyan-dim/50 bg-cyan/10 px-5 py-2.5 text-cyan transition hover:border-cyan hover:bg-cyan/20";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="tracked text-label text-fg-muted">{label}</span>
      {children}
    </label>
  );
}
