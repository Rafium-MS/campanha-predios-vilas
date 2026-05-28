"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="danger" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Excluindo..." : "Excluir"}
    </Button>
  );
}

export function DeleteForm({ action }: { action: () => void | Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm("Tem certeza que deseja excluir este registro?")) {
          event.preventDefault();
        }
      }}
    >
      <SubmitButton />
    </form>
  );
}
