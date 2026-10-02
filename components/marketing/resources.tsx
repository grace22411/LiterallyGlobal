import { UiIcon } from "@/components/ui-icon";
import Link from "next/link";
import { DestinationLink } from "@/components/destination-link";

export function Resources() {
  return (
    <section className="resources section container" id="resources"><div><p className="eyebrow">A LITTLE HELP TO GET GOING</p><h2>Your first step<br />can be <em>free.</em></h2><p>Free preparation tools for the digital technology route. Our WhatsApp community welcomes all routes.</p><Link className="text-link" href="/resources">Explore all free resources <UiIcon name="arrow-up-right" /></Link></div><div className="resource-list">
      <DestinationLink destination="checklist" subject="Request the free Document Checklist"><span className="resource-number">01</span><span><h3>Document Checklist</h3><p>Know what to gather. See what’s missing.</p><span className="resource-action">Get the checklist</span></span><span className="resource-arrow" aria-hidden="true"><UiIcon name="arrow-up-right" /></span></DestinationLink>
      <DestinationLink destination="statement" subject="Request the Personal Statement Template Guide"><span className="resource-number">02</span><span><h3>Personal Statement Template Guide</h3><p>Move from a blank page to a clear starting point.</p><span className="resource-action">Start my statement</span></span><span className="resource-arrow" aria-hidden="true"><UiIcon name="arrow-up-right" /></span></DestinationLink>
      <DestinationLink destination="workbook" subject="Request the Application Planning Workbook"><span className="resource-number">03</span><span><h3>Application Planning Workbook</h3><p>Get your evidence, tasks, and next steps in one place.</p><span className="resource-action">Get the workbook</span></span><span className="resource-arrow" aria-hidden="true"><UiIcon name="arrow-up-right" /></span></DestinationLink>
      <DestinationLink destination="community" subject="Join the Global Talent Hub"><span className="resource-number">04</span><span><h3>Global Talent Hub</h3><p>WhatsApp community · All routes welcome. No form needed.</p><span className="resource-action">Join the WhatsApp community</span></span><span className="resource-arrow" aria-hidden="true"><UiIcon name="arrow-up-right" /></span></DestinationLink>
    </div></section>
  );
}
