/**
 * Official Suvidha friendly blue rhino mascot emblem.
 */
export function RhinoLogo({
  size = 42,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 248 248"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="248" height="248" rx="58" fill="#1769AA" />
      <path
        d="M47 151c0-40 28-72 68-80 33-7 64 4 83 29l17 7c13 5 20 16 19 29l-2 23c-1 14-11 24-25 25l-19 1-6 31h-25l-4-29H94l-5 29H64l-3-40c-9-6-14-14-14-25Z"
        fill="#FFFFFF"
      />
      <path
        d="M102 82c-5-17 2-31 17-39 9 12 10 25 2 39"
        fill="#CFE7F8"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M207 112l29-31-7 42Z"
        fill="#FFFFFF"
        stroke="#1769AA"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M188 129c13-5 27-2 39 6l-5 22c-2 9-10 15-20 15h-23Z"
        fill="#DCEFFA"
      />
      <circle cx="211" cy="150" r="2.8" fill="#1769AA" />
      <circle cx="201" cy="153" r="2.8" fill="#1769AA" />
      <ellipse cx="165" cy="112" rx="5.3" ry="6.5" fill="#123E67" />
      <circle cx="151" cy="129" r="4" fill="#8CC5EC" />
      <path
        d="M191 163c7 5 15 5 22 0"
        fill="none"
        stroke="#1769AA"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M66 194v11h27v-11M157 194v11h27v-11"
        fill="#DCEFFA"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M54 62v18M45 71h18"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
