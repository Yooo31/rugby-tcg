"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Fait respecter le réglage système « réduire les animations » à toutes les animations Motion. */
export function MotionPreferences({
  children,
}: {
  readonly children: ReactNode;
}) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
