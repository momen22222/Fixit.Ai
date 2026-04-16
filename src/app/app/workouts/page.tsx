const workouts = [
  {
    name: "Deep core reset",
    duration: "12 min",
    reason: "Supports postpartum stability and confidence before intensity."
  },
  {
    name: "Strength express",
    duration: "22 min",
    reason: "Keeps strength progress moving with minimal setup."
  },
  {
    name: "Recovery walk",
    duration: "20 min",
    reason: "Improves mood, circulation, and consistency on lower-energy days."
  }
];

export default function WorkoutsPage() {
  return (
    <section className="page-stack">
      <div className="page-heading">
        <p className="eyebrow">Workouts</p>
        <h1>Movement plans that respond to energy, recovery, and life stage</h1>
        <p>
          The app should recommend what helps most today, whether that is strength, walking, pelvic floor recovery, or
          a full training session.
        </p>
      </div>

      <div className="workout-list">
        {workouts.map((workout) => (
          <article className="content-panel" key={workout.name}>
            <div className="workout-topline">
              <span>{workout.name}</span>
              <strong>{workout.duration}</strong>
            </div>
            <p>{workout.reason}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
