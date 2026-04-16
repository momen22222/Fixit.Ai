const nutritionCards = [
  {
    title: "Recovery breakfast",
    text: "Greek yogurt, berries, chia, and eggs to front-load protein and reduce energy swings."
  },
  {
    title: "Simple lunch",
    text: "Salmon grain bowl with greens and iron-supportive ingredients that are easy to prep ahead."
  },
  {
    title: "Snack strategy",
    text: "AI suggests a protein + fiber snack before the late-afternoon energy dip."
  }
];

export default function NutritionPage() {
  return (
    <section className="page-stack">
      <div className="page-heading">
        <p className="eyebrow">Nutrition</p>
        <h1>Food guidance that matches symptoms, goals, and real schedules</h1>
        <p>
          This section can become meal plans, grocery lists, hydration support, and symptom-aware food guidance for
          each life stage.
        </p>
      </div>

      <div className="summary-grid">
        {nutritionCards.map((item) => (
          <article className="info-panel" key={item.title}>
            <span>Recommended</span>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </div>

      <section className="content-panel">
        <div className="panel-heading">
          <span>What this page should evolve into</span>
          <p>Clear, useful tools instead of generic wellness content.</p>
        </div>
        <div className="feature-checklist">
          <p>Protein targets by goal and life stage</p>
          <p>Cycle-aware and postpartum-friendly meal suggestions</p>
          <p>Micronutrient education with plain-language explanations</p>
          <p>AI meal rewrites when time, budget, or symptoms change</p>
        </div>
      </section>
    </section>
  );
}
