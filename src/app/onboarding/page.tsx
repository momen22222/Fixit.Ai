import Link from "next/link";

const onboardingSteps = [
  {
    step: "01",
    title: "Life stage",
    detail: "Choose puberty, cycle support, fertility, pregnancy, postpartum, or perimenopause."
  },
  {
    step: "02",
    title: "Goals",
    detail: "Set outcomes like better energy, symptom support, weight training, recovery, or meal consistency."
  },
  {
    step: "03",
    title: "Signals",
    detail: "Tell the app about sleep, symptoms, cravings, cycle changes, stress, and available time."
  },
  {
    step: "04",
    title: "Preferences",
    detail: "Add workout comfort, food style, restrictions, and how hands-on you want the AI coach to be."
  }
];

const lifeStages = ["Puberty", "Cycle support", "Fertility", "Pregnancy", "Postpartum", "Perimenopause"];
const goals = ["More energy", "Balanced meals", "Strength training", "Hormone support", "Recovery", "Better sleep"];

export default function OnboardingPage() {
  return (
    <main className="flow-page">
      <section className="flow-hero">
        <div className="flow-copy">
          <p className="eyebrow">Onboarding</p>
          <h1>Build a plan that feels like it was made for one woman, not every woman.</h1>
          <p className="lede">
            The first experience should gather life-stage context, symptoms, goals, and lifestyle limits so the app
            can personalize food, movement, and coaching from day one.
          </p>
          <div className="hero-actions">
            <Link className="primary-action" href="/app/dashboard">
              Continue to dashboard
            </Link>
            <Link className="secondary-action" href="/">
              Back to home
            </Link>
          </div>
        </div>

        <div className="onboarding-panel">
          <div className="mock-form-header">
            <span>Intake preview</span>
            <span>4 short steps</span>
          </div>

          <div className="input-stack">
            <div className="input-group">
              <label>What life stage best fits right now?</label>
              <div className="chip-grid">
                {lifeStages.map((stage) => (
                  <button className={stage === "Postpartum" ? "chip active" : "chip"} key={stage} type="button">
                    {stage}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label>What do you want the app to help with first?</label>
              <div className="chip-grid">
                {goals.map((goal) => (
                  <button className={goal === "Recovery" ? "chip active" : "chip"} key={goal} type="button">
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label>How much time do you realistically have for movement most days?</label>
              <div className="range-row">
                <span>10 min</span>
                <div className="range-track">
                  <div className="range-fill" />
                </div>
                <span>45 min</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="step-section">
        <div className="section-heading">
          <p className="eyebrow">Flow design</p>
          <h2>Short, focused onboarding that earns the right to personalize.</h2>
        </div>

        <div className="step-list">
          {onboardingSteps.map((item) => (
            <article className="step-card" key={item.step}>
              <span>{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
