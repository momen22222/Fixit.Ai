import Link from "next/link";

const navItems = [
  { href: "/app/dashboard", label: "Dashboard" },
  { href: "/app/nutrition", label: "Nutrition" },
  { href: "/app/workouts", label: "Workouts" },
  { href: "/app/coach", label: "AI Coach" }
];

export default function AppLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="product-shell">
      <header className="product-header">
        <Link className="brand-lockup" href="/">
          <span className="brand-mark">HerHealth AI</span>
          <span className="brand-subtitle">Women&apos;s health companion</span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary">
          {navItems.map((item) => (
            <Link className="nav-link" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <Link className="header-cta" href="/onboarding">
          Edit profile
        </Link>
      </header>

      <main className="product-content">{children}</main>

      <nav className="mobile-nav" aria-label="Mobile">
        {navItems.map((item) => (
          <Link className="mobile-nav-link" href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
