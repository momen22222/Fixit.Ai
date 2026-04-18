import { listVendors } from "@/lib/maintenance-data";

export default function VendorsPage() {
  const vendors = listVendors();

  return (
    <section className="page-stack">
      <div className="page-heading">
        <p className="eyebrow">Vendor directory</p>
        <h1>Approved local vendors with rate cards, service areas, and availability.</h1>
        <p>
          Version 1 uses a curated directory managed by the property team instead of a live marketplace so scheduling
          decisions stay reliable.
        </p>
      </div>

      <div className="card-list">
        {vendors.map((vendor) => (
          <article className="list-card" key={vendor.id}>
            <div className="list-card-head">
              <div>
                <p className="mini-label">{vendor.id}</p>
                <h3>{vendor.companyName}</h3>
              </div>
              <span className={`status-pill ${vendor.approved ? "is-approved" : "is-routine"}`}>
                {vendor.approved ? "approved" : "draft"}
              </span>
            </div>
            <div className="detail-list-block">
              <p>Trades: {vendor.trades.join(", ")}</p>
              <p>Reliability: {vendor.reliabilityScore}</p>
              <p>Completion rate: {vendor.completionRate}%</p>
              <p>Rate card: ${vendor.rateCard.tripFee} trip fee + ${vendor.rateCard.hourlyRate}/hr</p>
              <p>Next window: {vendor.availability.nextWindow}</p>
              <p>{vendor.notes}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
