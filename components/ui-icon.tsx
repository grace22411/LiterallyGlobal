const paths = {
  "arrow-up-right": "M5 19 19 5M5 5h14v14",
  "arrow-down": "M12 3v18M5 14l7 7 7-7",
  "arrow-up": "M12 21V3M5 10l7-7 7 7",
  "arrow-left": "M21 12H3m7-7-7 7 7 7",
  "arrow-right": "M3 12h18m-7-7 7 7-7 7",
  asterisk: "M12 2v20M2 12h20M5 5l14 14M5 19 19 5",
} as const;

/** Decorative SVGs keep navigation symbols consistent across device fonts. */
export function UiIcon({ name }: { name: keyof typeof paths }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ display: "inline-block", verticalAlign: "-0.125em", flexShrink: 0 }}
    >
      <path d={paths[name]} />
    </svg>
  );
}
