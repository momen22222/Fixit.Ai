"use client";

import Link from "next/link";
import { useState } from "react";

const steps = [
  {
    id: "role",
    title: "Who are we inviting into the workflow?",
    detail: "Version 1 uses manager-created access so every tenant is tied to a known property and unit.",
    options: ["Tenant user", "Property manager", "Vendor coordinator"]
  },
  {
    id: "property",
    title: "What property should this access belong to?",
    detail: "Keep access scoped to one property at launch to reduce cross-property mistakes.",
    options: ["Maple Court Homes", "Add another property later"]
  },
  {
    id: "comms",
    title: "How should updates reach them?",
    detail: "In-app is the source of truth, but SMS or email improves response rates for approvals and appointments.",
    options: ["In-app + SMS/email", "In-app only"]
  }
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({
    role: "Tenant user",
    property: "Maple Court Homes",
    comms: "In-app + SMS/email"
  });

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <main className="flow-shell">
      <section className="hero-panel-large">
        <div className="hero-copy">
          <p className="eyebrow">Invite-first onboarding</p>
          <h1>Bring tenants and managers into the right property context before the first maintenance request.</h1>
          <p className="lede">
            This setup flow keeps units, communication preferences, and approval responsibilities clear before the app
            starts dispatching work.
          </p>
          <div className="action-row">
            <button
              className="button button-primary"
              onClick={() => setCurrentStep((index) => Math.min(index + 1, steps.length - 1))}
              type="button"
            >
              {isLastStep ? "Review invite setup" : "Continue"}
            </button>
            <Link className="button button-secondary" href="/">
              Back to overview
            </Link>
          </div>
        </div>

        <section className="surface surface-strong">
          <div className="panel-head">
            <span>
              Step {currentStep + 1} of {steps.length}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="section-copy">
            <h2>{step.title}</h2>
            <p>{step.detail}</p>
          </div>
          <div className="chip-row">
            {step.options.map((option) => (
              <button
                className={answers[step.id] === option ? "chip is-active" : "chip"}
                key={option}
                onClick={() => setAnswers((current) => ({ ...current, [step.id]: option }))}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
          <div className="action-row">
            <button
              className="button button-secondary"
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((index) => Math.max(index - 1, 0))}
              type="button"
            >
              Back
            </button>
            {isLastStep ? (
              <Link className="button button-primary" href="/app/dashboard">
                Finish setup
              </Link>
            ) : (
              <button
                className="button button-primary"
                onClick={() => setCurrentStep((index) => Math.min(index + 1, steps.length - 1))}
                type="button"
              >
                Next
              </button>
            )}
          </div>
        </section>
      </section>

      <section className="triple-grid">
        {steps.map((item) => (
          <article className="surface" key={item.id}>
            <p className="section-tag">{item.title}</p>
            <h2>{answers[item.id]}</h2>
            <p>{item.detail}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
