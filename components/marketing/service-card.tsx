import { Fragment } from "react";
import { DestinationLink } from "@/components/destination-link";
import type { Service } from "@/lib/services";

export function ServiceCard({ service }: { service: Service }) {
  const buttonStyle = service.tone === "dark"
    ? "button-gold"
    : service.tone === "gold" ? "button-dark" : "button-outline";

  return (
    <article
      id={service.id}
      className={`service-card${service.tone === "default" ? "" : ` ${service.tone}-card`}`}
      tabIndex={-1}
      aria-labelledby={`${service.id}-title`}
    >
      <div className="service-title">
        <p className="eyebrow">{service.eyebrow}</p>
        <span className="service-meta">{service.meta}</span>
      </div>
      <h3 id={`${service.id}-title`}>{service.name}</h3>
      <p className="service-headline">
        {service.headline.map((line, index) => (
          <Fragment key={line}>{index > 0 && <br />}{line}</Fragment>
        ))}
      </p>
      <p>{service.description}</p>
      <ul className="check-list">
        {service.features.map((feature) => <li key={feature}>{feature}</li>)}
      </ul>
      <p className="best-for">{service.bestFor}</p>
      <div className="service-bottom">
        <p className="price">{service.price}{service.priceUnit && <> <span>{service.priceUnit}</span></>}</p>
        {service.paymentNote && <p className="service-payment-note">{service.paymentNote}</p>}
        <DestinationLink className={`button ${buttonStyle}`} destination={service.destination} subject={service.subject}>
          {service.cta} <span aria-hidden="true">↗</span>
        </DestinationLink>
      </div>
    </article>
  );
}
