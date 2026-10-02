import { UiIcon } from "@/components/ui-icon";
import { DestinationLink } from "@/components/destination-link";

export function Closing() {
  return (
    <section className="closing container"><p className="eyebrow">YOUR NEXT CHAPTER</p><h2>Big ambitions.<br />One clear <em>next step.</em></h2><p>You don’t need every answer to get started.<br />Let’s work out where you are—and what comes next.</p><div className="actions"><DestinationLink className="button button-gold" destination="consultation" subject="LiterallyGlobal consultation enquiry">Book a consultation <span aria-hidden="true"><UiIcon name="arrow-up-right" /></span></DestinationLink><a className="text-link" href="#services">Explore services <span aria-hidden="true"><UiIcon name="arrow-up-right" /></span></a></div></section>
  );
}
