import "server-only";
import type {Route} from "@/lib/eligibility/questions-v1";
import {evidenceGuidance} from "./evidence-guidance";
import manifest from "./plugin-sources.json";

export const importedSources = manifest;

// Reviewed, anonymised content only. Original application records are not bundled or uploaded.
export const reviewMethod = [
  "Establish the route, talent or promise level, relevant criterion and the user's goal before assessing an example. For text review, ask what document it is and whether they want a full review or a specific check.",
  "Be direct and specific. Map each claim to its intended requirement, distinguish assertion from evidence, and identify what independent, attributable proof is missing. Do not give credit for intention or effort alone.",
  "For an excerpt actually pasted into the conversation, quote the user's exact words when explaining a weakness. Never claim to have opened a file, followed a link or reviewed unseen documents. Without text, ask for evidence context instead of inventing a review.",
  "When enough text is supplied for a review, organise the reply as Verdict, Requirement coverage, Rejection risks, Specific fixes, and What's strong. The verdict concerns the supplied excerpt's evidential strength, not the endorsement outcome. For ordinary chat, answer naturally and ask one or two focused questions.",
  "Map a risk only to the supplied guidance or an explicitly labelled lesson from case feedback. Case feedback is illustrative, not binding precedent, a universal exclusion, or a new eligibility rule. Do not invent successful examples or claim these cases prove what will happen to another applicant.",
  "Help the user organise real evidence and identify specific fixes. Do not fabricate achievements or produce submission-ready recommendation letters, personal statements or evidence documents. The supplied technology guide cautions against AI-generated application material; keep assistance to critique and preparation.",
  "Never convert a self-reported claim into verified evidence. Unknown requirements remain questions. Only praise strengths supported by the supplied facts, and flag uncertainty rather than stretching a criterion.",
] as const;

const technologyNotes = [
  "TECH-GUIDE: The evidence pack uses at least two distinct documents for mandatory recognition and two for each of two optional criteria, with at most ten evidence documents, each up to three A4 pages. Do not reuse a document across criteria. The CV is up to three A4 pages. Recommendations are separate from these evidence documents; check the official document guidance for current format requirements.",
  "TECH-GUIDE: The three recommendation letters should be specific to this application, explain the author's knowledge of the applicant, provide distinct achievement examples, and address talent or promise and future UK contribution. Check dates, signature, contact details, credentials and the three-page limit excluding credentials/contact details. Letters alone do not substantiate the evidence criteria.",
  "TECH-GUIDE: Technical expertise can be relevant in a non-technology organisation; business expertise needs a digital-product business context. Explain the actual work rather than deciding solely by job title. Product-led refers to a proprietary digital product/platform/service/hardware as the primary revenue source; generic service delivery is not equivalent.",
  "TECH-GUIDE: Mandatory recognition and two distinct optional categories are separate. Innovation concerns novelty; significant contribution concerns impact. Do not count the same example twice or treat two forms of innovation as two categories.",
  "TECH-GUIDE: Supporting evidence should make authorship, dates and personal work verifiable. Salary needs context and is insufficient alone. Self-published material, internal awards and general training do not by themselves establish independent recognition.",
  "TECH-GUIDE: Beyond-work contribution should be outside normal duties and relevant to advancing technology. Ask about payment, employer representation, programme selection and personal recognition. A general statement that the applicant mentors people is not enough; verify the current detailed guidance for specific activities.",
  "TECH-GUIDE: For innovation, describe novelty and corroboration, not just incorporation, forecasts or a business plan. A patent is an example, not a universal requirement; distinguish a granted patent from an application.",
  "TECH-GUIDE: A personal statement should connect the applicant's actual achievements to intended work and UK contribution. The applicant and referees must author their own truthful material; critique does not authorise fabricated or templated application documents.",
];
const caseLessons = [
  {id:"CASE-A-RECOGNITION",lesson:"An assessment and its later review distinguished supportive mandatory references from independent recognition. The review clarified that references need not themselves demonstrate sector-wide recognition. Community or educational contributions and non-tech publications were not categorically excluded; calibre, independence, selectivity and achievement-specific recognition were the concerns."},
  {id:"CASE-A-CONTRIBUTION",lesson:"Delivery of webinars or mentoring, attendance and appreciation were accepted as activity but did not establish recognised advancement of the field in that case. Ask what changed, whose contribution it was, and how independent evidence substantiates it. Do not invent a universal minimum audience or event count."},
  {id:"CASE-A-IMPACT",lesson:"The later review acknowledged multiple employers and initiatives, correcting an overly narrow description in the initial feedback. It still found inadequate attribution and significance of individual impact in qualifying product businesses. Do not infer a rule requiring multiple employers or penalising all short tenures."},
  {id:"CASE-B-TIMELINE",lesson:"A separate assessment raised an unexplained gap between education and the stated technology career, and inconsistent CV/public history. Ask for a complete timeline and an honest explanation, without assuming that a gap proves ineligibility."},
  {id:"CASE-B-EVIDENCE",lesson:"Promotional profiles, salary, general career mentoring and self-reported growth dashboards did not establish the claimed recognition and impact in that case. Ask for the metric's source, baseline, timeframe and corroboration, plus the applicant's attributable contribution. Do not categorically exclude a job title based on one assessment."},
];
const researchNotes = [
  "RESEARCH-OVERVIEW: The supplied GOV.UK overview distinguishes academic appointments, individual fellowships, UKRI endorsed-funder research and peer review. An exact eligible prestigious prize may bypass endorsement. Do not combine these pathways' requirements.",
  "RESEARCH-PEER: Peer review requires an eligible research field, active research and a PhD or equivalent experience, including industrial or clinical research. It does not require a job offer. Exceptional promise also requires an early career stage.",
  "RESEARCH-PEER: The first recommendation is from an eminent UK-resident expert who knows the applicant's work. Talent additionally requires a different senior UK-organisation expert's objective assessment, which must not be influenced by personal knowledge. Promise does not require that additional assessment.",
  "RESEARCH-PEER: A typed CV of up to three A4 pages and the required letters are the document set described in the supplied guide. Do not import the technology route's three recommenders or ten-evidence-document structure. Letters need dates, signatures, contact information and credentials as specified in official guidance.",
  "RESEARCH-PEER: Assess career history, reputation, impact, statements and intended UK research and wider contribution. For promise consider potential and significance relative to career stage; for talent consider leadership, prestigious recognition and significant research funding. These factors are not a mandatory checklist of every possible award or grant.",
];
export function pluginKnowledgeFor(route:Route){return {
  reviewMethod,
  coverage: route==="design"?"General review method only; no design-specific reference was supplied. Use the separate official design requirements.":"Route guidance and review method imported from the owner's plugin.",
  sourceIds: route==="digital-technology"?["REVIEW-INSTRUCTIONS","TECH-GUIDE","CASE-A","CASE-A-REVIEW","CASE-B"]:route==="academia-research"?["REVIEW-INSTRUCTIONS","RESEARCH-OVERVIEW","RESEARCH-PEER"]:["REVIEW-INSTRUCTIONS"],
  evidenceAdvice:evidenceGuidance[route]??{},
  routeNotes:route==="digital-technology"?technologyNotes:route==="academia-research"?researchNotes:[],
  caseLessons:route==="digital-technology"?caseLessons:[],
};}
