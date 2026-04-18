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
        ? "Emergency bypass will trigger. The app will show safety steps and alert the manager immediately."
        : urgency === "priority"
          ? "This looks like a priority maintenance issue. The app will guide safe checks, then prepare a manager review."
          : "This looks like a routine issue. The AI will guide safe DIY checks before requesting a vendor."
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
    <div className="tenant-grid">
      <section className="surface surface-strong">
        <div className="section-copy">
          <p className="section-tag">Tenant intake</p>
          <h2>Report the issue from your phone and let AI do the first pass.</h2>
          <p>
            Upload photos, describe what is happening, and the app will separate emergency situations from simple
            fixes a tenant can try safely with common household tools.
          </p>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field">
            <span>Unit</span>
            <select
              value={form.unitId}
              onChange={(event) => {
                const nextForm = { ...form, unitId: event.target.value };
                setForm(nextForm);
              }}
            >
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.label} - Maple Court Homes
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Issue category</span>
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

          <label className="field field-full">
            <span>Describe what is happening</span>
            <textarea
              rows={5}
              value={form.description}
              onChange={async (event) => {
                const nextForm = { ...form, description: event.target.value };
                setForm(nextForm);
                if (event.target.value.trim().length > 20) {
                  await runPreflight(nextForm);
                }
              }}
              placeholder="Example: The dishwasher finishes but leaves standing water and makes a low humming sound."
            />
          </label>

          <label className="field">
            <span>When can a vendor come by?</span>
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

          <label className="field">
            <span>Photo upload</span>
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
          </label>

          <label className="checkbox-row field-full">
            <input
              checked={form.permissionToEnter}
              type="checkbox"
              onChange={(event) => {
                setForm({ ...form, permissionToEnter: event.target.checked });
              }}
            />
            <span>Vendor may enter with management if I am not home.</span>
          </label>

          {preflight ? <p className="inline-note">{preflight}</p> : null}
          {error ? <p className="error-note">{error}</p> : null}

          <div className="action-row">
            <button className="button button-primary" disabled={loading || !form.description.trim()} type="submit">
              {loading ? "Submitting..." : "Start AI triage"}
            </button>
            <Link className="button button-secondary" href="/app/dashboard">
              View live queue
            </Link>
          </div>
        </form>
      </section>

      <section className="surface">
        <div className="section-copy">
          <p className="section-tag">AI response</p>
          <h2>{issue ? "Triage result ready for review" : "Your result will appear here."}</h2>
          <p>
            The app always limits DIY guidance to safe actions. Emergency issues bypass troubleshooting and go straight
            to the manager queue.
          </p>
        </div>

        {issue ? (
          <div className="result-stack">
            <div className="pill-row">
              <span className={`status-pill is-${issue.urgencyLevel}`}>{issue.urgencyLevel}</span>
              <span className={`status-pill is-${issue.status}`}>{issue.status}</span>
            </div>

            <div className="result-block">
              <h3>Safety instructions</h3>
              <ul className="detail-list">
                {issue.aiTriage.safetyInstructions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="result-block">
              <h3>AI follow-up</h3>
              <div className="message-stack">
                <div className="message-bubble tenant">{issue.description}</div>
                {issue.aiTriage.followUpQuestions.map((item) => (
                  <div className="message-bubble assistant" key={item}>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="result-block">
              <h3>DIY steps</h3>
              {issue.aiTriage.diySteps.length ? (
                <ul className="detail-list">
                  {issue.aiTriage.diySteps.map((step) => (
                    <li key={step.id}>
                      <strong>{step.title}:</strong> {step.detail}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No DIY steps were offered because the issue needs manager review immediately.</p>
              )}
            </div>

            {issue.vendorRecommendations.length ? (
              <div className="result-block">
                <h3>Prepared for manager approval</h3>
                <p>{issue.aiTriage.managerSummary}</p>
                <p>
                  Proposed vendor: <strong>{issue.vendorRecommendations[0]?.vendorId}</strong> with a suggested window
                  of <strong>{issue.vendorRecommendations[0]?.proposedWindow}</strong>.
                </p>
              </div>
            ) : (
              <div className="result-block">
                <h3>Resolution status</h3>
                <p>The issue appears resolved through safe self-service and no vendor dispatch is queued.</p>
              </div>
            )}

            <div className="action-row">
              <Link className="button button-primary" href={`/app/issues/${issue.id}`}>
                Open tenant issue status
              </Link>
              {issue.vendorRecommendations.length ? (
                <Link className="button button-secondary" href={`/app/manager/issues/${issue.id}`}>
                  Open manager review
                </Link>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="placeholder-card">
            <p>Try a sample routine request like a dishwasher drain issue or a priority request like no hot water.</p>
          </div>
        )}
      </section>
    </div>
  );
}
