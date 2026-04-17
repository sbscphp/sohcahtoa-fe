"use client";

interface Step {
  label: string;
  value: string;
}

interface CustomStepperProps {
  steps: Step[];
  activeStep: number;
  className?: string;
}

export default function CustomStepper({ steps, activeStep, className = "" }: CustomStepperProps) {
  return (
    <div className={`custom-stepper ${className}`}>
      {steps.map((step, index) => {
        const isActive = index === activeStep;
        const isCompleted = index < activeStep;
        const hasLineLeft = index > 0;
        const hasLineRight = index < steps.length - 1;
        const leftLineCompleted = index > 0 && index - 1 < activeStep;
        const rightLineCompleted = index < activeStep;

        return (
          <div key={step.value} className="custom-stepper-step">
            <div className="custom-stepper-row">
              <div className="custom-stepper-line-col">
                {hasLineLeft && (
                  <div
                    className={`custom-stepper-progress-line ${
                      leftLineCompleted ? "custom-stepper-progress-active" : "custom-stepper-progress-inactive"
                    }`}
                  />
                )}
              </div>
              <div className="custom-stepper-indicator-col">
                <div
                  className={`custom-stepper-indicator ${
                    isActive || isCompleted
                      ? "custom-stepper-indicator-active"
                      : "custom-stepper-indicator-inactive"
                  }`}
                />
              </div>
              <div className="custom-stepper-line-col">
                {hasLineRight && (
                  <div
                    className={`custom-stepper-progress-line ${
                      rightLineCompleted ? "custom-stepper-progress-active" : "custom-stepper-progress-inactive"
                    }`}
                  />
                )}
              </div>
            </div>
            <div className="custom-stepper-placeholder">
              <span
                className={`custom-stepper-label ${
                  isActive || isCompleted ? "custom-stepper-label-active" : "custom-stepper-label-inactive"
                }`}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
