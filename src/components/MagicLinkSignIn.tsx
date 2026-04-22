"use client";

import Link from "next/link";
import { useState } from "react";

export function MagicLinkSignIn() {
  const [email, setEmail] = useState("maya@fieldfixpm.com");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("Use your invited email to get a secure sign-in link.");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("Sending your sign-in link...");

    try {
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const payload = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to send sign-in link.");
      }

      setState("success");
      setMessage(payload.message ?? "Check your email for the magic link.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Unable to send sign-in link.");
    }
  }

  return (
    <div className="tenant-entry-auth-card">
      <div className="tenant-entry-auth-copy">
        <p className="mobile-label">Tenant sign in</p>
        <h2>Use the email your property manager invited.</h2>
        <p>No password to remember. Open the secure link from your email and you are in.</p>
      </div>

      <form className="tenant-entry-form" onSubmit={handleSubmit}>
        <label className="tenant-input-block">
          <span>Email address</span>
          <input
            autoComplete="email"
            inputMode="email"
            placeholder="name@building.com"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <button className="mobile-primary-action" disabled={state === "loading" || !email.trim()} type="submit">
          {state === "loading" ? "Sending link..." : "Email me a sign-in link"}
        </button>

        <p className={state === "error" ? "error-note" : "tenant-preflight"}>{message}</p>
      </form>

      <div className="tenant-entry-inline-actions">
        <Link className="mobile-chip-action" href="/tenant/home">
          Continue demo tenant
        </Link>
        <Link className="mobile-chip-action" href="/manager/dashboard">
          Manager inbox
        </Link>
      </div>
    </div>
  );
}
