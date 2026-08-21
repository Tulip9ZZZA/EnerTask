export type Pose = "front" | "left" | "right" | "back";
export type MascotAnim = "idle" | "walk" | "cheer";

interface LimbSet {
  legL: string;
  legR: string;
  torso: string;
  armL: string;
  armR: string;
  armLOrigin: string;
  armROrigin: string;
  headCx: number;
  hatDx: number;
  motionL: boolean;
  motionR: boolean;
}

const POSES: Record<Pose, LimbSet> = {
  front: {
    legL: "M 100 150 C 80 180, 70 210, 80 230",
    legR: "M 100 150 C 120 180, 130 210, 120 230",
    torso: "M 100 90 Q 90 120 100 150",
    armL: "M 95 100 C 60 100, 50 130, 60 150",
    armR: "M 105 100 C 140 100, 150 130, 140 150",
    armLOrigin: "95px 100px",
    armROrigin: "105px 100px",
    headCx: 100,
    hatDx: 0,
    motionL: true,
    motionR: true,
  },
  left: {
    legL: "M 100 150 C 85 180, 75 210, 90 230",
    legR: "M 100 150 C 105 180, 105 210, 100 225",
    torso: "M 100 90 Q 85 120 100 150",
    armL: "M 100 100 C 70 110, 60 130, 70 150",
    armR: "M 100 100 C 110 120, 105 140, 100 145",
    armLOrigin: "100px 100px",
    armROrigin: "100px 100px",
    headCx: 95,
    hatDx: -5,
    motionL: true,
    motionR: false,
  },
  right: {
    legL: "M 100 150 C 95 180, 95 210, 100 225",
    legR: "M 100 150 C 115 180, 125 210, 110 230",
    torso: "M 100 90 Q 115 120 100 150",
    armL: "M 100 100 C 90 120, 95 140, 100 145",
    armR: "M 100 100 C 130 110, 140 130, 130 150",
    armLOrigin: "100px 100px",
    armROrigin: "100px 100px",
    headCx: 105,
    hatDx: 5,
    motionL: false,
    motionR: true,
  },
  back: {
    legL: "M 100 150 C 80 180, 70 210, 80 230",
    legR: "M 100 150 C 120 180, 130 210, 120 230",
    torso: "M 100 90 Q 90 120 100 150",
    armL: "M 95 100 C 60 100, 50 130, 60 150",
    armR: "M 105 100 C 140 100, 150 130, 140 150",
    armLOrigin: "95px 100px",
    armROrigin: "105px 100px",
    headCx: 100,
    hatDx: 0,
    motionL: true,
    motionR: true,
  },
};

