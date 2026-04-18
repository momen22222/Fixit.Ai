import Link from "next/link";

const navItems = [
  { href: "/app/dashboard", label: "Dashboard" },
  { href: "/app/issues/new", label: "Report issue" },
  { href: "/app/manager/approvals", label: "Approvals" },
  { href: "/app/manager/vendors", label: "Vendors" }
];

export default function AppLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand-lockup" href="/">
          <span className="brand-mark">FieldFix PM</span>
          <span className="brand-subtitle">AI triage for property operations</span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary">
          {navItems.map((item) => (
            <Link className="nav-link" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <Link className="button button-secondary" href="/onboarding">
          Invite flow
        </Link>
      </header>

      <main className="app-content">{children}</main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.map((item) => (
          <Link className="mobile-nav-link" href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
