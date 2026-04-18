"use client";

import Link from "next/link";
import { useState } from "react";
import { units } from "@/lib/maintenance-data";
import { type MaintenanceIssue, type MaintenanceIssueInput } from "@/lib/maintenance-types";

const categories = [
  "Hot water heater issue",
  "Dishwasher not working",
  "Leaking pipe or fixture",
  "No heat or thermostat issue",
  "Outlet or breaker problem",
  "Other maintenance issue"
];

const availabilityOptions = [
  "Today after 1 PM",
  "Weekdays after 3 PM",
  "Mornings only",
  "Any time with notice"
];

export function TenantIssueIntake() {
  const [form, setForm] = useState<MaintenanceIssueInput>({
    unitId: units[1]?.id ?? units[0].id,
    category: categories[0],
    description: "",
    photos: [],
    tenantAvailability: availabilityOptions[1],
    permissionToEnter: true
  });
  const [preflight, setPreflight] = useState<string | null>(null);
  const [issue, setIssue] = useState<MaintenanceIssue | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runPreflight(nextForm: MaintenanceIssueInput) {
    const response = await fetch("/api/triage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextForm)
    });

    const payload = (await response.json()) as { triage?: { urgencyLevel: string } };
    const urgency = payload.triage?.urgencyLevel ?? "routine";

    setPreflight(
      urgency === "emergency"
        ? "This looks urgent. The app will skip DIY help, show safety instructions, and alert the manager."
        : urgency === "priority"
          ? "This may need fast review. AI will check for safe first steps, then prepare a manager summary."
          : "The AI can likely start with a few safe checks before anyone is scheduled."
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const payload = (await response.json()) as { issue?: MaintenanceIssue; error?: string };

      if (!response.ok || !payload.issue) {
        throw new Error(payload.error ?? "Unable to create maintenance issue.");
      }

      setIssue(payload.issue);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to create issue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tenant-intake-shell">
      <section className="intake-panel">
        <div className="intake-header">
          <div>
            <p className="intake-label">Step 1</p>
            <h2>Start with the photo</h2>
          </div>
          <p className="intake-help">Tenants should be able to finish this in under a minute.</p>
        </div>

        <form className="tenant-form" onSubmit={handleSubmit}>
          <div className="camera-dropzone">
            <div className="camera-icon" />
            <strong>Add a photo or open the camera</strong>
            <p>Show the broken appliance, leak, damage, or display panel.</p>
            <input
              accept="image/*"
              capture="environment"
              type="file"
              multiple
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                setForm({
                  ...form,
                  photos: files.length ? files.map((file) => file.name) : []
                });
              }}
            />
            <span>{form.photos.length ? `${form.photos.length} photo(s) selected` : "No photo selected yet"}</span>
          </div>

          <label className="tenant-field tenant-field-wide">
            <span>What do you need help with?</span>
            <textarea
              rows={4}
              value={form.description}
              onChange={async (event) => {
                const nextForm = { ...form, description: event.target.value };
                setForm(nextForm);
                if (event.target.value.trim().length > 20) {
                  await runPreflight(nextForm);
                }
              }}
              placeholder="Example: The dishwasher finishes but leaves standing water in the bottom."
            />
          </label>

          <div className="tenant-grid">
            <label className="tenant-field">
              <span>Issue type</span>
              <select
                value={form.category}
                onChange={async (event) => {
                  const nextForm = { ...form, category: event.target.value };
                  setForm(nextForm);
                  if (nextForm.description.trim()) {
                    await runPreflight(nextForm);
                  }
                }}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="tenant-field">
              <span>Unit</span>
              <select
                value={form.unitId}
                onChange={(event) => {
                  setForm({ ...form, unitId: event.target.value });
                }}
              >
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.label} - Maple Court Homes
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="tenant-grid">
            <label className="tenant-field">
              <span>When can someone come by?</span>
              <select
                value={form.tenantAvailability}
                onChange={(event) => {
                  setForm({ ...form, tenantAvailability: event.target.value });
                }}
              >
                {availabilityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="tenant-toggle">
              <input
                checked={form.permissionToEnter}
                type="checkbox"
                onChange={(event) => {
                  setForm({ ...form, permissionToEnter: event.target.checked });
                }}
              />
              <div>
                <strong>Permission to enter</strong>
                <p>Allow management or a vendor to enter if you are away.</p>
              </div>
            </label>
          </div>

          {preflight ? <p className="preflight-banner">{preflight}</p> : null}
          {error ? <p className="error-note">{error}</p> : null}

          <div className="tenant-actions">
            <button className="landing-primary" disabled={loading || !form.description.trim()} type="submit">
              {loading ? "Sending to AI..." : "Send to AI"}
            </button>
            <Link className="landing-secondary" href="/app/dashboard">
              View dashboard
            </Link>
          </div>
        </form>
      </section>

      <section className="assistant-panel">
        <div className="assistant-header">
          <p className="intake-label">Step 2</p>
          <h2>AI handles the next move</h2>
          <p>The tenant should see a simple answer, not the full back-office workflow.</p>
        </div>

        {issue ? (
          <div className="assistant-result">
            <div className="assistant-pills">
              <span className={`status-pill is-${issue.urgencyLevel}`}>{issue.urgencyLevel}</span>
              <span className={`status-pill is-${issue.status}`}>{issue.status}</span>
            </div>

            <div className="assistant-block">
              <h3>What the tenant sees</h3>
              <ul className="assistant-list">
                {issue.aiTriage.safetyInstructions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="assistant-block">
              <h3>AI follow-up</h3>
              <div className="assistant-chat">
                <div className="assistant-bubble tenant">{issue.description}</div>
                {issue.aiTriage.followUpQuestions.map((item) => (
                  <div className="assistant-bubble ai" key={item}>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="assistant-block">
              <h3>Behind the scenes</h3>
              <p>{issue.aiTriage.managerSummary}</p>
              {issue.vendorRecommendations.length ? (
                <p>
                  If the tenant cannot fix it, the app proposes{" "}
                  <strong>{issue.vendorRecommendations[0]?.proposedWindow}</strong> and sends the request to manager
                  approval.
                </p>
              ) : (
                <p>The issue appears resolved without creating a work order.</p>
              )}
            </div>

            <div className="tenant-actions">
              <Link className="landing-primary" href={`/app/issues/${issue.id}`}>
                Open tenant status
              </Link>
              {issue.vendorRecommendations.length ? (
                <Link className="landing-secondary" href={`/app/manager/issues/${issue.id}`}>
                  Open manager review
                </Link>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="assistant-placeholder">
            <div className="assistant-bubble ai">
              Upload the photo and a short note first. The AI will decide whether to offer a safe fix or escalate it.
            </div>
            <div className="assistant-mini-card">
              <strong>To make this app more applicable:</strong>
              <ul className="assistant-list">
                <li>Tenant login must auto-attach the right property and unit.</li>
                <li>The camera has to feel like the main action, not a hidden field.</li>
                <li>AI should summarize the problem in plain language immediately.</li>
              </ul>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
