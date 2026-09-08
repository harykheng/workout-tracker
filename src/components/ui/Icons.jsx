const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function Svg({ size = 20, children, ...rest }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...rest} aria-hidden="true">
      {children}
    </svg>
  );
}

export const IconHome = (p) => (
  <Svg {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V20h14V9.5" />
    <path d="M9.5 20v-5.5h5V20" />
  </Svg>
);

export const IconDumbbell = (p) => (
  <Svg {...p}>
    <path d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10" />
  </Svg>
);

export const IconChart = (p) => (
  <Svg {...p}>
    <path d="M4 20V4" />
    <path d="M4 20h16" />
    <path d="M7.5 16.5 11 12l3 2.5 4.5-6.5" />
  </Svg>
);

export const IconUser = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M4.5 20c.8-3.6 3.8-5.5 7.5-5.5s6.7 1.9 7.5 5.5" />
  </Svg>
);

export const IconPlay = ({ size = 20, ...p }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...p} aria-hidden="true">
    <path d="M8 5.5v13l11-6.5z" />
  </svg>
);

export const IconPause = ({ size = 20, ...p }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...p} aria-hidden="true">
    <rect x="7" y="5" width="3.6" height="14" rx="1.2" />
    <rect x="13.4" y="5" width="3.6" height="14" rx="1.2" />
  </svg>
);

export const IconCheck = (p) => (
  <Svg strokeWidth={2.6} {...p}>
    <path d="M5 12.5 10 17.5 19 7" />
  </Svg>
);

export const IconChevronRight = (p) => (
  <Svg {...p}>
    <path d="M9 5l7 7-7 7" />
  </Svg>
);

export const IconChevronLeft = (p) => (
  <Svg {...p}>
    <path d="M15 5l-7 7 7 7" />
  </Svg>
);

export const IconChevronDown = (p) => (
  <Svg {...p}>
    <path d="M5 9l7 7 7-7" />
  </Svg>
);

export const IconArrowRight = (p) => (
  <Svg strokeWidth={2.2} {...p}>
    <path d="M4 12h15" />
    <path d="M13 6l6 6-6 6" />
  </Svg>
);

export const IconPlus = (p) => (
  <Svg strokeWidth={2.2} {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const IconMinus = (p) => (
  <Svg strokeWidth={2.2} {...p}>
    <path d="M5 12h14" />
  </Svg>
);

export const IconX = (p) => (
  <Svg strokeWidth={2.2} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const IconTimer = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="13.5" r="7.5" />
    <path d="M12 9.5v4l2.5 1.8M9.5 2.5h5" />
  </Svg>
);

export const IconFlame = (p) => (
  <Svg {...p}>
    <path d="M12 3s5 4.2 5 8.6A5 5 0 0 1 7 12c0-1.6.6-2.8 1.4-3.8.3 1 .9 1.8 1.8 2.2C10.8 8 11.4 5.5 12 3z" />
    <path d="M9.6 15.5c0 1.4 1.1 2.5 2.4 2.5s2.4-1.1 2.4-2.5" opacity=".55" />
  </Svg>
);

export const IconWaves = (p) => (
  <Svg {...p}>
    <path d="M3 15c1.6 0 1.6 1.6 3.2 1.6S7.8 15 9.4 15s1.6 1.6 3.2 1.6S14.2 15 15.8 15s1.6 1.6 3.2 1.6S20.6 15 21 15" />
    <path d="M3 19c1.6 0 1.6 1.6 3.2 1.6S7.8 19 9.4 19s1.6 1.6 3.2 1.6S14.2 19 15.8 19s1.6 1.6 3.2 1.6S20.6 19 21 19" opacity=".5" />
    <path d="M7 12V6.5A2.5 2.5 0 0 1 12 6M12 12V7" />
  </Svg>
);

export const IconRacket = (p) => (
  <Svg {...p}>
    <ellipse cx="13.5" cy="8.5" rx="6" ry="6.5" />
    <path d="M9.4 13.4 4 20M9.5 6.5v5M13.5 4.5v8M17.5 6.5v5M8 8.5h11M8 11h11" opacity=".85" />
  </Svg>
);

export const IconSettings = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 14.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.11a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.11a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.56V3a2 2 0 1 1 4 0v.11a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.56 1H21a2 2 0 1 1 0 4h-.11a1.7 1.7 0 0 0-1.49 1.5z" />
  </Svg>
);

export const IconDownload = (p) => (
  <Svg {...p}>
    <path d="M12 3v12" />
    <path d="M7.5 11 12 15.5 16.5 11" />
    <path d="M4 20h16" />
  </Svg>
);

export const IconUpload = (p) => (
  <Svg {...p}>
    <path d="M12 16V4" />
    <path d="M7.5 8.5 12 4l4.5 4.5" />
    <path d="M4 20h16" />
  </Svg>
);

export const IconCalendar = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
    <path d="M3.5 9.5h17M8.5 3v4M15.5 3v4" />
  </Svg>
);

