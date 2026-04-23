import { SignupPortal } from "@/components/SignupPortal";

type SignupPageProps = {
  searchParams: Promise<{
    invite?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;

  return (
    <main className="mobile-landing">
      <section className="mobile-phone-shell">
        <div className="mobile-phone-frame">
          <div className="mobile-status-bar">
            <span>9:41</span>
            <span>Invite setup</span>
          </div>

          <div className="tenant-entry-hero">
            <div className="tenant-entry-badge">Fix it AI</div>
            <div className="mobile-welcome-card">
              <p className="mobile-label">Tenant onboarding</p>
              <h1>Connect your unit.</h1>
              <p>Finish your profile and we will attach your account to the rental community your manager invited you to.</p>
            </div>
          </div>

          <SignupPortal initialInviteCode={params.invite ?? ""} />
        </div>
      </section>
    </main>
  );
}
