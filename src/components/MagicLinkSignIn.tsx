"use client";

import Link from "next/link";
import { useState } from "react";

export function MagicLinkSignIn() {
  const [role, setRole] = useState<"tenant" | "manager">("tenant");
  const [email, setEmail] = useState("maya@fieldfixpm.com");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("Choose your role and enter your invited email.");

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
        <p className="mobile-label">Sign in</p>
        <h2>Are you a tenant or a property manager?</h2>
        <p>Pick your role, enter your email, and continue into the right workspace.</p>
      </div>

      <form className="tenant-entry-form" onSubmit={handleSubmit}>
        <div className="role-toggle" aria-label="Choose account type">
          <button
            className={role === "tenant" ? "role-toggle-button is-active" : "role-toggle-button"}
            type="button"
            onClick={() => {
              setRole("tenant");
              setEmail("maya@fieldfixpm.com");
            }}
          >
            Tenant
          </button>
          <button
            className={role === "manager" ? "role-toggle-button is-active" : "role-toggle-button"}
            type="button"
            onClick={() => {
              setRole("manager");
              setEmail("manager@fixitai.com");
            }}
          >
            Property manager
          </button>
        </div>

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
          {state === "loading" ? "Sending link..." : `Log in as ${role === "tenant" ? "tenant" : "manager"}`}
        </button>

        <p className={state === "error" ? "error-note" : "tenant-preflight"}>{message}</p>
      </form>

      <div className="tenant-entry-inline-actions">
        <Link className="mobile-chip-action" href={role === "tenant" ? "/tenant/home" : "/manager/dashboard"}>
          Continue demo
        </Link>
        <Link className="mobile-chip-action" href={role === "tenant" ? "/manager/dashboard" : "/tenant/home"}>
          Switch to {role === "tenant" ? "manager" : "tenant"}
        </Link>
      </div>
    </div>
  );
}
