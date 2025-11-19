"use client";

import { Check } from "lucide-react";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface WizardNavigationProps {
  steps: Step[];
  currentStep: number;
}

export function WizardNavigation({
  steps,
  currentStep,
}: WizardNavigationProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Progress bar background */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
          <div
            className="h-full bg-primary transition-all duration-500 ease-in-out"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isPending = currentStep < step.id;

          return (
            <div key={step.id} className="flex flex-col items-center relative">
              {/* Step circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${
                  isCompleted
                    ? "bg-primary border-primary text-white"
                    : isCurrent
                    ? "bg-white border-primary text-primary shadow-lg scale-110"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-semibold">{step.id}</span>
                )}
              </div>

              {/* Step label */}
              <div className="mt-3 text-center max-w-[120px]">
                <p
                  className={`text-sm font-medium transition-colors ${
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                      ? "text-gray-700"
                      : "text-gray-400"
                  }`}
                >
                  {step.title}
                </p>
                <p
                  className={`text-xs mt-1 transition-colors ${
                    isCurrent || isCompleted ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
