const PATHS = {
  check: <path d="M20 6 9 17l-5-5" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  pause: <><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></>,
  play: <path d="M7 4v16l13-8z" />,
  trash: <><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /><path d="M10 11v5M14 11v5" /></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  pin: <><path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></>,
  users: <><circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 14 0" /><path d="M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  club: <><path d="M3 21h18M5 21V10l7-6 7 6v11" /><path d="M9 21v-6h6v6" /></>,
  student: <><path d="m2 9 10-5 10 5-10 5z" /><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" /></>,
  shield: <><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /><path d="m9 12 2 2 4-4" /></>,
  ban: <><circle cx="12" cy="12" r="9" /><path d="m5.6 5.6 12.8 12.8" /></>,
  list: <><path d="M9 6h12M9 12h12M9 18h12" /><circle cx="4.5" cy="6" r="1" /><circle cx="4.5" cy="12" r="1" /><circle cx="4.5" cy="18" r="1" /></>,
  chart: <><path d="M3 3v18h18" /><path d="M7 15l4-5 3 3 5-7" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>,
  percent: <><path d="M19 5 5 19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></>,
  key: <><circle cx="8" cy="15" r="4" /><path d="m11 12 9-9M16 7l3 3" /></>,
}

/** Inline SVG icon (currentColor, decorative). */
export default function AdminIcon({ name, size = 16, className = '' }) {
  return (
    <svg
      className={`adm__ico ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name] || PATHS.list}
    </svg>
  )
}
