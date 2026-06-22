"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ReactNode } from "react";

type Direction = 1 | -1; // 1 = like (right), -1 = ignore (left)

const variants: Variants = {
  initial: { opacity: 0 },
  animate: { x: 0, opacity: 1},
  exit: (direction: Direction) => ({
    x: direction > 0 ? "100%" : "-100%",
    rotate: direction > 0 ? 15 : -15,
    opacity: 1,
  }),
};

interface PostTransitionProps {
  postKey: string | number;
  direction: Direction;
  children: ReactNode;
}

export function PostTransition({ postKey, direction, children }: PostTransitionProps) {
  return (
    <AnimatePresence custom={direction} initial={false} mode="popLayout">
      <motion.div
        key={postKey}
        custom={direction}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="absolute inset-0"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}