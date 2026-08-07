"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { formatCentsToBRL, parseBRLToCents } from "@/lib/format";

/** Keeps its own text while typing so re-formatting on every keystroke doesn't desync the cursor. */
export function CurrencyInput({
  id,
  cents,
  onChange,
}: {
  id?: string;
  cents: number | null | undefined;
  onChange: (cents: number | null) => void;
}) {
  const [text, setText] = React.useState(cents ? formatCentsToBRL(cents).replace("R$", "").trim() : "");

  return (
    <Input
      id={id}
      inputMode="decimal"
      placeholder="0,00"
      value={text}
      onChange={(event) => setText(event.target.value)}
      onBlur={() => {
        const parsed = text.trim() ? parseBRLToCents(text) : null;
        onChange(parsed);
        setText(parsed ? formatCentsToBRL(parsed).replace("R$", "").trim() : "");
      }}
    />
  );
}
