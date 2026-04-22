"use client";

import Link from "next/link";
import { useState } from "react";
import {
  type ExternalVendorCandidate,
  type MaintenanceIssue,
  type MaintenanceIssueInput,
  type VendorRecommendation
} from "@/lib/maintenance-types";

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

type TenantIssueIntakeProps = {
  defaultUnitId: string;
  propertyName: string;
  unitLabel: string;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyPostalCode: string;
};

const timeBlocks = ["Today afternoon", "Tomorrow morning", "Tomorrow afternoon", "Next weekday morning"];

function isExternalVendorCandidate(
  vendor: ExternalVendorCandidate | VendorRecommendation
): vendor is ExternalVendorCandidate {
  return "name" in vendor;
}

export function TenantIssueIntake({
  defaultUnitId,
  propertyName,
  unitLabel,
  propertyAddress,
  propertyCity,
  propertyState,
  propertyPostalCode
}: TenantIssueIntakeProps) {
  const [form, setForm] = useState<MaintenanceIssueInput>({
    unitId: defaultUnitId,
    category: categories[0],
    description: "",
    photos: [],
    tenantAvailability: availabilityOptions[1],
    permissionToEnter: true
  });
  const [preflight, setPreflight] = useState<string | null>(null);
  const [issue, setIssue] = useState<MaintenanceIssue | null>(null);
  const [vendorCandidates, setVendorCandidates] = useState<ExternalVendorCandidate[]>([]);
  const [vendorSearchStatus, setVendorSearchStatus] = useState<string | null>(null);
  const [selectedTimeBlock, setSelectedTimeBlock] = useState(timeBlocks[1]);
  const [approvalRequested, setApprovalRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  async function handlePhotoSelection(files: File[]) {
    if (!files.length) {
      setForm({ ...form, photos: [] });
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadedPaths = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/uploads/issue-photo", {
            method: "POST",
            body: formData
          });

          const payload = (await response.json()) as {
            upload?: { path: string };
            error?: string;
          };

          if (!response.ok || !payload.upload) {
            throw new Error(payload.error ?? `Unable to upload ${file.name}.`);
          }

          return payload.upload.path;
        })
      );

      setForm((current) => ({ ...current, photos: uploadedPaths }));
      setPreflight("Photo attached. Add one sentence and AI will check the safest next step.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload photos.");
    } finally {
      setUploading(false);
    }
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
      setApprovalRequested(false);

      if (payload.issue.aiTriage.resolutionStatus !== "resolved") {
        setVendorSearchStatus("Searching for vendor options with AI...");

        const vendorResponse = await fetch("/api/vendors/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            trade: payload.issue.aiTriage.recommendedTrade,
            issueSummary: payload.issue.aiTriage.managerSummary,
            propertyAddress,
            city: propertyCity || "Denver",
            state: propertyState || "CO",
            postalCode: propertyPostalCode || "80205"
          })
        });

        const vendorPayload = (await vendorResponse.json()) as {
          vendors?: ExternalVendorCandidate[];
          error?: string;
        };

        if (vendorResponse.ok) {
          setVendorCandidates(vendorPayload.vendors ?? []);
          setVendorSearchStatus(
            vendorPayload.vendors?.length
              ? "AI found vendor candidates for manager approval."
              : "No external vendors found yet. The manager will use the approved vendor list."
          );
        } else {
          setVendorCandidates([]);
          setVendorSearchStatus(vendorPayload.error ?? "Vendor search was not available. Manager will review manually.");
        }
      }
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to create issue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tenant-flow-layout">
      <section className="tenant-capture-card">
        <div className="tenant-request-summary">
          <div>
            <p className="mobile-label">Requesting service at</p>
            <strong>{propertyName}</strong>
            <p>{unitLabel} is attached automatically to this request.</p>
          </div>
        </div>

        <form className="tenant-capture-form" onSubmit={handleSubmit}>
          <label className="tenant-camera-card">
            <div className="tenant-camera-icon" />
            <strong>Tap to add a photo</strong>
            <p>Take one clear picture of the issue. AI uses the photo to guide the next step.</p>
            <input
              accept="image/*"
              capture="environment"
              type="file"
              multiple
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                void handlePhotoSelection(files);
              }}
            />
            <span>
              {uploading
                ? "Uploading photo..."
                : form.photos.length
                  ? `${form.photos.length} photo(s) attached`
                  : "No photo added yet"}
            </span>
          </label>

          <label className="tenant-input-block">
            <span>What is going on?</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={async (event) => {
                const nextForm = { ...form, description: event.target.value };
                setForm(nextForm);
                if (event.target.value.trim().length > 16) {
                  await runPreflight(nextForm);
                }
              }}
              placeholder="Example: There is water on the floor under the sink."
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
            <button
              className="mobile-primary-action"
              disabled={loading || uploading || !form.description.trim()}
              type="submit"
            >
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
              <strong>What AI thinks is happening</strong>
              <p>{issue.aiTriage.managerSummary}</p>
            </div>

            <div className="tenant-ai-message">
              <strong>Likely trade needed</strong>
              <p>{issue.aiTriage.recommendedTrade}</p>
            </div>

            <div className="tenant-ai-message">
              <strong>Safety notes</strong>
              <ul className="assistant-list">
                {issue.aiTriage.safetyInstructions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            {issue.aiTriage.diySteps.length ? (
              <div className="tenant-ai-message">
                <strong>Easy fix to try now</strong>
                <ul className="assistant-list">
                  {issue.aiTriage.diySteps.map((step) => (
                    <li key={step.id}>
                      {step.title}: {step.detail} Tools: {step.safeTools.join(", ")}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="tenant-ai-message">
                <strong>No tenant repair recommended</strong>
                <p>This looks like it should go straight to manager review instead of self-repair.</p>
              </div>
            )}

            {issue.aiTriage.resolutionStatus !== "resolved" ? (
              <div className="tenant-ai-message">
                <strong>Vendor options</strong>
                <p>{vendorSearchStatus ?? "Preparing vendor recommendation for manager review."}</p>
                <div className="tenant-vendor-options">
                  {((vendorCandidates.length ? vendorCandidates : issue.vendorRecommendations) as Array<
                    ExternalVendorCandidate | VendorRecommendation
                  >)
                    .slice(0, 3)
                    .map((vendor) => (
                    <article className="tenant-vendor-option" key={isExternalVendorCandidate(vendor) ? vendor.name : vendor.vendorId}>
                      <strong>{isExternalVendorCandidate(vendor) ? vendor.name : vendor.vendorId}</strong>
                      <p>
                        {isExternalVendorCandidate(vendor)
                          ? vendor.reason
                          : `${vendor.trade} vendor · ${vendor.reliabilityScore} reliability · ${vendor.proposedWindow}`}
                      </p>
                    </article>
                  ))}
                </div>
                <label className="tenant-input-block">
                  <span>Preferred maintenance time block</span>
                  <select value={selectedTimeBlock} onChange={(event) => setSelectedTimeBlock(event.target.value)}>
                    {timeBlocks.map((block) => (
                      <option key={block} value={block}>
                        {block}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="mobile-primary-action"
                  type="button"
                  onClick={() => {
                    setApprovalRequested(true);
                  }}
                >
                  Send to property manager for approval
                </button>
                {approvalRequested ? (
                  <p className="tenant-preflight">
                    Sent to the property manager with the AI conversation, vendor recommendation, and requested time
                    block: {selectedTimeBlock}.
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="tenant-submit-row">
              <Link className="mobile-primary-action" href={`/tenant/issues/${issue.id}`}>
                View request status
              </Link>
            </div>
          </div>
        ) : (
          <div className="tenant-ai-placeholder">
            <div className="tenant-ai-message">
              <strong>Simple tenant experience</strong>
              <p>Take a picture, type one sentence, and AI will decide whether to guide you or escalate it.</p>
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
