import { UiIcon } from "@/components/ui-icon";
import { DestinationLink } from "@/components/destination-link";

export function Guides() {
  return (
    <section className="guides section" id="guides"><div className="container"><div className="section-heading"><div><p className="eyebrow">GO AT YOUR OWN PACE</p><h2>Taking the DIY route?<br />Start with <em>structure.</em></h2></div><p>Give your experience a clear framework with guides designed around your field.</p></div><div className="guide-grid">
      <article className="guide-card"><span className="guide-index">01 / DIGITAL TECHNOLOGY</span><h3>Digital Tech<br />Template Guide</h3><p>Templates for your personal statement, recommendation letters, and evidence summaries.</p><DestinationLink className="text-link" destination="techGuide" subject="Digital Tech Template Guide enquiry">Get the tech guide <span aria-hidden="true"><UiIcon name="arrow-up-right" /></span></DestinationLink></article>
      <article className="guide-card"><span className="guide-index">02 / ARTS &amp; CULTURE</span><h3>Arts and Culture<br />Template Guide</h3><p>Give your creative achievements room to shine. Explore the guide and its fit for your design discipline.</p><DestinationLink className="text-link" destination="artsGuide" subject="Arts and Culture Template Guide enquiry">Explore the arts guide <span aria-hidden="true"><UiIcon name="arrow-up-right" /></span></DestinationLink></article>
    </div></div></section>
  );
}
