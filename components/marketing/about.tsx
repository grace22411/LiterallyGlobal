import Image from "next/image";

export function About() {
  return (
    <section className="about section" id="about" aria-labelledby="founder-title">
      <div className="container about-grid">
        <figure className="founder-portrait">
          <div className="founder-photo"><Image src="/assets/grace-ajagbe.png" alt="Grace Ajagbe, founder of LiterallyGlobal, in a gold suit" width={992} height={1056} sizes="(max-width: 640px) 100vw, 40vw" /></div>
          <figcaption><div><strong>Grace Ajagbe</strong><span>Founder, LiterallyGlobal</span></div><span className="founder-year">Endorsed in <strong>2022</strong></span></figcaption>
        </figure>
        <div className="about-copy">
          <p className="eyebrow">THE PERSON BEHIND LITERALLYGLOBAL</p>
          <h2 id="founder-title">I’ve been<br /><em>where you are.</em></h2>
          <p className="large-copy">I’m Grace Ajagbe, a tech leader, AI Solutions Architect, and founder of LiterallyGlobal.</p>
          <p>When I received my Global Talent Visa endorsement in 2022, other professionals began reaching out for help. I supported a few of them for free—and when they secured their own endorsements, I decided to make it official. LiterallyGlobal was born.</p>
          <p>Since then, professionals have gained endorsements through my one-to-one support and practical resources. Today, I run thriving businesses in the UK while helping talented people get recognised for the work they’ve already done.</p>
          <p className="founder-belief">I know what this opportunity can mean. I’m here to help you take your next step.</p>
          <a className="button button-dark" href="#services">Work with me <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </section>
  );
}
