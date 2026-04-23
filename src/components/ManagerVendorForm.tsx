"use client";

import { useState } from "react";
import { type Vendor, type VendorInput, type VendorTrade } from "@/lib/maintenance-types";

const tradeOptions: VendorTrade[] = ["plumbing", "appliance", "electrical", "hvac", "general"];

export function ManagerVendorForm() {
  const [companyName, setCompanyName] = useState("");
  const [trades, setTrades] = useState<VendorTrade[]>(["general"]);
  const [approved, setApproved] = useState(true);
  const [city, setCity] = useState("Denver");
  const [postalCodes, setPostalCodes] = useState("80205");
  const [tripFee, setTripFee] = useState("75");
  const [hourlyRate, setHourlyRate] = useState("115");
  const [reliabilityScore, setReliabilityScore] = useState("90");
  const [completionRate, setCompletionRate] = useState("95");
  const [nextWindow, setNextWindow] = useState("Next business day");
  const [responseHours, setResponseHours] = useState("24");
  const [notes, setNotes] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("Add vendors your team already trusts. External search stays as backup.");
  const [savedVendor, setSavedVendor] = useState<Vendor | null>(null);

  function toggleTrade(trade: VendorTrade) {
    setTrades((current) =>
      current.includes(trade) ? current.filter((item) => item !== trade) : [...current, trade]
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("Saving vendor...");

    const input: VendorInput = {
      companyName,
      trades,
      approved,
      city,
      postalCodes: postalCodes
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      tripFee: Number(tripFee),
      hourlyRate: Number(hourlyRate),
      reliabilityScore: Number(reliabilityScore),
      completionRate: Number(completionRate),
      nextWindow,
      responseHours: Number(responseHours),
      notes
    };

    try {
      const response = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      const payload = (await response.json()) as { vendor?: Vendor; error?: string };

      if (!response.ok || !payload.vendor) {
        throw new Error(payload.error ?? "Unable to save vendor.");
      }

      setSavedVendor(payload.vendor);
      setState("success");
      setMessage(`${payload.vendor.companyName} was added to the vendor directory.`);
      setCompanyName("");
      setNotes("");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Unable to save vendor.");
    }
  }

  return (
    <form className="manager-vendor-form" onSubmit={handleSubmit}>
      <div>
        <p className="section-tag">Build your approved list</p>
        <h2>Add a vendor</h2>
        <p>These vendors become the first options Fix it AI recommends before searching outside.</p>
      </div>

      <label className="field">
        <span>Company name</span>
        <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="ClearFlow Plumbing" />
      </label>

      <div className="field">
        <span>Trades</span>
        <div className="manager-trade-picker">
          {tradeOptions.map((trade) => (
            <button
              className={trades.includes(trade) ? "trade-toggle is-selected" : "trade-toggle"}
              key={trade}
              type="button"
              onClick={() => toggleTrade(trade)}
            >
              {trade}
            </button>
          ))}
        </div>
      </div>

      <label className="tenant-check-row">
        <input checked={approved} type="checkbox" onChange={(event) => setApproved(event.target.checked)} />
        <span>Approved for manager recommendations</span>
      </label>

      <div className="manager-form-grid">
        <label className="field">
          <span>City</span>
          <input value={city} onChange={(event) => setCity(event.target.value)} />
        </label>
        <label className="field">
          <span>ZIP coverage</span>
          <input value={postalCodes} onChange={(event) => setPostalCodes(event.target.value)} placeholder="80205, 80206" />
        </label>
        <label className="field">
          <span>Trip fee</span>
          <input inputMode="numeric" value={tripFee} onChange={(event) => setTripFee(event.target.value)} />
        </label>
        <label className="field">
          <span>Hourly rate</span>
          <input inputMode="numeric" value={hourlyRate} onChange={(event) => setHourlyRate(event.target.value)} />
        </label>
        <label className="field">
          <span>Reliability score</span>
          <input inputMode="numeric" value={reliabilityScore} onChange={(event) => setReliabilityScore(event.target.value)} />
        </label>
        <label className="field">
          <span>Completion rate</span>
          <input inputMode="numeric" value={completionRate} onChange={(event) => setCompletionRate(event.target.value)} />
        </label>
        <label className="field">
          <span>Next available window</span>
          <input value={nextWindow} onChange={(event) => setNextWindow(event.target.value)} />
        </label>
        <label className="field">
          <span>Response hours</span>
          <input inputMode="numeric" value={responseHours} onChange={(event) => setResponseHours(event.target.value)} />
        </label>
      </div>

      <label className="field">
        <span>Notes</span>
        <textarea
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Good for water heaters, weekend emergency response, insurance docs on file..."
        />
      </label>

      <button className="button button-primary" disabled={state === "loading" || !companyName.trim() || !trades.length} type="submit">
        {state === "loading" ? "Saving..." : "Save vendor"}
      </button>

      <p className={state === "error" ? "error-note" : "tenant-preflight"}>{message}</p>

      {savedVendor ? (
        <div className="tenant-request-summary">
          <strong>{savedVendor.companyName}</strong>
          <p>
            {savedVendor.trades.join(", ")} / {savedVendor.coverageAreas[0]?.postalCodes.join(", ")}
          </p>
        </div>
      ) : null}
    </form>
  );
}
