"use client";

import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = currentStep === index;
          const isCompleted = currentStep > index;
          
          return (
            <div 
              key={index} 
              className={cn(
                "flex flex-1 flex-col items-center",
                index === steps.length - 1 && "flex-none"
              )}
            >
              <div className="flex w-full items-center">
                <div className="flex-1">
                  {index > 0 && (
                    <div 
                      className={cn(
                        "h-1 w-full",
                        isCompleted 
                          ? "bg-primary" 
                          : "bg-border"
                      )}
                    />
                  )}
                </div>
                
                <div 
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold",
                    isActive && "border-primary text-primary",
                    isCompleted && "border-primary bg-primary text-primary-foreground",
                    !isActive && !isCompleted && "border-muted-foreground text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                
                <div className="flex-1">
                  {index < steps.length - 1 && (
                    <div 
                      className={cn(
                        "h-1 w-full",
                        isCompleted 
                          ? "bg-primary" 
                          : "bg-border"
                      )}
                    />
                  )}
                </div>
              </div>
              
              <div className="mt-2 text-center">
                <div 
                  className={cn(
                    "text-sm font-medium",
                    isActive && "text-foreground",
                    !isActive && "text-muted-foreground"
                  )}
                >
                  {step.title}
                </div>
                {step.description && (
                  <div 
                    className={cn(
                      "mt-0.5 text-xs",
                      isActive ? "text-muted-foreground" : "text-muted-foreground/70"
                    )}
                  >
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