function CarrotHat({ dx }: { dx: number }) {
  const o = 100 + dx;
  return (
    <g className="et-hat" style={{ transformOrigin: `${o}px 48px` }}>
      <g className="et-leaves" fill="none" strokeLinecap="round" style={{ transformOrigin: `${o}px 22px` }}>
        {/* left leaf */}
        <path d={`M ${99.5 + dx} 22 Q ${94 + dx} 14 ${89 + dx} 6`} stroke="#00A36C" strokeWidth="6" />
        <path d={`M ${99 + dx} 21 Q ${95 + dx} 15 ${91 + dx} 8`} stroke="#00C888" strokeWidth="2" opacity="0.7" />
        <path d={`M ${98.5 + dx} 20 Q ${96 + dx} 16 ${93 + dx} 10`} stroke="#00E8A0" strokeWidth="1" opacity="0.5" />
        {/* center leaf */}
        <path d={`M ${o} 22 Q ${o} 13 ${o} 4`} stroke="#00A36C" strokeWidth="6" />
        <path d={`M ${o} 21 Q ${o} 14 ${o} 6`} stroke="#00C888" strokeWidth="2" opacity="0.7" />
        <path d={`M ${o} 20 Q ${o} 15 ${o} 8`} stroke="#00E8A0" strokeWidth="1" opacity="0.5" />
        {/* right leaf */}
        <path d={`M ${100.5 + dx} 22 Q ${106 + dx} 14 ${111 + dx} 6`} stroke="#00A36C" strokeWidth="6" />
        <path d={`M ${101 + dx} 21 Q ${105 + dx} 15 ${109 + dx} 8`} stroke="#00C888" strokeWidth="2" opacity="0.7" />
        <path d={`M ${101.5 + dx} 20 Q ${104 + dx} 16 ${107 + dx} 10`} stroke="#00E8A0" strokeWidth="1" opacity="0.5" />
      </g>
      <path
        d={`M ${88 + dx} 46 C ${78 + dx} 20, ${122 + dx} 20, ${112 + dx} 46 Q ${o} 56 ${88 + dx} 46 Z`}
        fill="#FF8235"
      />
      <line x1={94 + dx} y1="32" x2={106 + dx} y2="32" stroke="#D96820" strokeWidth="2" strokeLinecap="round" />
      <line x1={97 + dx} y1="40" x2={103 + dx} y2="40" stroke="#D96820" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function Glasses({ pose }: { pose: Pose }) {
  if (pose === "back") return null;
  if (pose === "left") {
    return (
      <g stroke="#000000" strokeWidth="3.5" fill="#FAF9F6">
        <rect x="76" y="60" width="14" height="14" rx="2" />
        <line x1="115" y1="67" x2="90" y2="67" />
      </g>
    );
  }
  if (pose === "right") {
    return (
      <g stroke="#000000" strokeWidth="3.5" fill="#FAF9F6">
        <rect x="110" y="60" width="14" height="14" rx="2" />
        <line x1="85" y1="67" x2="110" y2="67" />
      </g>
    );
  }
  return (
    <g stroke="#000000" strokeWidth="3.5" fill="#FAF9F6">
      <rect x="76" y="60" width="18" height="14" rx="2" />
      <rect x="106" y="60" width="18" height="14" rx="2" />
      <line x1="94" y1="67" x2="106" y2="67" />
      <line x1="68" y1="67" x2="76" y2="67" />
      <line x1="124" y1="67" x2="132" y2="67" />
    </g>
  );
}

interface MascotProps {
  pose?: Pose;
  anim?: MascotAnim;
  className?: string;
  label?: string;
}

export default function Mascot({ pose = "front", anim = "idle", className = "", label = "EnerTask carrot mascot" }: MascotProps) {
  const p = POSES[pose];
  return (
    <svg
      viewBox="0 0 200 250"
      className={`mascot ${className}`}
      data-anim={anim}
      role="img"
      aria-label={label}
    >
      {/* motion lines */}
      <g className="et-motion" opacity="0.4">
        {p.motionL && (
          <path d="M 40 180 Q 20 150 40 120" fill="none" stroke="#1C1C1E" strokeWidth="2" strokeDasharray="4 4" />
        )}
        {p.motionR && (
          <path d="M 160 180 Q 180 150 160 120" fill="none" stroke="#1C1C1E" strokeWidth="2" strokeDasharray="4 4" />
        )}
      </g>

      <g className="et-bob">
        {/* shadow */}
        <ellipse cx="100" cy="230" rx="60" ry="12" fill="#E5E5EA" />

        {/* body */}
        <g stroke="#1C1C1E" strokeLinecap="round" fill="none">
          <g className="et-leg-l" style={{ transformOrigin: "100px 150px" }}>
            <path d={p.legL} strokeWidth="18" />
          </g>
          <g className="et-leg-r" style={{ transformOrigin: "100px 150px" }}>
            <path d={p.legR} strokeWidth="18" />
          </g>
          <path d={p.torso} strokeWidth="22" />
          <g className="et-arm-l" style={{ transformOrigin: p.armLOrigin }}>
            <path d={p.armL} strokeWidth="14" />
          </g>
          <g className="et-arm-r" style={{ transformOrigin: p.armROrigin }}>
            <path d={p.armR} strokeWidth="14" />
          </g>
        </g>

        {/* head */}
        <g className="et-head" style={{ transformOrigin: `${p.headCx}px 90px` }}>
          <circle cx={p.headCx} cy="70" r="22" fill="#1C1C1E" />
        </g>

        <Glasses pose={pose} />
        <CarrotHat dx={p.hatDx} />
      </g>
    </svg>
  );
}
