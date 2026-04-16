const tasks = [
  "Protein-forward breakfast before coffee",
  "12-minute recovery strength block",
  "Hydration check before 2 pm",
  "Evening wind-down for sleep recovery"
];

const highlights = [
  {
    label: "Energy",
    value: "Lower today",
    note: "Sleep and recovery are shaping a gentler plan."
  },
  {
    label: "Nutrition focus",
    value: "Protein + iron",
    note: "Simple meals with fewer decisions and better recovery support."
  },
  {
    label: "Movement",
    value: "20 minutes",
    note: "Walk plus deep core reset instead of a full training day."
  }
];

export default function DashboardPage() {
  return (
    <section className="page-stack">
      <div className="page-heading">
        <p className="eyebrow">Today</p>
        <h1>Maya’s personalized dashboard</h1>
        <p>
          A daily snapshot that adapts to recovery, life stage, symptoms, and available time instead of forcing a
          generic plan.
        </p>
        <p className="eyebrow">Deployment test: GitHub to Vercel is connected.</p>
      </div>

      <div className="summary-grid">
        {highlights.map((item) => (
          <article className="info-panel" key={item.label}>
            <span>{item.label}</span>
            <h2>{item.value}</h2>
            <p>{item.note}</p>
          </article>
        ))}
      </div>

      <div className="detail-grid">
        <section className="content-panel">
          <div className="panel-heading">
            <span>Today’s plan</span>
            <p>Built around postpartum recovery and short windows of time.</p>
          </div>
          <div className="stack-list">
            {tasks.map((task) => (
              <div className="stack-row" key={task}>
                <span className="plan-dot" />
                <p>{task}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="content-panel accent-panel">
          <div className="panel-heading">
            <span>AI suggestion</span>
            <p>What should change if energy keeps dropping?</p>
          </div>
          <blockquote className="coach-quote">
            “Shift dinner to something easier, skip intensity, and preserve the recovery walk. Today is about support,
            not pressure.”
          </blockquote>
        </section>
      </div>
    </section>
  );
}
