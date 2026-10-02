import {test} from "node:test";
import assert from "node:assert/strict";
import {knowledgeFor,knowledgeStatus} from "../lib/knowledge/gtv";
import {importedSources} from "../lib/knowledge/plugin";
import {questionsFor} from "../lib/eligibility/questions";
import {evaluate} from "../lib/eligibility/evaluate";
test("the imported snapshot records all 14 references plus the review instructions",()=>{
 assert.equal(knowledgeStatus.pluginConnected,true);assert.equal(importedSources.originalsBundled,false);
 assert.equal(importedSources.references.length,15);
 for(const source of importedSources.references){assert.match(source.sha256,/^[a-f0-9]{64}$/);assert(!JSON.stringify(source).includes("/Users/"));}
});
test("route knowledge isolates technology case lessons and research requirements",()=>{
 const tech=knowledgeFor("digital-technology"),research=knowledgeFor("academia-research"),design=knowledgeFor("design");
 assert(tech.plugin.caseLessons.length>=5);assert.equal(research.plugin.caseLessons.length,0);assert.equal(design.plugin.caseLessons.length,0);
 assert(research.plugin.routeNotes.some(n=>n.includes("does not require a job offer")));
 assert.match(design.plugin.coverage,/no design-specific reference/);
 for(const packet of [tech,research,design]){assert(!/URN\d|\d{4}-\d{4}-\d{4}-\d{4}|\/Users\/|WhatsApp Image/.test(JSON.stringify(packet)));}
});
test("checker and AI use the same imported evidence lessons without creating new scored questions",()=>{
 const qs=questionsFor("digital-technology",{});const a=Object.fromEntries(qs.map(q=>[q.id,q.type==="multi"?"none":q.options[0].value]));
 const r=evaluate("digital-technology",a);const packet=knowledgeFor("digital-technology");
 assert.equal(r.checks.find(c=>c.id==="significant_contribution")?.recommendation,packet.plugin.evidenceAdvice.significant_contribution);
 assert.equal(qs.length,9);assert(qs.find(q=>q.id==="recommendation_letters")?.reviewHelp?.includes(packet.plugin.evidenceAdvice.recommendation_letters));
 assert(r.notes.some(n=>n.includes(knowledgeStatus.version)));
});
