import Link from "next/link";

const managerNav = [
  { href: "/manager/dashboard", label: "Dashboard" },
  { href: "/manager/requests", label: "Requests" },
  { href: "/manager/vendors", label: "Vendors" },
  { href: "/manager/properties", label: "Properties" },
  { href: "/manager/tenants", label: "Tenants" }
];

export default function ManagerLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="manager-shell">
      <aside className="manager-sidebar">
        <Link className="brand-lockup" href="/manager/dashboard">
          <span className="brand-mark">Fix it AI</span>
          <span className="brand-subtitle">Manager portal</span>
        </Link>
        <nav className="manager-nav" aria-label="Manager navigation">
          {managerNav.map((item) => (
            <Link className="manager-nav-link" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="manager-content">{children}</main>
    </div>
  );
}
