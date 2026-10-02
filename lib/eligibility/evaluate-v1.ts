// Versioned scoring kernel retained for saved v1 assessments and the current input adapter.
import "server-only";
import { RULES_VERSION, questionsFor, routes, sources, type Answers, type Route } from "./questions-v1";
import { validateAnswers } from "./schema-v1";

export type Check = {
  id: string; label: string; status: "met" | "gap" | "uncertain";
  kind: "requirement" | "evidence"; credit: number; recommendation: string; source: string;
};
export type EligibilityResult = {
  scoreMethod?: "profile-nine-v1";
  rulesVersion: string; route: Route; routeName: string; pathway: string;
  score: number | null; status: "ready-for-review" | "evidence-to-build" | "requirements-gap" | "needs-clarification" | "prize-pathway" | "outside-scope";
  headline: string; summary: string; checks: Check[]; notes: string[];
  recommendedService: "consultation" | "document-review" | "done-with-you" | "ultimate" | null;
  recommendationReason: string; sources: string[];
};

export function evaluate(route: Route, a: Answers): EligibilityResult {
  validateAnswers(route, a);
  const questions = questionsFor(route, a);
  const checks: Check[] = [];
  const notes: string[] = [];
  const add = (id: string, label: string, kind: Check["kind"] = "requirement", recommendation?: string, status?: Check["status"]) => {
    const question = questions.find((item) => item.id === id);
    const state = status ?? (a[id] === "yes" ? "met" : a[id] === "unsure" ? "uncertain" : "gap");
    checks.push({ id, label, status: state, kind, credit: state === "met" ? 1 : 0, recommendation: recommendation ?? question?.help ?? "Confirm this requirement with the official guidance.", source: question?.source ?? sources.general });
  };
  const group = (id: string, ids: string[], label: string, source: string) => {
    const met = ids.filter((key) => a[key] === "yes").length;
    const uncertain = ids.filter((key) => a[key] === "unsure").length;
    const labels = ids.map((key) => questions.find((item) => item.id === key)?.title ?? key);
    checks.push({ id, label, kind: "requirement", credit: Math.min(met / 2, 1), status: met >= 2 ? "met" : met + uncertain >= 2 ? "uncertain" : "gap", recommendation: `You reported evidence in ${met} of the required two distinct categories. Review the remaining categories: ${labels.filter((_, index) => a[ids[index]] !== "yes").join(" ")}`, source });
  };
  const base = (): EligibilityResult => ({
    rulesVersion: RULES_VERSION, route, routeName: routes.find((item) => item.id === route)!.name,
    pathway: "", score: null, status: "needs-clarification", headline: "Let’s clarify your route", summary: "",
    checks, notes, recommendedService: "consultation", recommendationReason: "Start by confirming the appropriate pathway and evidence requirements.",
    sources: [...new Set(questions.map((item) => item.source).filter((url): url is string => Boolean(url)))],
  });
  add("adult", "At least 18 at application", "requirement", "The Global Talent route requires applicants to be at least 18 when applying.");
  if (a.prize === "yes") {
    add("prizeProof", "Named winner of an exact eligible prestigious prize");
    const result = base();
    return { ...result, pathway: "Eligible prestigious prize", status: a.adult === "yes" && a.prizeProof === "yes" ? "prize-pathway" : "needs-clarification", headline: "Check the direct-to-visa prize pathway", summary: "A qualifying listed prize can remove the endorsement requirement. Your exact award, category, identity and the other visa conditions still need verification. We have not assigned an endorsement score to this pathway.", recommendedService: null, recommendationReason: "Verify the exact prize against the official list before paying for endorsement support." };
  }
  if (a.prize === "unsure") notes.push("Check the official prestigious-prize list. An eligible named prize may remove the need for endorsement.");
  if (route === "design" && ["fashion", "architecture", "other"].includes(a.designScope)) {
    const result = base();
    return { ...result, status: "outside-scope", pathway: "Different design pathway", headline: "Your discipline needs a different route check", summary: "This questionnaire assesses the DBA design-industry pathway. Fashion and architecture have separate endorsing criteria, and another discipline may need specialist route advice. No eligibility score has been assigned.", sources: [...result.sources, ...(a.designScope === "fashion" ? [sources.fashion] : a.designScope === "architecture" ? [sources.architecture] : [])] };
  }
  const trackName = a.track === "promise" ? "Exceptional promise" : a.track === "talent" ? "Exceptional talent" : "Career stage to confirm";
  let pathway = trackName;
  if (route === "digital-technology") {
    add("techRole", "Relevant technical or digital-product business expertise", "requirement", undefined, ["technical", "business"].includes(a.techRole) ? "met" : a.techRole === "unsure" ? "uncertain" : "gap");
    add("recognition", "Recognition as a leader or potential leader within five years");
    group("techOptional", ["innovation", "beyondWork", "impact", "research"], "At least two different additional technology criteria", sources.tech);
    add("techLetters", "Three qualified recommendations", "evidence");
    add("techPack", "CV and distinct supporting documents in the required format", "evidence");
    if (a.founder === "yes") add("businessProof", "Evidence linking you to the technology business", "evidence");
    if (a.track === "promise" && a.techExperience === "fiveplus") notes.push("Promise is normally associated with under five years in technology. Your longer technology experience needs individual review; it is not an automatic exclusion in this checker.");
    notes.push("Founder innovation and employee innovation are alternatives within one criterion. They cannot count as two separate criteria.");
  } else if (route === "design") {
    add("designScope", "Discipline covered by the DBA design pathway", "requirement", undefined, a.designScope === "listed" ? "met" : "uncertain");
    add("designWork", "Professional design track record within the past five years");
    add("internationalWork", "Internationally published, distributed or exhibited work");
    add("countries", a.track === "promise" ? "Developing track record in at least one country" : "Substantial track record in at least two countries");
    group("designCategories", ["designMedia", "designAwards", "designExhibitions"], "At least two qualifying design evidence categories", sources.design);
    add("designLetters", "Three recommendations, including a qualifying UK organisation", "evidence");
    add("designPack", "CV and recent design evidence within document limits", "evidence");
    notes.push("The DBA decides whether the work and its recognition meet the required quality and international significance. Self-reported examples are not verified here.");
  } else {
    add("discipline", "Research discipline covered by the relevant endorsing body");
    if (a.researchPath === "appointment") {
      pathway = "Academic or research appointment";
      add("appointment", "Accepted appointment at an approved UK institution");
      add("appointmentRole", "Eligible role and qualification requirements");
      add("recruitment", "Qualifying recruitment and expert assessment");
      add("appointmentDocs", "HR confirmation and full job description", "evidence");
    } else if (a.researchPath === "fellowship") {
      pathway = "Individual fellowship";
      add("fellowship", "Exact approved fellowship held within five years");
      add("fellowshipLetter", "Fellowship award letter", "evidence");
      notes.push("The approved fellowship determines whether the endorsement is under talent or promise.");
    } else if (a.researchPath === "funded") {
      pathway = "UKRI endorsed funder";
      for (const [id, label] of [["funder", "Approved endorsed funder"], ["host", "Approved UK employing or hosting institution"], ["grant", "Grant of at least £30,000 over at least two years"], ["awardType", "Qualifying grant or award structure"], ["contract", "At least one year left on the agreement"], ["grantTime", "At least 50% of working time on qualifying grants"]]) add(id, label);
      add("researchRole", "Eligible research leadership or contribution", "requirement", undefined, a.researchRole === "unsure" ? "uncertain" : "met");
      add("researchQualifications", "Qualifications and experience appropriate to your research role");
      if (a.researchRole === "lead") add("namedOnGrant", "Research lead or job title named on the grant");
      add("grantDocs", "Grant evidence and essential-role confirmation", "evidence");
    } else {
      pathway = `Peer review · ${trackName}`;
      add("activeResearch", "Active research involvement");
      add("phd", "Awarded PhD or equivalent research experience");
      if (a.track === "promise") add("earlyCareer", "Early research career for exceptional promise");
      add("researchRecognition", "Record demonstrating research leadership or potential");
      add("ukReferee", "Recommendation from an eminent UK-resident expert", "evidence");
      if (a.track !== "promise") add("objectiveLetter", "Separate objective assessment for exceptional talent", "evidence");
      add("researchCV", "Research CV and a clear intended UK contribution", "evidence");
      if (a.researchPath === "unsure") notes.push("Peer review was checked provisionally. An eligible appointment, fellowship or funded project may offer a different pathway.");
    }
  }
  const result = base();
  const score = Math.round(100 * checks.reduce((total, check) => total + check.credit, 0) / checks.length);
  const uncertainRoute = a.track === "unsure" || a.researchPath === "unsure";
  const coreGap = checks.some((check) => check.kind === "requirement" && check.status === "gap");
  const uncertain = uncertainRoute || checks.some((check) => check.status === "uncertain");
  const evidenceGap = checks.some((check) => check.kind === "evidence" && check.status === "gap");
  const status = coreGap ? "requirements-gap" : uncertain ? "needs-clarification" : evidenceGap ? "evidence-to-build" : "ready-for-review";
  const headlines = {
    "requirements-gap": "There are requirements to address first",
    "needs-clarification": "A few details need a closer look",
    "evidence-to-build": "Your evidence pack needs more preparation",
    "ready-for-review": "Your answers support a detailed evidence review",
  };
  let recommendedService: EligibilityResult["recommendedService"] = "consultation";
  let recommendationReason = "A consultation can clarify your route and the specific requirements that need attention before committing to an application.";
  const fundamentalGap = a.adult !== "yes" || a.techRole === "neither" || a.designScope === "unsure" || a.discipline === "no";
  if (!fundamentalGap && !uncertain && status !== "requirements-gap") {
    recommendedService = a.stage === "ready" && !evidenceGap ? "document-review" : "done-with-you";
    recommendationReason = recommendedService === "document-review" ? "You report meeting the checklist and have a draft. A document review can examine how convincingly the evidence supports your case." : "Hands-on support can help you organise the evidence you report having and prepare your application documents.";
  } else if (!fundamentalGap && !uncertain && ["digital-technology", "design"].includes(route) && coreGap) {
    recommendedService = "ultimate";
    recommendationReason = "Your answers suggest you need to develop parts of your track record. Explore a development plan first; the package cannot guarantee that you will become eligible.";
  }
  return { ...result, pathway, score, status, headline: headlines[status], summary: "This is LiterallyGlobal’s evidence-readiness checklist, based on your answers. It is not a Home Office points score, a visa decision or a probability of approval. Documents have not been reviewed; other visa conditions are outside this check.", recommendedService, recommendationReason };
}
