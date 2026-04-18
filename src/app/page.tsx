import Link from "next/link";

const tenantPromises = [
  "Take a photo and describe the problem in one sentence.",
  "AI checks whether it is safe to try a quick fix.",
  "If not, the app prepares the manager summary and vendor plan."
];

const productNotes = [
  {
    title: "What tenants actually want",
    text: "A calm screen, one clear button, and no maintenance jargon."
  },
  {
    title: "What managers actually need",
    text: "A clean summary, photo evidence, urgency level, and the best next action."
  },
  {
    title: "What makes this applicable",
    text: "Invite-only access, mobile camera capture, AI safety guardrails, and reliable vendor handoff."
  }
];

export default function Home() {
  return (
    <main className="landing-shell">
      <section className="landing-hero">
        <div className="landing-copy">
          <p className="landing-kicker">Fix it AI</p>
          <h1>Tenants snap a photo. AI handles the next step.</h1>
          <p className="landing-lede">
            A simple maintenance app for renters: sign in, take a picture, explain what is broken, and let AI decide
            whether it can be safely solved or needs a manager-approved contractor.
          </p>

          <div className="landing-actions">
            <Link className="landing-primary" href="/app/issues/new">
              Start a maintenance request
            </Link>
            <Link className="landing-secondary" href="/app/manager/approvals">
              Open manager workspace
            </Link>
          </div>

          <div className="promise-list">
            {tenantPromises.map((item) => (
              <div className="promise-row" key={item}>
                <span className="promise-dot" />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="phone-stage" aria-hidden="true">
          <div className="phone-frame">
            <div className="phone-topline">
              <span>Tenant login</span>
              <span>Unit 3C</span>
            </div>

            <div className="phone-hero">
              <p className="phone-eyebrow">New request</p>
              <h2>Show us what needs attention.</h2>
              <p>Take one picture, add one sentence, and the AI will sort the rest.</p>
            </div>

            <div className="camera-panel">
              <div className="camera-preview">
                <div className="camera-glow" />
                <span>Tap to open camera</span>
              </div>
              <div className="camera-actions">
                <div>
                  <strong>Photo-first triage</strong>
                  <p>Built for phones, not forms.</p>
                </div>
                <button type="button">Capture</button>
              </div>
            </div>

            <div className="ai-mini-flow">
              <div className="ai-mini-step">
                <span>AI review</span>
                <p>Dishwasher likely blocked. Safe checks available.</p>
              </div>
              <div className="ai-mini-step">
                <span>If unresolved</span>
                <p>Manager summary and contractor option prepared automatically.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="notes-band">
        {productNotes.map((note) => (
          <article className="note-block" key={note.title}>
            <p className="note-label">{note.title}</p>
            <p>{note.text}</p>
          </article>
        ))}
      </section>

      <section className="workflow-band">
        <div className="workflow-copy">
          <p className="landing-kicker">Why this should feel different</p>
          <h2>The first version should behave like a concierge, not a dashboard.</h2>
          <p>
            Most tenants should never have to think about vendors, rates, or scheduling logic. They should only need
            to log in, report the problem, and follow the AI&apos;s next prompt.
          </p>
        </div>

        <div className="workflow-list">
          <div className="workflow-item">
            <span>01</span>
            <div>
              <h3>Tenant signs in</h3>
              <p>Access is tied to their property and unit automatically.</p>
            </div>
          </div>
          <div className="workflow-item">
            <span>02</span>
            <div>
              <h3>Tenant takes a picture</h3>
              <p>The camera is the primary input, with a short text follow-up.</p>
            </div>
          </div>
          <div className="workflow-item">
            <span>03</span>
            <div>
              <h3>AI triages and guides</h3>
              <p>Only safe DIY checks are offered. Urgent issues bypass self-help.</p>
            </div>
          </div>
          <div className="workflow-item">
            <span>04</span>
            <div>
              <h3>Manager approves the handoff</h3>
              <p>The app packages the summary and best vendor recommendation automatically.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
