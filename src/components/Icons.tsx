import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 18, ...rest }: P) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...rest,
  };
}

export function CarrotMark({ size = 28, ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...rest}>
      <path d="M9 13 L23 13 L18 29 Q16 32 14 29 Z" fill="#FF8235" stroke="#1C1C1E" strokeWidth="1.8" strokeLinejoin="round" />
      <line x1="13" y1="18" x2="19" y2="18" stroke="#D96820" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="14.5" y1="23" x2="17.5" y2="23" stroke="#D96820" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 12 Q14.5 7 11 3.5" stroke="#00A36C" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M16 12 Q16 6.5 16 2.5" stroke="#00A36C" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M16 12 Q17.5 7 21 3.5" stroke="#00A36C" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export const IconBulb = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 18h6M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.5 10.9c.8.6 1.5 1.6 1.5 2.6h4c0-1 .7-2 1.5-2.6A6 6 0 0 0 12 3Z" />
    <path d="M12 8v3" opacity=".5" />
  </svg>
);

export const IconCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 12.5 9.5 18 20 6.5" />
  </svg>
);

export const IconTimer = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="13.5" r="7.5" />
    <path d="M12 9.5v4l2.8 1.8" />
    <path d="M9.5 3h5M12 3v3" />
  </svg>
);

export const IconFlag = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 21V4" />
    <path d="M5 4c4-2.2 7 2 12 0v9c-5 2-8-2.2-12 0" fill="currentColor" fillOpacity=".25" />
  </svg>
);

export const IconTrash = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7h16M10 4h4M6.5 7l1 13h9l1-13" />
    <path d="M10 11v5M14 11v5" opacity=".55" />
  </svg>
);

export const IconStar = (p: P & { filled?: boolean }) => {
  const { filled, ...rest } = p;
  return (
    <svg {...base(rest)} fill={filled ? "currentColor" : "none"}>
      <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" />
    </svg>
  );
};

export const IconPlus = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconFlame = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3s1 2.5 1 4.5c1.5-1 2.5-1 2.5-1S18 9.5 18 13a6 6 0 0 1-12 0c0-3.5 2.5-6.5 6-10Z" />
    <path d="M12 20a3 3 0 0 1-3-3c0-1.8 1.5-3.2 3-4.5 1.5 1.3 3 2.7 3 4.5a3 3 0 0 1-3 3Z" fill="currentColor" fillOpacity=".3" stroke="none" />
  </svg>
);

export const IconPlay = (p: P) => (
  <svg {...base(p)}>
    <path d="M8 5.5v13l10-6.5-10-6.5Z" fill="currentColor" stroke="none" />
  </svg>
);

export const IconPause = (p: P) => (
  <svg {...base(p)}>
    <rect x="6.5" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
    <rect x="13.5" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconReset = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 12a8 8 0 1 0 2.3-5.6" />
    <path d="M4 4v4.5H8.5" />
  </svg>
);

export const IconArrowUp = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
);

export const IconTarget = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconClock = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const IconX = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const IconSprout = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21v-8" />
    <path d="M12 13C12 9 9.5 7 5.5 7c0 4 2.5 6 6.5 6Z" fill="currentColor" fillOpacity=".2" />
    <path d="M12 11c0-3.5 2.2-5.5 6.5-5.5 0 4.5-2.7 6.5-6.5 6.5" fill="currentColor" fillOpacity=".2" />
  </svg>
);

export const IconBolt = (p: P) => (
  <svg {...base(p)}>
    <path d="M13 3 5 13.5h5L10.5 21 19 10.5h-5.5L13 3Z" fill="currentColor" fillOpacity=".25" />
  </svg>
);

export const IconNote = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 4h14v12l-4 4H5V4Z" />
    <path d="M15 20v-4h4" />
    <path d="M8.5 9h7M8.5 12.5H13" opacity=".55" />
  </svg>
);
