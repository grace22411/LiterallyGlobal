import type {Route} from "@/lib/eligibility/questions-v1";

/** Anonymised preparation advice distilled from the supplied plugin. Safe for question help and reports.
 * These prompts explain evidence quality; they are not new scoring criteria or automatic rejection rules.
 */
export const evidenceGuidance: Partial<Record<Route,Record<string,string>>> = {
  "digital-technology": {
    recognition: "Show who recognised your specific technology achievement, why their recognition carries weight, and how it extends beyond your immediate working circle. A promotional profile, job title, salary or participation certificate alone does not establish leadership.",
    innovation: "Explain what is genuinely new, your personal role and the evidence that verifies it. Distinguish a novel product or technical concept from routine delivery; company accounts alone do not demonstrate innovation.",
    outside_proof: "Show recognition of your personal contribution to advancing the field, with independent evidence of outcomes. Attendance, appreciation and general career advice alone do not establish that impact. Explain programme selection, your role, dates and verifiable results.",
    significant_contribution: "Separate your own contribution from team results. Link dated work to measurable outcomes, explain the baseline and period, and corroborate the figures. A dashboard screenshot or supportive letter without context may not substantiate the claim.",
    research_proof: "Show the research contribution and its expert or peer recognition. A degree distinction alone is insufficient; distinguish qualifying research from undergraduate or Master's thesis work. Explain your own contribution to any co-authored work.",
    recommendation_letters: "Choose three established technology experts who know your work for at least 12 months and can give different, specific examples. Keep recommendation letters distinct from evidence of recognition; the letters do not themselves have to prove sector-wide recognition.",
    techLetters: "Choose three established technology experts who know your work for at least 12 months and can give different, specific examples. Keep recommendation letters distinct from evidence of recognition; the letters do not themselves have to prove sector-wide recognition.",
    techPack: "Map each document to one criterion. Include verifiable dates, authorship and personal contribution, keep links working and exhibits readable, and reconcile the CV with your public career history. Use distinct documents within the official limits; letters alone are insufficient.",
    techExperience: "Show your full career timeline, including earlier non-technology work and any gaps. Explain changes of field rather than truncating your history to appear earlier in your technology career.",
  },
  "academia-research": {
    researchPath: "Check whether your appointment, exact fellowship or approved grant supports a specific endorsement pathway before choosing peer review. Technology endorsement's mandatory-plus-two-optional structure does not apply to research peer review.",
    researchRecognition: "Explain the significance of your research, your own contribution and its impact relative to your career stage. Prizes, funding and publications support the assessment; no fixed count automatically establishes leadership or potential.",
    ukReferee: "Use an eminent UK-resident expert who knows you and your work. The letter should explain your achievements, leadership or potential, future work and contribution to the UK, with the author's credentials and contact details.",
    objectiveLetter: "Exceptional talent peer review needs a separate objective assessment by a different eminent expert who is a senior member of a UK organisation. The assessment must not be influenced by personal knowledge of you. This extra letter is not required for exceptional promise.",
    researchCV: "Provide a clear career and publication history in a typed CV within three A4 pages. Make your intended UK research contribution specific. Follow the peer-review document list rather than adding the technology route's ten-document evidence pack.",
  },
};
export function evidenceHelp(route:Route,id:string){return evidenceGuidance[route]?.[id];}
