import reference from "./tech-reference.json";
import {questionsFor as previousQuestionsFor,questionsForVersion as previousQuestionsForVersion} from "./questions-v2";
import {sources,type Route,type Answers,type Question as PreviousQuestion} from "./questions-v2";
import {evidenceHelp} from "@/lib/knowledge/evidence-guidance";
export {sources,routes,yesNo,validAnswer,toggleAnswer,selectedOptions} from "./questions-v2";
export type {Route,Answers,Option} from "./questions-v2";
export type Question=PreviousQuestion&{reviewHelp?:string;hasSkillsLink?:boolean};
export const RULES_VERSION="2026-10-02.4";
export {REVIEWED_ON} from "./questions-v2";
export const DRAFT_KEY="literallyglobal.eligibility.draft.v3";
const clarifications:Record<string,string>={
 company_type:"This reference wording describes the product-company focus. Technical applicants may also qualify with relevant technical expertise in a non-technology organisation; business applicants need the appropriate digital-product context.",
 talent_route:"The 5+ years option describes your profile, not a universal minimum for exceptional talent. Promise usually concerns fewer than five years in technology, not only senior roles. A longer career in another field is possible.",
 evidence_impact:"These are examples to explore, not automatic proof. £30,000 is not an official salary threshold and salary alone earns no recognition credit in this checker.",
 innovation:"Revenue traction and accounts apply to relevant business claims. They are not blanket requirements for every employee demonstrating innovation in a new digital field.",
 outside_work:"Several activities still belong to one optional criterion; they do not count as several separate criteria.",
 academics:"A degree distinction alone is not the technology research criterion and earns no research credit. Relevant research needs peer or expert recognition.",
};
/** Exact titles, descriptions, option labels and ordering captured from the LIVE site's deployed JS. */
export const techCoreQuestions:Question[]=reference.map(q=>({id:q.id,type:q.type as "single"|"multi",title:q.title,help:q.description,options:q.options.map(o=>({value:o.value,label:o.label})),hasSkillsLink:"hasSkillsLink" in q&&q.hasSkillsLink===true,source:q.id==="recommendation_letters"?sources.techDocuments:sources.tech,reviewHelp:[clarifications[q.id],evidenceHelp("digital-technology",q.id)].filter(Boolean).join(" ")}));
export function questionsFor(route:Route,a:Answers):Question[]{return route==="digital-technology"?techCoreQuestions:previousQuestionsFor(route,a);}
export function questionsForVersion(route:Route,a:Answers,version:string):Question[]{return ["2026-10-01.1","2026-10-02.2","2026-10-02.3"].includes(version)?previousQuestionsForVersion(route,a,version):questionsFor(route,a);}
