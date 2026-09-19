"use client";

export function DeleteButton({ confirmMessage }: { confirmMessage: string }) {
  return (
    <button
      type="submit"
      className="tracked text-label-sm text-fg-muted transition hover:text-cyan"
      onClick={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      Supprimer
    </button>
  );
}
