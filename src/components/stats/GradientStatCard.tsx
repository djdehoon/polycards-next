"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export type StatVariant = "blue" | "orange" | "purple" | "yellow";

const variantStyles: Record<
  StatVariant,
  { gradient: string; shadow: string }
> = {
  blue: {
    gradient: "from-blue-600/90 to-blue-800/80",
    shadow: "0 12px 32px rgba(37,99,235,0.25)",
  },
  orange: {
    gradient: "from-orange-500/90 to-amber-700/80",
    shadow: "0 12px 32px rgba(249,115,22,0.25)",
  },
  purple: {
    gradient: "from-violet-600/90 to-purple-900/80",
    shadow: "0 12px 32px rgba(124,58,237,0.25)",
  },
  yellow: {
    gradient: "from-yellow-500/80 to-amber-600/90",
    shadow: "0 12px 32px rgba(234,179,8,0.22)",
  },
};

type GradientStatCardProps = {
  label: string;
  value: ReactNode;
  icon: string;
  variant: StatVariant;
  hint?: string;
  index: number;
  compact?: boolean;
};

export function GradientStatCard({
  label,
  value,
  icon,
  variant,
  hint,
  index,
  compact = false,
}: GradientStatCardProps) {
  const reduce = useReducedMotion();
  const styles = variantStyles[variant];

  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br p-3 ring-1 ring-white/10 sm:p-4 ${styles.gradient}`}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduce
          ? { duration: 0 }
          : {
              type: "spring",
              stiffness: 260,
              damping: 22,
              delay: index * 0.08,
            }
      }
      whileHover={
        reduce
          ? undefined
          : {
              scale: 1.03,
              boxShadow: styles.shadow,
            }
      }
    >
      <span
        className="pointer-events-none absolute right-3 top-3 text-2xl opacity-80"
        aria-hidden
      >
        {icon}
      </span>
      <p className="pr-8 text-xs font-medium uppercase tracking-wide text-white/70">
        {label}
      </p>
      <p
        className={`mt-0.5 font-bold text-white ${
          compact ? "text-lg sm:text-2xl" : "text-2xl"
        }`}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 line-clamp-2 text-[10px] text-white/60 sm:text-[11px]">
          {hint}
        </p>
      ) : null}
    </motion.div>
  );
}
