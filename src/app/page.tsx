import { MagicLinkSignIn } from "@/components/MagicLinkSignIn";

export default function Home() {
  return (
    <main className="mobile-landing">
      <section className="mobile-phone-shell">
        <div className="mobile-phone-frame">
          <div className="mobile-status-bar">
            <span>9:41</span>
            <span>Tenant app</span>
          </div>

          <div className="tenant-entry-hero">
            <div className="tenant-entry-badge">Fix it AI</div>
            <div className="mobile-welcome-card">
              <p className="mobile-label">Property maintenance</p>
              <h1>Log in to Fix it AI.</h1>
              <p>Tenants report issues with a photo. Property managers approve the work before anything is booked.</p>
            </div>
          </div>

          <MagicLinkSignIn />
        </div>
      </section>
    </main>
  );
}
