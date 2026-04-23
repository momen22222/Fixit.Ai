"use client";

import { useState } from "react";
import {
  type ExternalVendorCandidate,
  type VendorRecommendation,
  type VendorRecommendationPlan,
  type VendorTrade
} from "@/lib/maintenance-types";

type ManagerVendorFallbackSearchProps = {
  trade: VendorTrade;
  issueSummary: string;
  propertyAddress: string;
  city: string;
  state: string;
  postalCode: string;
  approvedRecommendations: VendorRecommendation[];
};

export function ManagerVendorFallbackSearch({
  trade,
  issueSummary,
  propertyAddress,
  city,
  state,
  postalCode,
  approvedRecommendations
}: ManagerVendorFallbackSearchProps) {
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState(
    approvedRecommendations.length
      ? "Approved vendors are available. External search is optional if you want backup options."
      : "No approved vendor matched this trade and service area yet."
  );
  const [externalCandidates, setExternalCandidates] = useState<ExternalVendorCandidate[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function findBackupVendors() {
    setLoading(true);
    setError(null);
    setNote("Searching for backup vendor candidates...");

    try {
      const response = await fetch("/api/vendors/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trade,
          issueSummary,
          propertyAddress,
          city,
          state,
          postalCode,
          mode: "external-only"
        })
      });
      const payload = (await response.json()) as {
        vendors?: ExternalVendorCandidate[];
        note?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to search vendors.");
      }

      setExternalCandidates(payload.vendors ?? []);
      setNote(payload.note ?? "External candidates require manager approval before dispatch.");
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "Unable to search vendors.");
    } finally {
      setLoading(false);
    }
  }

  async function checkApprovedFirstPlan() {
    setLoading(true);
    setError(null);
    setNote("Checking approved directory first...");

    try {
      const response = await fetch("/api/vendors/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trade,
          issueSummary,
          propertyAddress,
          city,
          state,
          postalCode,
          mode: "approved-first"
        })
      });
      const payload = (await response.json()) as VendorRecommendationPlan & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to check vendor plan.");
      }

      setExternalCandidates(payload.externalCandidates);
      setNote(payload.note);
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "Unable to check vendor plan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="vendor-fallback-panel">
      <div>
        <p className="section-tag">Vendor sourcing strategy</p>
        <h2>Use approved vendors first. Search outside only as backup.</h2>
        <p>{note}</p>
      </div>

      <div className="tenant-entry-inline-actions">
        <button className="button button-primary" disabled={loading} type="button" onClick={checkApprovedFirstPlan}>
          {loading ? "Checking..." : "Check approved directory"}
        </button>
        <button className="button button-secondary" disabled={loading} type="button" onClick={findBackupVendors}>
          {loading ? "Searching..." : "Find backup vendors"}
        </button>
      </div>

      {error ? <p className="error-note">{error}</p> : null}

      {externalCandidates.length ? (
        <div className="manager-vendor-grid">
          {externalCandidates.map((vendor) => (
            <article className="manager-vendor-card" key={`${vendor.source}-${vendor.name}`}>
              <div>
                <p className="mobile-label">{vendor.source}</p>
                <h2>{vendor.name}</h2>
              </div>
              <p>{vendor.reason}</p>
              <div className="manager-vendor-facts">
                {vendor.rating ? <span>{vendor.rating} rating</span> : null}
                {vendor.reviewCount ? <span>{vendor.reviewCount} reviews</span> : null}
                {vendor.phone ? <span>{vendor.phone}</span> : null}
              </div>
              {vendor.url ? (
                <a className="mobile-chip-action" href={vendor.url} rel="noreferrer" target="_blank">
                  View source
                </a>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
