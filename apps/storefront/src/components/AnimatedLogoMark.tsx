"use client";

import { motion, useReducedMotion } from "framer-motion";

type Block = {
  id: string;
  w: number;
  h: number;
  x: number;
  y: number;
  fill: "orange" | "cocoa" | "sky" | "gold" | "cream";
  initial: { x: number; y: number; r: number; s: number };
  delay: number;
};

const blocks: Block[] = [
  {
    id: "b1",
    w: 64,
    h: 64,
    x: 10,
    y: 10,
    fill: "orange",
    initial: { x: -80, y: -60, r: -14, s: 0.9 },
    delay: 0.05,
  },
  {
    id: "b2",
    w: 64,
    h: 64,
    x: 82,
    y: 10,
    fill: "cream",
    initial: { x: 90, y: -40, r: 10, s: 0.92 },
    delay: 0.12,
  },
  {
    id: "b3",
    w: 64,
    h: 64,
    x: 154,
    y: 10,
    fill: "orange",
    initial: { x: 120, y: -10, r: 18, s: 0.9 },
    delay: 0.18,
  },
  {
    id: "b4",
    w: 64,
    h: 64,
    x: 10,
    y: 82,
    fill: "sky",
    initial: { x: -110, y: 20, r: 12, s: 0.92 },
    delay: 0.24,
  },
  {
    id: "b5",
    w: 64,
    h: 64,
    x: 82,
    y: 82,
    fill: "cocoa",
    initial: { x: 60, y: 70, r: -10, s: 0.9 },
    delay: 0.3,
  },
  {
    id: "b6",
    w: 64,
    h: 64,
    x: 154,
    y: 82,
    fill: "gold",
    initial: { x: 160, y: 80, r: 14, s: 0.9 },
    delay: 0.36,
  },
  {
    id: "b7",
    w: 136,
    h: 64,
    x: 10,
    y: 154,
    fill: "orange",
    initial: { x: -60, y: 140, r: 8, s: 0.92 },
    delay: 0.42,
  },
  {
    id: "b8",
    w: 64,
    h: 64,
    x: 154,
    y: 154,
    fill: "cream",
    initial: { x: 120, y: 160, r: -12, s: 0.9 },
    delay: 0.48,
  },
] as const;

function fillClass(fill: Block["fill"]) {
  if (fill === "orange") return "fill-ti-orange";
  if (fill === "cocoa") return "fill-ti-cocoa";
  if (fill === "sky") return "fill-ti-sky";
  if (fill === "gold") return "fill-ti-gold";
  return "fill-ti-cream";
}

export function AnimatedLogoMark({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <motion.svg
      viewBox="0 0 228 228"
      className={className}
      role="img"
      aria-label="TOYING IDEA animated mark"
      initial={false}
    >
      <defs>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="14" stdDeviation="10" floodColor="#24150B" floodOpacity="0.18" />
        </filter>
      </defs>

      <rect x="0" y="0" width="228" height="228" rx="44" className="fill-ti-cream" />

      {blocks.map((b) => (
        <motion.rect
          key={b.id}
          x={b.x}
          y={b.y}
          width={b.w}
          height={b.h}
          rx="18"
          filter="url(#shadow)"
          className={fillClass(b.fill)}
          initial={
            reduce
              ? { opacity: 1, x: b.x, y: b.y, rotate: 0, scale: 1 }
              : { opacity: 0, x: b.x + b.initial.x, y: b.y + b.initial.y, rotate: b.initial.r, scale: b.initial.s }
          }
          animate={
            reduce
              ? { opacity: 1, x: b.x, y: b.y, rotate: 0, scale: 1 }
              : { opacity: 1, x: b.x, y: b.y, rotate: 0, scale: 1 }
          }
          transition={
            reduce
              ? undefined
              : {
                  duration: 2.2,
                  ease: [0.2, 0.9, 0.2, 1],
                  delay: b.delay,
                }
          }
        />
      ))}

      <motion.g
        initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.7, delay: 0.85, ease: "easeOut" }}
      >
        <text
          x="114"
          y="216"
          textAnchor="middle"
          className="fill-ti-cocoa"
          style={{ fontFamily: "var(--font-ti-display)", fontSize: 16, letterSpacing: "-0.02em" }}
        >
          TOYING IDEA
        </text>
      </motion.g>
    </motion.svg>
  );
}

