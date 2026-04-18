import Link from "next/link";

const navItems = [
  { href: "/app/dashboard", label: "Home" },
  { href: "/app/issues/new", label: "Request" },
  { href: "/app/issues/issue-1001", label: "Status" },
  { href: "/app/manager/approvals", label: "Manager" }
];

export default function AppLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="tenant-app-shell">
      <header className="tenant-topbar">
        <div className="tenant-topbar-copy">
          <Link className="brand-lockup" href="/">
            <span className="brand-mark">Fix it AI</span>
            <span className="brand-subtitle">Simple tenant maintenance</span>
          </Link>
        </div>

        <Link className="tenant-profile-chip" href="/app/dashboard">
          Unit 3C
        </Link>
      </header>

      <main className="tenant-app-content">{children}</main>

      <nav className="tenant-bottom-nav" aria-label="Tenant navigation">
        {navItems.map((item) => (
          <Link className="tenant-nav-item" href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