export const IconScale = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="4" />
    <path d="M8.5 11.5 12 8l3.5 3.5" />
    <path d="M7 16h10" opacity=".6" />
  </Svg>
);

export const IconTrash = (p) => (
  <Svg {...p}>
    <path d="M4 7h16M9.5 7V5h5v2M6.5 7l1 13h9l1-13" />
  </Svg>
);

export const IconEdit = (p) => (
  <Svg {...p}>
    <path d="M4 20h4l10-10-4-4L4 16z" />
    <path d="M13.5 5.5 18.5 10.5" />
  </Svg>
);

export const IconBolt = (p) => (
  <Svg {...p}>
    <path d="M13.5 3 5.5 13.5H11l-.5 7.5 8-10.5H13z" />
  </Svg>
);

export const IconInfo = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5M12 7.6v.6" />
  </Svg>
);

export const IconWarn = (p) => (
  <Svg {...p}>
    <path d="M12 3.8 21 19.5H3z" />
    <path d="M12 10v4M12 17v.6" />
  </Svg>
);

export const IconSteam = (p) => (
  <Svg {...p}>
    <path d="M8 13c0-2 1.5-2.4 1.5-4S8 7 8 5M12 13c0-2 1.5-2.4 1.5-4S12 7 12 5M16 13c0-2 1.5-2.4 1.5-4S16 7 16 5" />
    <path d="M4 17h16M6 20.5h12" opacity=".6" />
  </Svg>
);

export const IconRefresh = (p) => (
  <Svg {...p}>
    <path d="M20 12a8 8 0 1 1-2.6-5.9" />
    <path d="M20 3.5V9h-5.5" />
  </Svg>
);

export const IconTarget = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </Svg>
);

export const IconLayers = (p) => (
  <Svg {...p}>
    <path d="M12 3 3 8l9 5 9-5z" />
    <path d="M3 13l9 5 9-5" opacity=".6" />
  </Svg>
);

export const IconImage = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="14" rx="3" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="m4.5 17 4.6-4.2 3.2 2.7 2.6-2.2 4.6 3.9" />
  </Svg>
);

export const IconSpark = (p) => (
  <Svg {...p}>
    <path d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9L12 18.5 10.1 12.8 4.5 10.9 10.1 9z" />
    <path d="M18.5 3.5v3M20 5h-3" opacity=".6" />
  </Svg>
);

export const DAY_ICONS = {
  d1: IconDumbbell,
  d2: IconLayers,
  d3: IconBolt,
  d4: IconFlame,
  padel: IconRacket,
  swim: IconWaves,
  custom: IconSpark,
};

/** Warna per jenis hari non-siklus. */
export const SPECIAL_TONE = {
  padel: 'bg-amber-400/15 text-amber-300',
  swim: 'bg-sky-400/15 text-sky-300',
  custom: 'bg-violet-400/15 text-violet-300',
};
