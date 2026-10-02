import { UiIcon } from "@/components/ui-icon";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="hero container">
      <div className="hero-copy">
        <p className="eyebrow"><span className="mini-mark" aria-hidden="true"><UiIcon name="asterisk" /></span> UK GLOBAL TALENT · ENDORSEMENT SUPPORT</p>
        <h1>Your talent.<br />A bigger <em>world.</em></h1>
        <p className="hero-lead">For people doing<br className="desktop-break"/> work that matters.</p>
        <p className="hero-description">Turn your achievements into a clear, compelling application—with support from your first questions to your final documents.</p>
        <div className="actions"><Link className="button button-gold" href="/eligibility">Check my eligibility <span aria-hidden="true"><UiIcon name="arrow-up-right" /></span></Link><a className="text-link" href="#services">Explore services <span aria-hidden="true"><UiIcon name="arrow-down" /></span></a></div>
        <div className="hero-proof"><span><strong>50+</strong> professionals supported</span><span><strong>80%</strong> success rate</span></div>
      </div>
      <div className="hero-visual endorsement-visual">
        <div className="endorsement-art"><Image src="/assets/endorsement-journey.webp" alt="Illustration of professionals celebrating their endorsements and a new chapter in the UK" width={1254} height={1254} preload sizes="(max-width: 640px) 100vw, 45vw" /></div>
        <div className="endorsement-badge"><span className="endorsement-check" aria-hidden="true">✓</span><div><span>GLOBAL TALENT</span><strong>Your talent, recognised.</strong></div></div>
        <p className="endorsement-caption">Big ambitions. New beginnings.</p>
      </div>
    </section>
  );
}
