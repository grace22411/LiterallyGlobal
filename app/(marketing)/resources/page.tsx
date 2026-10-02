import { UiIcon } from "@/components/ui-icon";
import Link from "next/link";
import { freeResources } from "@/lib/resources/catalog";
import { destinationLinks } from "@/lib/site";
import { ResourceForm } from "@/components/resources/resource-form";
import styles from "@/components/resources/resources.module.css";

export const metadata = {
  title: "Free Global Talent resources",
  description: "Free digital technology route resources: a document checklist, personal statement guide and application planning workbook. Join our WhatsApp community for all routes.",
};

export default function ResourcesPage() {
  return <main id="main" className="container resource-library">
    <header className="resource-library-heading">
      <p className="eyebrow">THE LITERALLYGLOBAL RESOURCE LIBRARY</p>
      <h1>A clearer start.<br /><em>On us.</em></h1>
      <p>Free tools for the Global Talent digital technology route. Choose a resource and share your name, email, phone and location to unlock it. No account needed.</p>
    </header>
    <div className="resource-library-grid">
      {freeResources.map((resource, index) => <article className="resource-tool" id={resource.id} key={resource.id}>
        <span className="resource-tool-tag">0{index + 1} / {resource.label}</span>
        <span className={styles.route}>Digital technology route</span>
        <h2>{resource.name}</h2>
        <p>{resource.description}</p>
        <span className={styles.format}>{resource.format} · Free</span>
        <ResourceForm resource={resource.id} name={resource.name} action={resource.action} />
      </article>)}
    </div>
    <section className={styles.community} id="community" aria-labelledby="community-heading">
      <div>
        <span className={styles.route}>All Global Talent routes · No form needed</span>
        <h2 id="community-heading">Your people. Your next chapter.</h2>
        <p>Join the Global Talent Hub on WhatsApp. Share experiences, ask questions and connect with others on the journey, whichever route you’re taking.</p>
      </div>
      <a className="button" href={destinationLinks.community} target="_blank" rel="noopener noreferrer">Join the WhatsApp community <span aria-hidden="true"><UiIcon name="arrow-up-right" /></span></a>
    </section>
    <section className="resource-checker-banner">
      <div><p className="eyebrow">NOT SURE WHERE YOU STAND?</p><h2>Start with your eligibility check.</h2><p>Answer questions about your work and evidence. Create a free account at the end to see your readiness score and recommendations.</p></div>
      <Link className="button button-gold" href="/eligibility">Check my eligibility <span aria-hidden="true"><UiIcon name="arrow-up-right" /></span></Link>
    </section>
    <section><h2 style={{ fontSize: "1.45rem" }}>Check the official requirements.</h2><p>These tools help you prepare for the digital technology route. Use the current official guidance when deciding what to submit.</p><a className="text-link" href="https://www.gov.uk/global-talent" target="_blank" rel="noreferrer">Read the GOV.UK guidance <UiIcon name="arrow-up-right" /></a></section>
  </main>;
}
