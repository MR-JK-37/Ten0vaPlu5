"use client";

import { Check, X } from "lucide-react";
import { passwordRules } from "@/lib/auth/password";
import { cn } from "@/lib/utils";

export function PasswordChecklist({ password }: { password: string }) {
  return (
    <ul className="mt-2 space-y-1 text-sm">
      {passwordRules.map((rule) => {
        const passed = rule.test(password);
        return (
          <li
            key={rule.label}
            className={cn(
              "flex items-center gap-1.5",
              passed ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
            )}
          >
            {passed ? <Check className="size-3.5" /> : <X className="size-3.5" />}
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
