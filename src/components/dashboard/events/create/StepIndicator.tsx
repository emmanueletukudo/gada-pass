'use client';

interface StepIndicatorProps {
  currentStep: number;
  stepLabels: string[];
}

export function StepIndicator({ currentStep, stepLabels }: StepIndicatorProps) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-start gap-y-3 rounded-2xl border border-white bg-[#d6f94a] px-6 py-4 text-xs font-bold text-white">
      {stepLabels.map((label, idx) => {
        const stepNum = idx + 1;
        const isCompleted = currentStep > stepNum;
        const isActive = currentStep === stepNum;

        return (
          <div key={label} className="flex items-center gap-3">
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full border text-[12px] ${
                isCompleted
                  ? 'border-white bg-white text-[#ff765f]'
                  : isActive
                    ? 'border-black bg-black text-white'
                    : 'border-black text-black'
              }`}
            >
              {isCompleted ? '✓' : stepNum}
            </div>
            <span
              className={
                isActive
                  ? 'text-black'
                  : isCompleted
                    ? 'text-black/60'
                    : 'text-black'
              }
            >
              {label}
            </span>
            {idx < stepLabels.length - 1 && (
              <span className="mx-4 text-black">➔</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
