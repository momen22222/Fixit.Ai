import Link from "next/link";

const stageCards = [
  {
    eyebrow: "Nutrition",
    title: "Meals tuned to energy, cravings, and recovery",
    text: "Daily plans balance protein, hydration, iron support, and realistic meal timing for busy lives."
  },
  {
    eyebrow: "Movement",
    title: "Workouts that meet women where they are",
    text: "Low-impact recovery, strength blocks, walks, and cycle-aware training all live in one calm system."
  },
  {
    eyebrow: "Life stages",
    title: "Support from puberty to postpartum and beyond",
    text: "Guidance changes as bodies change, so the app never treats women's health like a generic fitness plan."
  }
];

const dailyPlan = [
  "Breakfast with protein, fiber, and hydration before caffeine",
  "Short recovery-strength session tailored to current energy",
  "Mood, symptom, and cycle-aware nutrition suggestions",
  "An AI coach that rewrites the plan when life gets messy"
];

const journeys = [
  "Puberty and body literacy",
  "Cycle support and hormone-aware routines",
  "Fertility and preconception wellness",
  "Pregnancy nourishment and movement",
  "Postpartum recovery and rebuilding strength",
  "Perimenopause and midlife metabolism support"
];

export default function Home() {
  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">HerHealth AI</p>
          <h1>{"Women's health, personalized by life stage, energy, and real life."}</h1>
          <p className="lede">
            A mobile-first wellness app for nutrition, workouts, recovery, and education across puberty, fertility,
            pregnancy, postpartum, and midlife.
          </p>
          <div className="hero-actions">
            <Link className="primary-action" href="/onboarding">
              Start onboarding
            </Link>
            <a className="secondary-action" href="#journeys">
              See life-stage support
            </a>
          </div>
          <div className="hero-metrics">
            <div>
              <strong>6</strong>
              <span>life-stage journeys</span>
            </div>
            <div>
              <strong>1</strong>
              <span>adaptive AI coach</span>
            </div>
            <div>
              <strong>Daily</strong>
              <span>food + movement planning</span>
            </div>
          </div>
        </div>

        <div className="hero-panel" id="dashboard">
          <div className="plan-topline">
            <span>Today for Maya</span>
            <span>Postpartum recovery</span>
          </div>

          <div className="plan-headline">
            <h2>Gentle structure for a low-sleep day</h2>
            <p>
              The AI coach shifts your plan toward protein-forward meals, a short walk, core recovery, and lower
              decision fatigue.
            </p>
          </div>

          <div className="plan-grid">
            {dailyPlan.map((item) => (
              <div className="plan-row" key={item}>
                <span className="plan-dot" />
                <p>{item}</p>
              </div>
            ))}
          </div>

          <div className="panel-actions">
            <Link className="text-link" href="/app/dashboard">
              View dashboard
            </Link>
            <Link className="text-link" href="/app/coach">
              Open AI coach
            </Link>
          </div>
        </div>
      </section>

      <section className="feature-band">
        {stageCards.map((card) => (
          <article className="feature-column" key={card.title}>
            <p className="feature-eyebrow">{card.eyebrow}</p>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </article>
        ))}
      </section>

      <section className="journeys" id="journeys">
        <div className="section-heading">
          <p className="eyebrow">Life-stage journeys</p>
          <h2>The app grows with women instead of asking them to adapt to generic wellness advice.</h2>
        </div>

        <div className="journey-list">
          {journeys.map((journey) => (
            <div className="journey-item" key={journey}>
              <span />
              <p>{journey}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="coach-section">
        <div className="section-heading">
          <p className="eyebrow">AI Coach</p>
          <h2>Personalization that feels practical, not robotic.</h2>
        </div>

        <div className="chat-shell">
          <div className="chat-bubble assistant">
            I noticed sleep was lower than usual and recovery is a priority. Want me to simplify meals and shorten the
            workout for today?
          </div>
          <div className="chat-bubble user">
            Yes, and keep it realistic. I only have short windows between everything else.
          </div>
          <div className="chat-bubble assistant">
            Done. I shifted today to three easy protein-forward meals, one stroller walk, and a 12-minute core reset.
          </div>
        </div>
      </section>
    </main>
  );
}
