"use client";

import { useState } from "react";
import { type Property, type PropertyInput, type PropertyWithUnits, type Unit, type UnitInput } from "@/lib/maintenance-types";

type ManagerPropertySetupProps = {
  properties: PropertyWithUnits[];
};

export function ManagerPropertySetup({ properties }: ManagerPropertySetupProps) {
  const [propertyList, setPropertyList] = useState(properties);
  const [propertyName, setPropertyName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Denver");
  const [state, setState] = useState("CO");
  const [postalCode, setPostalCode] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState(properties[0]?.id ?? "");
  const [unitLabel, setUnitLabel] = useState("");
  const [floor, setFloor] = useState("");
  const [bedrooms, setBedrooms] = useState("1");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("Add the communities and units you want tenants tied to.");

  async function addProperty(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("Adding property...");

    const input: PropertyInput = {
      name: propertyName,
      address,
      city,
      state,
      postalCode
    };

    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      const payload = (await response.json()) as { property?: Property; error?: string };

      if (!response.ok || !payload.property) {
        throw new Error(payload.error ?? "Unable to add property.");
      }

      const nextProperty = { ...payload.property, units: [] };
      setPropertyList((current) => [nextProperty, ...current]);
      setSelectedPropertyId(nextProperty.id);
      setPropertyName("");
      setAddress("");
      setPostalCode("");
      setStatus("success");
      setMessage(`${nextProperty.name} was added. Now add units for tenant invites.`);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to add property.");
    }
  }

  async function addUnit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPropertyId) {
      setStatus("error");
      setMessage("Add or select a property before adding units.");
      return;
    }

    setStatus("loading");
    setMessage("Adding unit...");

    const input: UnitInput = {
      propertyId: selectedPropertyId,
      label: unitLabel,
      floor,
      bedrooms: Number(bedrooms) || 0
    };

    try {
      const response = await fetch("/api/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      const payload = (await response.json()) as { unit?: Unit; error?: string };

      if (!response.ok || !payload.unit) {
        throw new Error(payload.error ?? "Unable to add unit.");
      }

      setPropertyList((current) =>
        current.map((property) =>
          property.id === selectedPropertyId ? { ...property, units: [payload.unit!, ...property.units] } : property
        )
      );
      setUnitLabel("");
      setFloor("");
      setStatus("success");
      setMessage(`Unit ${payload.unit.label} was added.`);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to add unit.");
    }
  }

  return (
    <div className="manager-setup-grid">
      <section className="manager-panel">
        <form className="manager-vendor-form" onSubmit={addProperty}>
          <div>
            <p className="section-tag">Step 1</p>
            <h2>Add property</h2>
            <p>Create each rental community or building before inviting tenants.</p>
          </div>
          <div className="manager-form-grid">
            <label className="field">
              <span>Property name</span>
              <input value={propertyName} onChange={(event) => setPropertyName(event.target.value)} placeholder="Maple Court Homes" />
            </label>
            <label className="field">
              <span>Street address</span>
              <input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="1248 Maple Court" />
            </label>
            <label className="field">
              <span>City</span>
              <input value={city} onChange={(event) => setCity(event.target.value)} />
            </label>
            <label className="field">
              <span>State</span>
              <input value={state} onChange={(event) => setState(event.target.value)} />
            </label>
            <label className="field">
              <span>ZIP</span>
              <input value={postalCode} onChange={(event) => setPostalCode(event.target.value)} placeholder="80205" />
            </label>
          </div>
          <button className="button button-primary" disabled={status === "loading" || !propertyName || !address} type="submit">
            Save property
          </button>
        </form>
      </section>

      <section className="manager-panel">
        <form className="manager-vendor-form" onSubmit={addUnit}>
          <div>
            <p className="section-tag">Step 2</p>
            <h2>Add unit</h2>
            <p>Units are what tenant invite links attach to.</p>
          </div>
          <label className="field">
            <span>Property</span>
            <select value={selectedPropertyId} onChange={(event) => setSelectedPropertyId(event.target.value)}>
              {propertyList.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </label>
          <div className="manager-form-grid">
            <label className="field">
              <span>Unit label</span>
              <input value={unitLabel} onChange={(event) => setUnitLabel(event.target.value)} placeholder="3C" />
            </label>
            <label className="field">
              <span>Floor</span>
              <input value={floor} onChange={(event) => setFloor(event.target.value)} placeholder="3" />
            </label>
            <label className="field">
              <span>Bedrooms</span>
              <input inputMode="numeric" value={bedrooms} onChange={(event) => setBedrooms(event.target.value)} />
            </label>
          </div>
          <button className="button button-primary" disabled={status === "loading" || !unitLabel} type="submit">
            Save unit
          </button>
        </form>
      </section>

      <section className="manager-panel manager-panel-strong">
        <p className="section-tag">Portfolio</p>
        <h2>{propertyList.length} properties</h2>
        <div className="manager-request-table">
          {propertyList.map((property) => (
            <article className="manager-request-row" key={property.id}>
              <div>
                <p className="mobile-label">
                  {property.city}, {property.state} {property.postalCode}
                </p>
                <h2>{property.name}</h2>
                <p>{property.address}</p>
              </div>
              <div className="manager-row-status">
                <span>{property.units.length} units</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <p className={status === "error" ? "error-note" : "tenant-preflight"}>{message}</p>
    </div>
  );
}
