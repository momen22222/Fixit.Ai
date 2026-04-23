"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type SignupPortalProps = {
  initialInviteCode?: string;
};

type SignupState = "idle" | "loading" | "success" | "error";

function extractInviteCode(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  try {
    const url = new URL(trimmed);
    return url.searchParams.get("invite") ?? url.pathname.split("/").filter(Boolean).at(-1) ?? trimmed;
  } catch {
    return trimmed;
  }
}

export function SignupPortal({ initialInviteCode = "" }: SignupPortalProps) {
  const [role, setRole] = useState<"tenant" | "manager">("tenant");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [preferredContact, setPreferredContact] = useState("Text message");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [inviteLink, setInviteLink] = useState(initialInviteCode);
  const [status, setStatus] = useState<SignupState>("idle");
  const [message, setMessage] = useState(
    "Create your account, then enter the invite link your property manager sent you."
  );

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    void supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setEmail(data.user.email);
      }

      const name = data.user?.user_metadata?.full_name;

      if (typeof name === "string") {
        setFullName(name);
      }
    });
  }, []);

  async function handleGoogleSignIn() {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setStatus("error");
      setMessage("Google sign up needs Supabase configured first. You can still use email and the invite code for the demo.");
      return;
    }

    setStatus("loading");
    setMessage("Opening Google sign up...");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/signup${inviteLink ? `?invite=${encodeURIComponent(extractInviteCode(inviteLink))}` : ""}`
      }
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  async function handleEmailLink() {
    if (!email.trim()) {
      setStatus("error");
      setMessage("Add your email first so we can send the sign-in link.");
      return;
    }

    setStatus("loading");
    setMessage("Sending your sign-in link...");

    try {
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          redirectTo: `${window.location.origin}/signup${
            inviteLink ? `?invite=${encodeURIComponent(extractInviteCode(inviteLink))}` : ""
          }`
        })
      });
      const payload = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to send sign-in link.");
      }

      setStatus("success");
      setMessage(payload.message ?? "Check your email for the sign-in link, then come back here to finish your profile.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to send sign-in link.");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const inviteCode = extractInviteCode(inviteLink);

    if (!fullName.trim() || !phoneNumber.trim() || !email.trim() || !inviteCode) {
      setStatus("error");
      setMessage("Please add your name, phone, email, and property manager invite link.");
      return;
    }

    setStatus("loading");
    setMessage("Connecting you to your property...");

    try {
      const supabase = getSupabaseBrowserClient();
      const session = supabase ? await supabase.auth.getSession() : undefined;
      const response = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          fullName,
          phoneNumber,
          email,
          preferredContact,
          emergencyContact,
          inviteCode,
          accessToken: session?.data.session?.access_token
        })
      });
      const payload = (await response.json()) as { redirectTo?: string; message?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to finish sign up.");
      }

      setStatus("success");
      setMessage(payload.message ?? "You are connected. Taking you to your portal...");
      window.setTimeout(() => {
        window.location.href = payload.redirectTo ?? (role === "tenant" ? "/tenant/home" : "/manager/dashboard");
      }, 700);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to finish sign up.");
    }
  }

  return (
    <div className="signup-portal-card">
      <div className="tenant-entry-auth-copy">
        <p className="mobile-label">Sign up or log in</p>
        <h2>First, create your Fix it AI account.</h2>
        <p>Your property manager invite link connects your account to the right building and unit.</p>
      </div>

      <div className="signup-auth-actions">
        <button className="google-signin-button" type="button" onClick={handleGoogleSignIn}>
          Continue with Google
        </button>
        <button className="mobile-chip-action" type="button" onClick={handleEmailLink}>
          Email me a sign-in link
        </button>
      </div>

      <form className="tenant-entry-form" onSubmit={handleSubmit}>
        <div className="role-toggle" aria-label="Choose account type">
          <button
            className={role === "tenant" ? "role-toggle-button is-active" : "role-toggle-button"}
            type="button"
            onClick={() => setRole("tenant")}
          >
            Tenant
          </button>
          <button
            className={role === "manager" ? "role-toggle-button is-active" : "role-toggle-button"}
            type="button"
            onClick={() => setRole("manager")}
          >
            Property manager
          </button>
        </div>

        <label className="tenant-input-block">
          <span>Full name</span>
          <input autoComplete="name" placeholder="Maya Johnson" value={fullName} onChange={(event) => setFullName(event.target.value)} />
        </label>

        <label className="tenant-input-block">
          <span>Phone number</span>
          <input
            autoComplete="tel"
            inputMode="tel"
            placeholder="(555) 555-0142"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
          />
        </label>

        <label className="tenant-input-block">
          <span>Email</span>
          <input
            autoComplete="email"
            inputMode="email"
            placeholder="name@email.com"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="tenant-input-block">
          <span>Preferred contact</span>
          <select value={preferredContact} onChange={(event) => setPreferredContact(event.target.value)}>
            <option>Text message</option>
            <option>Email</option>
            <option>Phone call</option>
          </select>
        </label>

        <label className="tenant-input-block">
          <span>Emergency contact or notes</span>
          <input
            placeholder="Optional: roommate, access notes, pets, etc."
            value={emergencyContact}
            onChange={(event) => setEmergencyContact(event.target.value)}
          />
        </label>

        <label className="tenant-input-block">
          <span>Property manager invite link</span>
          <input
            placeholder="Paste invite link or code"
            value={inviteLink}
            onChange={(event) => setInviteLink(event.target.value)}
          />
        </label>

        <button className="mobile-primary-action" disabled={status === "loading"} type="submit">
          {status === "loading" ? "Connecting..." : "Finish sign up"}
        </button>

        <p className={status === "error" ? "error-note" : "tenant-preflight"}>{message}</p>
      </form>

      <div className="tenant-entry-inline-actions">
        <Link className="mobile-chip-action" href="/tenant/home">
          Continue demo tenant
        </Link>
        <Link className="mobile-chip-action" href="/manager/dashboard">
          Manager demo
        </Link>
      </div>
    </div>
  );
}
