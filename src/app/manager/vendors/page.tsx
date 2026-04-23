import { ManagerVendorForm } from "@/components/ManagerVendorForm";
import { listVendorDirectory } from "@/lib/services/vendor-service";

export const dynamic = "force-dynamic";

export default async function ManagerVendorsPage() {
  const vendors = await listVendorDirectory();

  return (
    <section className="manager-screen">
      <div className="manager-hero">
        <div>
          <p className="eyebrow">Vendor directory</p>
          <h1>Vendor management</h1>
          <p>
            Vendor selection uses your approved directory first, ranked by trade, service area, reliability, and then
            price. External search is only a backup.
          </p>
        </div>
      </div>

      <section className="manager-panel">
        <ManagerVendorForm />
      </section>

      <section className="manager-panel manager-panel-strong">
        <p className="section-tag">Directory</p>
        <h2>{vendors.length} vendors on file</h2>
        <p>Approved vendors are recommended first. Draft vendors stay in the directory until you are ready to use them.</p>
      </section>

      <div className="manager-vendor-grid">
        {vendors.map((vendor) => (
          <article className="manager-vendor-card" key={vendor.id}>
            <div className="list-card-head">
              <div>
                <p className="mobile-label">{vendor.trades.join(", ")}</p>
                <h2>{vendor.companyName}</h2>
              </div>
              <span className={`status-pill ${vendor.approved ? "is-approved" : "is-routine"}`}>
                {vendor.approved ? "approved" : "draft"}
              </span>
            </div>
            <p>{vendor.notes}</p>
            <div className="manager-vendor-facts">
              <span>{vendor.reliabilityScore} reliability</span>
              <span>{vendor.completionRate}% completion</span>
              <span>${vendor.rateCard.tripFee} + ${vendor.rateCard.hourlyRate}/hr</span>
              <span>{vendor.availability.nextWindow}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
