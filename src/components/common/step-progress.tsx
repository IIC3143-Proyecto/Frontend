"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** Supported size options for StepProgress. */
type StepProgressSize = "sm" | "default" | "lg";

/** Size-based class names for StepProgress dots and connector lines. */
const sizeClasses = {
  sm: { dot: "size-5", text: "text-[10px]", line: "h-px", gap: "gap-1" },
  default: { dot: "size-6", text: "text-[11px]", line: "h-0.5", gap: "gap-1.5" },
  lg: { dot: "size-8", text: "text-xs", line: "h-1", gap: "gap-2" },
};

/**
 * Props for StepProgress.
 * @property currentStep 1-based index of the active step.
 * @property totalSteps Total number of steps to render.
 * @property size Visual size variant (default "default").
 * @property disabled Renders all steps in a muted/disabled color scheme.
 * @property className Additional class names for the root element.
 */
interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  size?: StepProgressSize;
  disabled?: boolean;
  className?: string;
}

/**
 * Horizontal step indicator with numbered dots connected by lines.
 * Completed steps and the active step are highlighted; future steps are muted.
 */
export function StepProgress({
  currentStep,
  totalSteps,
  size = "default",
  disabled = false,
  className,
}: StepProgressProps) {
  const s = sizeClasses[size];

  return (
    <div className={cn("flex items-center", s.gap, className)}>
      {Array.from({ length: totalSteps }).map((_, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <React.Fragment key={stepNum}>
            <div
              className={cn(
                s.dot,
                s.text,
                "rounded-full flex items-center justify-center font-bold shrink-0 transition-colors duration-200",
                !disabled && (isCompleted || isActive) && "bg-chart-4 text-white",
                !disabled && isActive && "ring-2 ring-chart-4 ring-offset-2",
                disabled && (isCompleted || isActive) && "bg-muted-foreground/30 text-muted-foreground",
                !isCompleted && !isActive && "bg-muted text-muted-foreground"
              )}
            >
              {stepNum}
            </div>
            {i < totalSteps - 1 && (
              <div
                className={cn(
                  "flex-1 rounded-full transition-colors duration-300",
                  s.line,
                  !disabled && isCompleted ? "bg-chart-4" : "bg-muted"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
