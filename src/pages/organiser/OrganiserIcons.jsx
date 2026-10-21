// Inline SVG icons shared by the organiser pages (currentColor, decorative).
const Icon = ({ children, size = 18, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    {children}
  </svg>
)

export const PlusIcon = (p) => <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>
export const UsersIcon = (p) => (
  <Icon {...p}><circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 14 0" /><path d="M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3" /></Icon>
)
export const EditIcon = (p) => (
  <Icon {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></Icon>
)
export const TrashIcon = (p) => (
  <Icon {...p}><path d="M3 6h18" /><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></Icon>
)
export const CheckIcon = (p) => <Icon {...p}><path d="m5 12 5 5L20 7" /></Icon>
export const ClockIcon = (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>
export const XIcon = (p) => <Icon {...p}><path d="M18 6 6 18M6 6l12 12" /></Icon>
export const CalendarIcon = (p) => (
  <Icon {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></Icon>
)
export const PinIcon = (p) => (
  <Icon {...p}><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></Icon>
)
export const ClubIcon = (p) => (
  <Icon {...p}><path d="M3 21h18M5 21V10l7-6 7 6v11" /><path d="M9 21v-6h6v6" /></Icon>
)
export const ImageIcon = (p) => (
  <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></Icon>
)
export const ArrowLeftIcon = (p) => <Icon {...p}><path d="M19 12H5M12 19l-7-7 7-7" /></Icon>
export const SaveIcon = (p) => (
  <Icon {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><path d="M17 21v-8H7v8M7 3v5h8" /></Icon>
)
