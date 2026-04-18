import Link from "next/link";

const issueTypes = ["Water leak", "No hot water", "Appliance issue", "No heat", "Electrical issue"];

export default function Home() {
  return (
    <main className="mobile-landing">
      <section className="mobile-phone-shell">
        <div className="mobile-phone-frame">
          <div className="mobile-status-bar">
            <span>9:41</span>
            <span>Fix it AI</span>
          </div>

          <div className="mobile-welcome-card">
            <p className="mobile-label">Tenant maintenance app</p>
            <h1>Need help at your apartment?</h1>
            <p>
              Sign in, take a picture of the issue, and let AI figure out whether it can guide you or send it to your
              property manager.
            </p>
          </div>

          <div className="mobile-login-card">
            <div>
              <strong>Maya Johnson</strong>
              <p>Maple Court Homes, Unit 3C</p>
            </div>
            <Link className="mobile-primary-action" href="/app/dashboard">
              Continue as tenant
            </Link>
          </div>

          <div className="mobile-preview-card">
            <div className="mobile-preview-top">
              <div>
                <p className="mobile-label">Start a request</p>
                <h2>Take a photo first</h2>
              </div>
              <Link className="mobile-chip-action" href="/app/issues/new">
                Open
              </Link>
            </div>

            <div className="mobile-camera-preview">
              <div className="mobile-camera-glow" />
              <span>Tap to open camera</span>
            </div>
          </div>

          <div className="mobile-type-strip">
            {issueTypes.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>

          <div className="mobile-explain-card">
            <div className="mobile-step">
              <span>1</span>
              <p>Take one picture of what is broken.</p>
            </div>
            <div className="mobile-step">
              <span>2</span>
              <p>Write one sentence about the problem.</p>
            </div>
            <div className="mobile-step">
              <span>3</span>
              <p>AI handles the next step and keeps you updated.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
