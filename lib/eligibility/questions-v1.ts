export const RULES_VERSION = "2026-10-01.1";
export const REVIEWED_ON = "1 October 2026";
export const DRAFT_KEY = "literallyglobal.eligibility.draft.v1";
export type Route = "digital-technology" | "academia-research" | "design";
export type Answers = Record<string, string>;
export type Option = { value: string; label: string };
export type Question = { id: string; title: string; help?: string; options: readonly Option[]; source?: string };

export const sources = {
  general: "https://www.gov.uk/global-talent",
  prizes: "https://www.gov.uk/government/publications/global-talent-eligible-prestigious-prize-lists",
  tech: "https://www.gov.uk/global-talent-digital-technology/eligibility",
  techDocuments: "https://www.gov.uk/global-talent-digital-technology/documents-you-need-to-apply-endorsement",
  research: "https://www.gov.uk/global-talent-researcher-academic",
  appointment: "https://www.gov.uk/global-talent-researcher-academic/academic-or-researcher",
  fellowship: "https://www.gov.uk/global-talent-researcher-academic/individual-fellowship",
  funded: "https://www.gov.uk/global-talent-researcher-academic/uk-research-innovation-endorsement",
  peer: "https://www.gov.uk/global-talent-researcher-academic/peer-review",
  design: "https://www.gov.uk/global-talent-arts-culture/design-industry",
  designScope: "https://www.artscouncil.org.uk/global-talent-visa/global-talent-visa-guidance#t-in-page-nav-12",
  dba: "https://www.dba.org.uk/the-global-talent-visa-for-design/",
  fashion: "https://www.gov.uk/global-talent-arts-culture/fashion-design",
  architecture: "https://www.gov.uk/global-talent-arts-culture/architecture",
} as const;

export const routes: { id: Route; name: string; description: string; mark: string }[] = [
  { id: "digital-technology", name: "Digital technology", description: "Technical specialists, product leaders, founders and digital business talent.", mark: "01" },
  { id: "academia-research", name: "Academia & research", description: "Academic appointments, fellowships, funded research and peer review.", mark: "02" },
  { id: "design", name: "Arts & culture: design", description: "Design-industry professionals applying through the DBA pathway.", mark: "03" },
];
export const yesNo: Option[] = [{ value: "yes", label: "Yes — I can evidence this" }, { value: "no", label: "Not yet" }, { value: "unsure", label: "I’m not sure" }];
const choices = (items: [string, string][]): Option[] => items.map(([value, label]) => ({ value, label }));
const q = (id: string, title: string, help: string, source: string): Question => ({ id, title, help, options: yesNo, source });
const track: Question = {
  id: "track", title: "Which career stage best describes you?",
  help: "This selects the criteria to check. Your endorsing body makes the final assessment of talent or promise.",
  options: choices([["talent", "An established leader — exceptional talent"], ["promise", "An emerging leader — exceptional promise"], ["unsure", "I need help choosing"]]),
};
const stage: Question = { id: "stage", title: "How far have you got with your application documents?", help: "This helps us recommend your next step. It does not increase or reduce your checklist score.", options: choices([["ready", "My document pack is drafted"], ["drafting", "I’m gathering evidence or writing"], ["starting", "I haven’t started my documents"]]) };

