import { ManagerPropertySetup } from "@/components/ManagerPropertySetup";
import { listManagerProperties } from "@/lib/services/property-service";

export const dynamic = "force-dynamic";

export default async function ManagerPropertiesPage() {
  const properties = await listManagerProperties();

  return (
    <section className="manager-screen">
      <div className="manager-hero">
        <div>
          <p className="eyebrow">Properties</p>
          <h1>Property setup</h1>
          <p>Add rental communities and units so every tenant invite is tied to the right home.</p>
        </div>
      </div>

      <ManagerPropertySetup properties={properties} />
    </section>
  );
}
