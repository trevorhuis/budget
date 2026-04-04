import { motion } from "motion/react";
import type { ReactNode } from "react";

export function CalculatorSurface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      className={`rounded-[2rem] border border-zinc-950/8 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/4 ${className ?? ""}`}
    >
      {children}
    </motion.section>
  );
}

