"use client";

import { useState } from "react";
import { type PropertyWithUnits } from "@/lib/maintenance-types";

type ManagerTenantInviteFormProps = {
  properties: PropertyWithUnits[];
};

export function ManagerTenantInviteForm({ properties }: ManagerTenantInviteFormProps) {
  const [email, setEmail] = useState("");
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? "");
  const [unitId, setUnitId] = useState(properties[0]?.units[0]?.id ?? "");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("Invite links connect tenants to the exact unit they rent.");
  const [inviteLink, setInviteLink] = useState("");

  const selectedProperty = properties.find((property) => property.id === propertyId);
  const availableUnits = selectedProperty?.units ?? [];

  async function createInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("Creating invite link...");
    setInviteLink("");

    try {
      const response = await fetch("/api/auth/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role: "tenant",
          propertyId,
          unitId,
          invitedBy: "manager"
        })
      });
      const payload = (await response.json()) as {
        invitation?: { inviteLink?: string; inviteCode?: string };
        error?: string;
      };

      if (!response.ok || !payload.invitation?.inviteLink) {
        throw new Error(payload.error ?? "Unable to create invite.");
      }

      setInviteLink(payload.invitation.inviteLink);
      setStatus("success");
      setMessage("Invite link created. Send this to the tenant so they can finish signup.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to create invite.");
    }
  }

  async function copyInvite() {
    if (!inviteLink) {
      return;
    }

    await navigator.clipboard.writeText(inviteLink);
    setMessage("Invite link copied.");
  }

  return (
    <form className="manager-vendor-form" onSubmit={createInvite}>
      <div>
        <p className="section-tag">Tenant invites</p>
        <h2>Create unit-specific invite</h2>
        <p>The tenant signs up, enters profile details, and this link places them into the correct rental unit.</p>
      </div>

      <label className="field">
        <span>Tenant email</span>
        <input
          autoComplete="email"
          inputMode="email"
          placeholder="tenant@email.com"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <div className="manager-form-grid">
        <label className="field">
          <span>Property</span>
          <select
            value={propertyId}
            onChange={(event) => {
              const nextPropertyId = event.target.value;
              const nextProperty = properties.find((property) => property.id === nextPropertyId);
              setPropertyId(nextPropertyId);
              setUnitId(nextProperty?.units[0]?.id ?? "");
            }}
          >
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Unit</span>
          <select value={unitId} onChange={(event) => setUnitId(event.target.value)}>
            {availableUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                Unit {unit.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button className="button button-primary" disabled={status === "loading" || !email || !propertyId || !unitId} type="submit">
        {status === "loading" ? "Creating..." : "Create invite link"}
      </button>

      <p className={status === "error" ? "error-note" : "tenant-preflight"}>{message}</p>

      {inviteLink ? (
        <div className="tenant-request-summary">
          <strong>Invite link</strong>
          <p>{inviteLink}</p>
          <button className="button button-secondary" type="button" onClick={copyInvite}>
            Copy link
          </button>
        </div>
      ) : null}
    </form>
  );
}
