export default function ManagerTenantsPage() {
  return (
    <section className="manager-screen">
      <div className="manager-hero">
        <div>
          <p className="eyebrow">Tenants</p>
          <h1>Invite-only access.</h1>
          <p>
            The next production step is a manager invite form that creates the Supabase auth invite and stores the
            tenant role, property, and unit in app_users.
          </p>
        </div>
      </div>

      <section className="manager-panel">
        <p className="section-tag">Coming next</p>
        <h2>Tenant invite workflow</h2>
        <p>
          Managers will enter a tenant email, choose a property/unit, and the app will send a magic link that lands the
          tenant directly in their maintenance app.
        </p>
      </section>
    </section>
  );
}
