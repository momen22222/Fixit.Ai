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
        ? "This looks urgent. AI will skip troubleshooting and notify the manager right away."
        : urgency === "priority"
          ? "This may need quick attention. AI will check safe next steps and prepare the handoff."
          : "AI can start with safe first checks before anyone gets scheduled."
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
    <div className="tenant-flow-layout">
      <section className="tenant-capture-card">
        <form className="tenant-capture-form" onSubmit={handleSubmit}>
          <label className="tenant-camera-card">
            <div className="tenant-camera-icon" />
            <strong>Tap to add a photo</strong>
            <p>The photo should be the main thing the tenant notices first.</p>
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
            <span>{form.photos.length ? `${form.photos.length} photo(s) selected` : "No photo added yet"}</span>
          </label>

          <label className="tenant-input-block">
            <span>What is going on?</span>
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

          <label className="tenant-input-block">
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

          <div className="tenant-mini-grid">
            <label className="tenant-input-block">
              <span>Unit</span>
              <select
                value={form.unitId}
                onChange={(event) => {
                  setForm({ ...form, unitId: event.target.value });
                }}
              >
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="tenant-input-block">
              <span>Availability</span>
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
          </div>

          <label className="tenant-check-row">
            <input
              checked={form.permissionToEnter}
              type="checkbox"
              onChange={(event) => {
                setForm({ ...form, permissionToEnter: event.target.checked });
              }}
            />
            <span>Allow management or a vendor to enter if I am away.</span>
          </label>

          {preflight ? <p className="tenant-preflight">{preflight}</p> : null}
          {error ? <p className="error-note">{error}</p> : null}

          <div className="tenant-submit-row">
            <button className="mobile-primary-action" disabled={loading || !form.description.trim()} type="submit">
              {loading ? "Sending..." : "Send to AI"}
            </button>
          </div>
        </form>
      </section>

      <section className="tenant-ai-card">
        <div className="tenant-ai-header">
          <p className="mobile-label">AI update</p>
          <h2>{issue ? "Here is what happens next" : "After you send it"}</h2>
        </div>

        {issue ? (
          <div className="tenant-ai-result">
            <div className="assistant-pills">
              <span className={`status-pill is-${issue.urgencyLevel}`}>{issue.urgencyLevel}</span>
              <span className={`status-pill is-${issue.status}`}>{issue.status}</span>
            </div>

            <div className="tenant-ai-message">
              <strong>AI summary</strong>
              <p>{issue.aiTriage.managerSummary}</p>
            </div>

            <div className="tenant-ai-message">
              <strong>Next prompt</strong>
              {issue.aiTriage.followUpQuestions.length ? (
                <p>{issue.aiTriage.followUpQuestions[0]}</p>
              ) : (
                <p>The issue was escalated immediately because it may be urgent.</p>
              )}
            </div>

            <div className="tenant-ai-message">
              <strong>What the tenant needs to know</strong>
              <ul className="assistant-list">
                {issue.aiTriage.safetyInstructions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="tenant-submit-row">
              <Link className="mobile-primary-action" href={`/app/issues/${issue.id}`}>
                View request status
              </Link>
            </div>
          </div>
        ) : (
          <div className="tenant-ai-placeholder">
            <div className="tenant-ai-message">
              <strong>Simple tenant experience</strong>
              <p>Take a picture, type one sentence, then wait for AI to guide you.</p>
            </div>
            <div className="tenant-ai-message">
              <strong>Behind the scenes</strong>
              <p>
                The app checks urgency, offers safe help when appropriate, and prepares the manager handoff if needed.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
