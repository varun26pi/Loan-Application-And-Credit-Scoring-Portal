'use client';

import { CheckCircle2, Circle } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

export function StepIndicator({
  steps,
  currentStep,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Mobile view */}
      <div className="md:hidden">
        <div className="flex items-center justify-between gap-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center gap-1 flex-1">
              <button
                onClick={() => onStepClick?.(index)}
                disabled={index > currentStep}
                className="disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {index < currentStep ? (
                  <CheckCircle2 className="w-8 h-8 text-accent fill-accent text-foreground" />
                ) : index === currentStep ? (
                  <Circle className="w-8 h-8 border-2 border-primary text-primary fill-primary/10" />
                ) : (
                  <Circle className="w-8 h-8 text-muted" />
                )}
              </button>
              <div className="text-xs font-medium text-center text-foreground truncate">
                {step.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden md:block">
        <div className="flex items-start">
          {steps.map((step, index) => (
            <div key={step.id} className="flex-1">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => onStepClick?.(index)}
                    disabled={index > currentStep}
                    className="disabled:opacity-50 disabled:cursor-not-allowed z-10 bg-background relative"
                  >
                    {index < currentStep ? (
                      <CheckCircle2 className="w-10 h-10 text-accent fill-accent text-foreground" />
                    ) : index === currentStep ? (
                      <Circle className="w-10 h-10 border-2 border-primary text-primary fill-primary/10" />
                    ) : (
                      <Circle className="w-10 h-10 text-muted" />
                    )}
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-1 h-16 mt-2 ${
                        index < currentStep ? 'bg-accent' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
                <div className="pt-1">
                  <div className="font-semibold text-foreground">{step.label}</div>
                  {step.description && (
                    <div className="text-sm text-muted-foreground">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
