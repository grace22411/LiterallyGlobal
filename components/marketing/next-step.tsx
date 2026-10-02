"use client";

import { UiIcon } from "@/components/ui-icon";
const options = [
  ["consultation", "I need direction"],
  ["document-review", "I have a draft"],
  ["done-with-you", "I’m ready to apply"],
  ["ultimate", "I need stronger evidence"],
] as const;

export function NextStep() {
  return (
    <div id="next-step" className="next-step">
      <p>Where are you right now?</p>
      <div className="step-options">
        {options.map(([id, label]) => (
          <a key={id} href={`#${id}`} onClick={() => document.getElementById(id)?.focus({ preventScroll: true })}>
            {label} <span aria-hidden="true"><UiIcon name="arrow-up-right" /></span>
          </a>
        ))}
      </div>
    </div>
  );
}
