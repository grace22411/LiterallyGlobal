import { NextStep } from "./next-step";
import { ServiceCard } from "./service-card";
import { services } from "@/lib/services";

export function Services() {
  return (
    <section className="services section container" id="services">
      <div className="section-heading"><div><p className="eyebrow">SUPPORT THAT MEETS YOU WHERE YOU ARE</p><h2>Wherever you’re starting,<br />there’s a <em>next step.</em></h2></div></div>
      <NextStep />
      <div className="service-grid">
        {services.map((service) => <ServiceCard key={service.id} service={service} />)}
      </div>
      <p className="booking-note">Bookings and resource requests are currently arranged by email.</p>
    </section>
  );
}
