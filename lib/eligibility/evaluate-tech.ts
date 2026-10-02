import "server-only";
import {questionsFor,selectedOptions,RULES_VERSION,sources,type Answers} from "./questions";
import type {EligibilityResult,Check} from "./evaluate-v1";
import {knowledgeFor} from "@/lib/knowledge/gtv";
import {evidenceHelp} from "@/lib/knowledge/evidence-guidance";
/** The nine-question flow does not ask about age, document format, referee tenure or independent proof.
 * Never invent those answers or call this a complete official requirement check.
 */
export function evaluateTechnology(a:Answers):EligibilityResult{
 const qs=questionsFor("digital-technology",a),knowledge=knowledgeFor("digital-technology");
 const recognition=selectedOptions(a.evidence_impact).filter(v=>!["none","high_salary"].includes(v));
 const outside=selectedOptions(a.outside_work).filter(v=>v!=="none");
 const academic=selectedOptions(a.academics);
 const strength=(v:string)=>v==="strong"?1:v==="some"?.5:0;
 const credits:Record<string,number>={
  company_type:a.company_type==="yes"?1:a.company_type==="partial"?.5:0,
  role_type:["tech_leader","biz_leader"].includes(a.role_type)?1:a.role_type==="mid_level"?.5:0,
  talent_route:["talent","promise"].includes(a.talent_route)?1:a.talent_route==="unsure"?.5:0,
  evidence_impact:Math.min(recognition.length/2,1),innovation:strength(a.innovation),
  outside_work:Math.min(outside.length/2,1),significant_contribution:strength(a.significant_contribution),
  academics:academic.includes("published")?(academic.includes("proof")?1:.5):0,
  recommendation_letters:a.recommendation_letters==="yes_3"?1:a.recommendation_letters==="some"?.5:0,
 };
 const labels:Record<string,string>={company_type:"Digital-product company experience",role_type:"Technical or business profile",talent_route:"Talent or promise pathway identified",evidence_impact:"Recognition examples identified",innovation:"Innovation evidence reported",outside_work:"Beyond-work activities identified",significant_contribution:"Significant contribution evidence reported",academics:"Research evidence identified",recommendation_letters:"Three recommenders identified"};
 const adviceIds:Record<string,string>={evidence_impact:"recognition",outside_work:"outside_proof",academics:"research_proof"};
 const checks:Check[]=qs.map(q=>({id:q.id,label:labels[q.id],kind:"evidence",credit:credits[q.id],status:credits[q.id]===1?"met":credits[q.id]===0?"gap":"uncertain",recommendation:evidenceHelp("digital-technology",adviceIds[q.id]??q.id)??q.reviewHelp??q.help??"Confirm the relevance and quality of your evidence.",source:q.source??sources.tech}));
 const categories=[a.innovation!=="none",outside.length>0,a.significant_contribution!=="none"&&a.company_type!=="no",academic.includes("published")].filter(Boolean).length;
 const roleGap=a.role_type==="non_tech"||(a.role_type==="biz_leader"&&a.company_type==="no");
 const missingCore=roleGap||recognition.length===0||categories<2||a.talent_route==="neither";
 const uncertain=a.talent_route==="unsure"||a.company_type==="partial";
 const status=missingCore?"requirements-gap":uncertain?"needs-clarification":a.recommendation_letters!=="yes_3"?"evidence-to-build":"ready-for-review";
 const score=Math.round(Object.values(credits).reduce((sum,n)=>sum+n,0)/9*100);
 const headline=status==="ready-for-review"?"Your profile is ready for a closer evidence review":status==="evidence-to-build"?"You have evidence to develop":status==="needs-clarification"?"Let’s clarify your route and evidence":"Build the missing parts of your profile";
 return {rulesVersion:RULES_VERSION,scoreMethod:"profile-nine-v1",route:"digital-technology",routeName:"Digital Technology",pathway:a.talent_route==="talent"?"Exceptional talent":a.talent_route==="promise"?"Exceptional promise":"Career stage to confirm",score,status,headline,
 summary:"This is a preliminary profile-readiness score from your nine answers, not an official eligibility decision or approval probability. Selected activities identify evidence to explore; its independence, relevance and quality have not been verified. You do not need every optional category to qualify.",checks,
 notes:[`You identified examples to explore in ${categories} distinct optional categories. Endorsement requires mandatory recognition plus two qualifying optional categories; several activities within one category remain one category.`,"This short check does not establish age eligibility, referee familiarity, document limits, full career dates or independent verification. Confirm those in an evidence review. A high score does not establish that these requirements are met.","Salary and a degree distinction alone did not earn recognition or research credit. The reference's £30,000 and 5+ years wording are profile prompts, not official qualifying thresholds.",...(a.company_type==="no"&&["tech_leader","mid_level"].includes(a.role_type)?["Technical expertise in a non-technology organisation may still be relevant. Your company answer does not automatically exclude you; clarify your actual work and chosen evidence categories."]:[]),...qs.filter(q=>["innovation","outside_work","significant_contribution"].includes(q.id)&&a[q.id]!=="none").map(q=>`Preparation focus: ${evidenceHelp("digital-technology",adviceIds[q.id]??q.id)}`),`Guidance source: ${knowledge.name} (${knowledge.version}), reviewed ${knowledge.reviewedOn}. Case lessons inform preparation advice, not new eligibility requirements.`],
 recommendedService:"consultation",recommendationReason:status==="ready-for-review"?"A consultation can verify your chosen criteria and evidence quality before recommending document review or full support.":"Clarify the evidence gaps and route first. This short profile check alone cannot confirm suitability for paid full support.",sources:[sources.tech,sources.techDocuments]};
}
