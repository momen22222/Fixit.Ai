import Link from "next/link";

const navItems = [
  { href: "/app/issues/new", label: "New request" },
  { href: "/app/dashboard", label: "Status" },
  { href: "/app/manager/approvals", label: "Manager" },
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
          <span className="brand-mark">Fix it AI</span>
          <span className="brand-subtitle">Tenant-first maintenance assistant</span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary">
          {navItems.map((item) => (
            <Link className="nav-link" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <Link className="header-cta" href="/app/issues/new">
          Report issue
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
