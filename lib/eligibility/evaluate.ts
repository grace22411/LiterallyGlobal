import "server-only";
import {evaluate as evaluateLegacy,type EligibilityResult} from "./evaluate-v1";
import {questionsFor as legacyQuestionsFor} from "./questions-v1";
import {RULES_VERSION,type Route,type Answers} from "./questions";
import {validateAnswers} from "./schema";
import {knowledgeFor} from "@/lib/knowledge/gtv";
import {evidenceHelp} from "@/lib/knowledge/evidence-guidance";
import {evaluateTechnology} from "./evaluate-tech";
export type {EligibilityResult,Check} from "./evaluate-v1";
export function evaluate(route:Route,a:Answers):EligibilityResult{
 validateAnswers(route,a);
 if(route==="digital-technology")return evaluateTechnology(a);
 const answers=Object.fromEntries(legacyQuestionsFor(route,a).map(q=>[q.id,a[q.id]]));
 const result=evaluateLegacy(route,answers),knowledge=knowledgeFor(route);
 const checks=result.checks.map(check=>{const advice=evidenceHelp(route,check.id);return advice?{...check,recommendation:`${check.recommendation} Preparation focus: ${advice}`}:check;});
 return {...result,checks,rulesVersion:RULES_VERSION,notes:[...result.notes,`Guidance source: ${knowledge.name} (${knowledge.version}), reviewed ${knowledge.reviewedOn}. ${route==="design"?"Design requirements use official guidance; the plugin supplies the general review method.":"The plugin’s research guidance informs preparation advice; each research pathway keeps its own requirements."}`]};
}
