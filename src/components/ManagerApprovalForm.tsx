"use client";

import { useState } from "react";
import { type ManagerDecisionInput, type MaintenanceIssue } from "@/lib/maintenance-types";

type ManagerApprovalFormProps = {
  issue: MaintenanceIssue;
};

export function ManagerApprovalForm({ issue }: ManagerApprovalFormProps) {
  const defaultVendor = issue.vendorRecommendations[0];
  const [form, setForm] = useState<ManagerDecisionInput>({
    issueId: issue.id,
    decision: "approved",
    approvedVendorId: defaultVendor?.vendorId ?? "",
    approvedWindow: defaultVendor?.proposedWindow ?? "",
    notes: "Approved after AI summary review."
  });
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/manager/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const payload = (await response.json()) as {
        issue?: { status: string };
        workOrder?: { scheduledWindow: string };
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save manager decision.");
      }

      setResult(
        `Manager decision recorded. Issue is now ${payload.issue?.status ?? "updated"} and the work order is scheduled for ${payload.workOrder?.scheduledWindow ?? form.approvedWindow}.`
      );
    } catch (approvalError) {
      setError(approvalError instanceof Error ? approvalError.message : "Unable to save manager decision.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <label className="field">
        <span>Decision</span>
        <select
          value={form.decision}
          onChange={(event) => {
            setForm({
              ...form,
              decision: event.target.value as ManagerDecisionInput["decision"]
            });
          }}
        >
          <option value="approved">Approve and book</option>
          <option value="modified">Approve with edits</option>
          <option value="rejected">Reject for now</option>
        </select>
      </label>

      <label className="field">
        <span>Approved vendor</span>
        <select
          value={form.approvedVendorId}
          onChange={(event) => {
            const selected = issue.vendorRecommendations.find((vendor) => vendor.vendorId === event.target.value);
            setForm({
              ...form,
              approvedVendorId: event.target.value,
              approvedWindow: selected?.proposedWindow ?? form.approvedWindow
            });
          }}
        >
          {issue.vendorRecommendations.map((vendor) => (
            <option key={vendor.vendorId} value={vendor.vendorId}>
              {vendor.vendorId} - {vendor.reliabilityScore} reliability - ${vendor.estimatedCost}
            </option>
          ))}
        </select>
      </label>

      <label className="field field-full">
        <span>Appointment window</span>
        <input
          type="text"
          value={form.approvedWindow}
          onChange={(event) => {
            setForm({ ...form, approvedWindow: event.target.value });
          }}
        />
      </label>

      <label className="field field-full">
        <span>Manager notes</span>
        <textarea
          rows={4}
          value={form.notes}
          onChange={(event) => {
            setForm({ ...form, notes: event.target.value });
          }}
        />
      </label>

      {result ? <p className="success-note">{result}</p> : null}
      {error ? <p className="error-note">{error}</p> : null}

      <div className="action-row">
        <button className="button button-primary" disabled={loading} type="submit">
          {loading ? "Saving..." : "Confirm manager decision"}
        </button>
      </div>
    </form>
  );
}
