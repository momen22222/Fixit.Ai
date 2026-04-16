"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type StepKey = "lifeStage" | "goal" | "energy" | "coachStyle";

type StepDefinition = {
  key: StepKey;
  step: string;
  title: string;
  detail: string;
  options: string[];
};

const steps: StepDefinition[] = [
  {
    key: "lifeStage",
    step: "01",
    title: "What life stage best fits right now?",
    detail: "This changes what support matters most, from puberty to postpartum to perimenopause.",
    options: ["Puberty", "Cycle support", "Fertility", "Pregnancy", "Postpartum", "Perimenopause"]
  },
  {
    key: "goal",
    step: "02",
    title: "What do you want help with first?",
    detail: "We’ll prioritize the first outcome so the app feels useful right away.",
    options: ["More energy", "Balanced meals", "Strength training", "Hormone support", "Recovery", "Better sleep"]
  },
  {
    key: "energy",
    step: "03",
    title: "How much time do you have for movement most days?",
    detail: "Short windows are normal. We’ll build around what’s realistic.",
    options: ["10 minutes", "20 minutes", "30 minutes", "45+ minutes"]
  },
  {
    key: "coachStyle",
    step: "04",
    title: "How do you want the AI coach to show up?",
    detail: "Pick the tone that feels motivating instead of overwhelming.",
    options: ["Gentle nudges", "Practical planner", "Data-aware coach", "Deep education"]
  }
];

type Answers = Partial<Record<StepKey, string>>;

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    lifeStage: "Postpartum",
    goal: "Recovery"
  });

  const step = steps[currentStep];
  const selectedAnswer = answers[step.key];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;

  const summary = useMemo(
    () => [
      { label: "Life stage", value: answers.lifeStage ?? "Choose one" },
      { label: "Primary goal", value: answers.goal ?? "Choose one" },
      { label: "Movement time", value: answers.energy ?? "Choose one" },
      { label: "Coach style", value: answers.coachStyle ?? "Choose one" }
    ],
    [answers]
  );

  const selectOption = (option: string) => {
    setAnswers((current) => ({
      ...current,
      [step.key]: option
    }));
  };

  const goNext = () => {
    if (!selectedAnswer) {
      return;
    }

    setCurrentStep((index) => Math.min(index + 1, steps.length - 1));
  };

  const goBack = () => {
    setCurrentStep((index) => Math.max(index - 1, 0));
  };

  return (
    <main className="flow-page">
      <section className="flow-hero">
        <div className="flow-copy">
          <p className="eyebrow">Onboarding</p>
          <h1>Build a plan that feels like it was made for one woman, not every woman.</h1>
          <p className="lede">
            This flow now acts like a real first session: you choose your stage, your top goal, your available time,
            and the kind of support you want from the app.
          </p>
          <div className="hero-actions">
            <button className="primary-action" onClick={goNext} type="button">
              {isLastStep ? "Review plan" : "Continue"}
            </button>
            <Link className="secondary-action" href="/">
              Back to home
            </Link>
          </div>
        </div>

        <div className="onboarding-panel">
          <div className="mock-form-header">
            <span>
              Step {step.step} of {steps.length}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>

          <div className="progress-track" aria-hidden="true">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <div className="input-stack">
            <div className="input-group">
              <label>{step.title}</label>
              <p className="input-help">{step.detail}</p>
              <div className="chip-grid">
                {step.options.map((option) => (
                  <button
                    className={selectedAnswer === option ? "chip active" : "chip"}
                    key={option}
                    onClick={() => selectOption(option)}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="onboarding-actions">
            <button className="secondary-action" disabled={currentStep === 0} onClick={goBack} type="button">
              Back
            </button>
            {isLastStep ? (
              <Link className={`primary-action ${selectedAnswer ? "" : "is-disabled"}`} href="/app/dashboard">
                Finish and view dashboard
              </Link>
            ) : (
              <button className="primary-action" disabled={!selectedAnswer} onClick={goNext} type="button">
                Next question
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="step-section">
        <div className="section-heading">
          <p className="eyebrow">Your intake summary</p>
          <h2>Personalization should feel earned, visible, and easy to change later.</h2>
        </div>

        <div className="step-list">
          {summary.map((item, index) => (
            <article className="step-card" key={item.label}>
              <span>{`0${index + 1}`}</span>
              <h3>{item.label}</h3>
              <p>{item.value}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
