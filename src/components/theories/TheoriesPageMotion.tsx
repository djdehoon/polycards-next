"use client";

import { motion, useReducedMotion } from "framer-motion";

type Props = {
  children: React.ReactNode;
};

export function TheoriesPageMotion({ children }: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.main
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative z-10 mx-auto w-full max-w-[800px] space-y-16 px-6 py-10 sm:py-12"
    >
      {children}
    </motion.main>
  );
}
