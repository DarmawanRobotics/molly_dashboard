"use client";

import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Props = ComponentProps<"textarea"> & {
  size?: "sm" | "md";
  invalid?: boolean;
};

/**
 * Multi-line text input. Base UI doesn't ship a Textarea primitive so this
 * uses native <textarea> with matching styling.
 */
export function MollyTextarea({
  className,
  size = "md",
  invalid,
  rows = 3,
  ...rest
}: Props) {
  return (
    <textarea
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        "font-mono bg-mol-primary border text-txt-primary outline-none transition-colors resize-y min-h-16",
        "placeholder:text-txt-muted",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "focus:border-cyan",
        invalid
          ? "border-red focus:border-red"
          : "border-border-subtle hover:border-border",
        size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm",
        className,
      )}
      {...rest}
    />
  );
}
