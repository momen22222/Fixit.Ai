import Link from "next/link";
import { getTenantAppContext } from "@/lib/services/property-service";

const tenantNav = [
  { href: "/tenant/home", label: "Home" },
  { href: "/tenant/issues", label: "Status" },
  { href: "/tenant/profile", label: "Profile" }
];

export default async function TenantLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const context = await getTenantAppContext();

  return (
    <div className="tenant-role-shell">
      <header className="tenant-role-topbar">
        <Link className="brand-lockup" href="/tenant/home">
          <span className="brand-mark">Fix it AI</span>
          <span className="brand-subtitle">{context.propertyName}</span>
        </Link>
        <Link className="tenant-profile-chip" href="/tenant/profile">
          {context.unitLabel}
        </Link>
      </header>

      <main className="tenant-role-content">{children}</main>

      <nav className="tenant-bottom-nav" aria-label="Tenant navigation">
        {tenantNav.map((item) => (
          <Link className="tenant-nav-item" href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
