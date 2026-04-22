import Link from "next/link";
import { getTenantAppContext } from "@/lib/services/property-service";

const navItems = [
  { href: "/app/dashboard", label: "Home" },
  { href: "/app/issues/new", label: "Request" },
  { href: "/app/issues/issue-1001", label: "Status" }
];

export default async function AppLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const context = await getTenantAppContext();

  return (
    <div className="tenant-app-shell">
      <header className="tenant-topbar">
        <div className="tenant-topbar-copy">
          <Link className="brand-lockup" href="/">
            <span className="brand-mark">Fix it AI</span>
            <span className="brand-subtitle">{context.propertyName}</span>
          </Link>
        </div>

        <Link className="tenant-profile-chip" href="/app/dashboard">
          {context.unitLabel}
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