export function questionsFor(route: Route, a: Answers): Question[] {
  const common: Question[] = [
    { id: "adult", title: "Will you be at least 18 when you apply?", options: choices([["yes", "Yes"], ["no", "No"], ["unsure", "I’m not sure"]]), source: sources.general },
    { id: "prize", title: "Have you personally won a prize on the official Global Talent prestigious-prize list?", help: "Only the exact listed prize and eligible category count. An ordinary industry award or nomination is different.", options: choices([["yes", "Yes — I checked the official list"], ["no", "No"], ["unsure", "I need to check"]]), source: sources.prizes },
  ];
  if (a.prize === "yes") return [...common, q("prizeProof", "Can you prove you are the named winner of that exact listed prize?", "We will flag the possible direct-to-visa pathway for verification, rather than recommend an endorsement package.", sources.prizes), stage];
  if (route === "digital-technology") {
    const promise = a.track === "promise";
    return [...common, track,
      { id: "techRole", title: "Where does your digital technology expertise sit?", help: "The pathway covers technical expertise and commercial, investment or product expertise in digital product businesses.", options: choices([["technical", "Technical expertise / building digital technology"], ["business", "Commercial, investment or product leadership"], ["neither", "Neither describes my work"], ["unsure", "I’m not sure"]]), source: sources.tech },
      { id: "techExperience", title: "How long have you worked in technology?", help: "Promise applicants typically have under five years in technology; a longer career elsewhere is possible. This is not treated as an automatic five-year cutoff.", options: choices([["under5", "Less than five years"], ["fiveplus", "Five years or more"]]), source: sources.tech },
      q("recognition", `Can you evidence recognition as ${promise ? "a potential" : "an established"} digital technology leader in the past five years?`, "Think independent recognition of your impact. The document pack needs at least two distinct pieces for this requirement.", sources.techDocuments),
      q("innovation", "Can you evidence innovation in digital technology?", promise ? "Innovation as a product-led technology founder, or as an employee working on a new field or concept. Plan two distinct supporting documents." : "Innovation as a product-led technology founder or senior executive, or as an employee in a new field or concept. These alternatives form ONE criterion, not two.", sources.tech),
      q("beyondWork", "Have you advanced the technology sector beyond your paid role?", "For example, independently recognised mentoring or collaborative work. You need to show contribution beyond normal job duties, with two distinct documents.", sources.tech),
      q("impact", "Have you made significant technical, commercial or entrepreneurial contributions to a digital product company?", "Show your own contribution and measurable impact. Prepare two distinct supporting documents.", sources.tech),
      q("research", "Can you evidence a research contribution through publications or expert endorsement?", "This is an alternative evidence category. Prepare two distinct supporting documents if you rely on it.", sources.tech),
      q("techLetters", "Can three established technology experts each recommend you?", "Each must have known your work for at least 12 months and write a tailored letter with different examples.", sources.techDocuments),
      q("techPack", "Can you assemble the required CV and distinct evidence documents?", "CV: up to three A4 pages. Evidence: at most ten documents, up to three pages each; two for recognition and two for each of two other criteria. Do not reuse a piece across criteria.", sources.techDocuments),
      { id: "founder", title: "Have you been a technology founder or senior executive in the past five years?", options: choices([["yes", "Yes"], ["no", "No"]]), source: sources.techDocuments },
      ...(a.founder === "yes" ? [q("businessProof", "Can you document your connection to that technology business?", "For example, appropriate business accounts or sales and customer records. Check the official document guidance for the format.", sources.techDocuments)] : []),
      stage,
    ];
  }
  if (route === "design") {
    const promise = a.track === "promise";
    return [...common,
      { id: "designScope", title: "Does your discipline fall within the supported design-industry fields?", help: "Check the linked Arts Council list. Fashion and architecture have separate pathways and are not scored using the DBA rules.", options: choices([["listed", "Yes — my discipline is on the design list"], ["fashion", "I work in fashion design"], ["architecture", "I work in architecture"], ["other", "My discipline is not listed"], ["unsure", "I need help confirming"]]), source: sources.designScope },
      ...(["fashion", "architecture", "other"].includes(a.designScope) ? [stage] : [track,
        q("designWork", "Can you show regular professional design practice within the past five years?", "Talent needs an established record; promise needs a developing professional record. The DBA assesses the stage and quality of your work.", sources.dba),
        q("internationalWork", "Has your design work been published, distributed or exhibited internationally?", "Your role must be identifiable. The DBA must assess the work as outstanding.", sources.design),
        q("countries", `Does your ${promise ? "developing" : "substantial"} track record cover at least ${promise ? "one country" : "two countries"}?`, "Your country of residence can count. Use documented professional work rather than travel history.", sources.design),
        q("designMedia", "Do you have at least two qualifying reviews of your work?", `Use named critics in established, internationally recognised media, with dates and attribution. ${promise ? "Coverage from one or more countries can count." : "Talent requires coverage from at least two countries."}`, sources.design),
        q("designAwards", `Have you ${promise ? "won, been nominated or shortlisted for" : "won or significantly contributed to winning"} a significant international design prize?`, "The DBA judges significance. Grants and bursaries do not count as prizes.", sources.design),
        q("designExhibitions", "Can you evidence internationally significant professional appearances, publications or exhibitions?", `Include dates, location and proof of your involvement. ${promise ? "Show professional recognition and your contribution." : "Talent needs evidence from at least two countries."}`, sources.design),
        q("designLetters", "Can you obtain the three required recommendations?", "Two from established expert organisations, with at least one based in the UK; the third from an expert organisation or individual. All must have worked with you.", sources.design),
        q("designPack", "Can you prepare your CV and supporting evidence from the past five years?", "The design evidence limit is ten pieces, up to two A4 pages each. Letters have their own three-page limit.", sources.design), stage]),
    ];
  }
  const pathway: Question = { id: "researchPath", title: "Which academic or research pathway would you like to check?", options: choices([["appointment", "An eligible UK academic or research appointment"], ["fellowship", "An eligible individual fellowship"], ["funded", "Work on a UKRI-endorsed funder’s grant"], ["peer", "Peer review of my research record"], ["unsure", "I’m not sure — explore peer review first"]]), source: sources.research };
  const discipline = q("discipline", "Is your research discipline covered by an endorsing body?", "Check the official list for the Royal Society, British Academy or Royal Academy of Engineering. UKRI covers eligible funded research across disciplines.", sources.research);
  const prefix = [...common, pathway, discipline];
  if (a.researchPath === "appointment") return [...prefix,
    q("appointment", "Have you accepted an eligible role at an approved UK institution?", "Check the institution against the linked official guidance; being an academic somewhere else is not enough for this pathway.", sources.appointment),
    q("appointmentRole", "Does the role involve research/innovation leadership, or research/innovation as its main activity?", "The full job description must also show the requirement for a PhD or equivalent research experience.", sources.appointment),
    q("recruitment", "Can your employer confirm the required recruitment process?", "Open competition or an explanation; at least two references; three academic/research/innovation interviewers; and a field expert involved or consulted.", sources.appointment),
    q("appointmentDocs", "Can HR provide the required confirmation letter and full job description?", "The letter must confirm the accepted appointment, eligibility and recruitment details.", sources.appointment), stage];
  if (a.researchPath === "fellowship") return [...prefix,
    q("fellowship", "Have you held a fellowship on the approved list in the past five years?", "The exact fellowship must be eligible. Its classification determines talent or promise; not every funded position is a fellowship.", sources.fellowship),
    q("fellowshipLetter", "Do you have the fellowship award letter?", "You will need the official award confirmation for this fast-track pathway.", sources.fellowship), stage];
  if (a.researchPath === "funded") return [...prefix,
    q("funder", "Is your funder on the UKRI endorsed-funder list?", "Confirm the actual awarding organisation, not just a connection to UK research.", sources.funded),
    q("host", "Is your UK employer or host on UKRI’s approved list?", "An approved UK organisation must employ or host you; the research itself may take place abroad.", sources.funded),
    q("grant", "Is the grant worth at least £30,000 and scheduled for at least two years?", "These thresholds apply to the grant, not your personal salary.", sources.funded),
    q("awardType", "Is it a qualifying one-off award or a renewable award with regular peer review?", "Check the award conditions and funder confirmation against the official guidance.", sources.funded),
    q("contract", "Will at least one year remain on your employment or hosting agreement?", "Check the remaining term at the time you apply.", sources.funded),
    q("grantTime", "Will at least half your working time be on the qualifying grant?", "Principal/co-investigators may combine qualifying grants to reach half their working time.", sources.funded),
    { id: "researchRole", title: "What will your role on the research involve?", options: choices([["lead", "Leading a unique research or innovation project"], ["contributor", "Contributing to new technology or methodology"], ["unsure", "Neither / I need to check"]]), source: sources.funded },
    q("researchQualifications", a.researchRole === "contributor" ? "Do you have the required degree or equivalent research experience and relevant research experience?" : "Do you have a PhD or equivalent research experience and active participation in the field?", a.researchRole === "contributor" ? "The guidance accepts a UK bachelor’s degree, an equivalent overseas research degree, or equivalent research experience." : "For a project lead, your name or job title must also appear on the grant application. Relevant career breaks can be considered.", sources.funded),
    ...(a.researchRole === "lead" ? [q("namedOnGrant", "Are you or your job title named on the grant application?", "This is an additional requirement for research/project leaders on the endorsed-funder pathway.", sources.funded)] : []),
    q("grantDocs", "Can you provide the grant evidence and the required HR letter?", "Use an approved grant database entry or funder letter, plus HR confirmation of your essential role, accepted agreement, time commitment and fair recruitment if not named.", sources.funded), stage];
  return [...prefix, track,
    q("activeResearch", "Are you an active researcher?", "Research may be in a university, research institute or business.", sources.peer),
    q("phd", "Have you been awarded a PhD, or can you show equivalent research experience?", "Relevant industrial or clinical research can count as equivalent experience. A PhD in progress alone is not enough.", sources.peer),
    ...(a.track === "promise" ? [q("earlyCareer", "Are you at an early stage of your research career?", "This is an additional condition for exceptional promise through peer review.", sources.peer)] : []),
    q("researchRecognition", `Can your record demonstrate ${a.track === "promise" ? "potential for research leadership" : "established research leadership"}?`, "The reviewers consider career impact, recognition, publications, funding and awards in context. No single publication count guarantees endorsement.", sources.peer),
    q("ukReferee", "Can an eminent UK-resident expert who knows your work recommend you?", "Their expertise must be internationally recognised. The letter should address your track record, plans and potential UK contribution.", sources.peer),
    ...(a.track !== "promise" ? [q("objectiveLetter", "Can a different eminent expert at a UK organisation provide an objective assessment?", "This additional letter is required for exceptional talent. The author must be a senior member and assess your work independently of personal knowledge.", sources.peer)] : []),
    q("researchCV", "Can you provide a research CV and explain your intended contribution to the UK?", "The CV can be up to three A4 pages and should cover your career and relevant publications.", sources.peer), stage];
}
