"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "motion/react";

/**
 * Flipped to `true` once the app has mounted on the client. Component
 * instances that mount during a later client-side navigation read this as
 * already-true, so entrance animations only play on the first page load —
 * not on every filter/sort/pagination change or list↔detail return, which
 * is what made the catalog "flicker".
 */
let appHasMounted = false;

function useIsFirstLoad() {
  const [firstLoad] = useState(() => !appHasMounted);
  useEffect(() => {
    appHasMounted = true;
  }, []);
  return firstLoad;
}

/** Animate only on the very first load, and only if motion is allowed. */
function useEntrance() {
  const reduce = useReducedMotion();
  const firstLoad = useIsFirstLoad();
  return !reduce && firstLoad;
}

export function FadeIn({
  children,
  delay = 0,
  y = 12,
  className,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  const animate = useEntrance();
  return (
    <motion.div
      initial={animate ? { opacity: 0, y } : false}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={
        animate ? { duration: 0.25, delay, ease: "easeOut" } : undefined
      }
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function FadeInWhenVisible({
  children,
  delay = 0,
  className,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number }) {
  const animate = useEntrance();
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 14 } : false}
      whileInView={animate ? { opacity: 1, y: 0 } : undefined}
      viewport={animate ? { once: true, margin: "-40px" } : undefined}
      transition={
        animate ? { duration: 0.25, delay, ease: "easeOut" } : undefined
      }
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

const staggerParentVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: "easeOut" },
  },
};

export function StaggerContainer({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) {
  const animate = useEntrance();
  return (
    <motion.div
      variants={animate ? staggerParentVariants : undefined}
      initial={animate ? "hidden" : false}
      // Run immediately on first render instead of waiting for the
      // intersection observer — otherwise even above-the-fold cards
      // pop in 0.2s after mount, which reads as flicker.
      animate={animate ? "show" : undefined}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) {
  const animate = useEntrance();
  return (
    <motion.div
      variants={animate ? staggerItemVariants : undefined}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
