import "server-only";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { EligibilityResult } from "@/lib/eligibility/evaluate";
import { services } from "@/lib/services";

export type ReportSection = { heading: string; paragraphs: string[] };
export type Report = { title: string; subtitle: string; sections: ReportSection[] };
export function assessmentReport(result: EligibilityResult, createdAt: string): Report {
 const service = services.find((s) => s.id === result.recommendedService);
 return { title: "Your eligibility readiness report", subtitle: `${result.routeName} | ${result.pathway} | ${new Date(createdAt).toLocaleDateString("en-GB", {timeZone:"Europe/London"})}`,
 sections: [
  { heading: result.score === null ? "Pathway review" : `Readiness score: ${result.score}/100`, paragraphs: [result.headline,result.summary] },
  { heading: "Your next steps", paragraphs: [...result.checks.filter((c)=>c.status!=="met").map((c)=>`${c.label}: ${c.recommendation}`),...result.notes,...(result.checks.every((c)=>c.status==="met")?["Have your documents reviewed to confirm that the evidence supports the requirements you report meeting."]:[])] },
  { heading: "Your evidence checklist", paragraphs: result.checks.map((c)=>`${c.status==="met"?"Self-reported as met":c.status==="uncertain"?"Needs clarification":"Needs attention"} - ${c.label}`) },
  { heading: service ? `Recommended support: ${service.name}` : "Confirm your pathway", paragraphs: [result.recommendationReason] },
  { heading: "How to use this report", paragraphs: [result.scoreMethod==="profile-nine-v1"?"This preliminary nine-question profile score gives each question a maximum of one point, with half credit for partial evidence. It describes profile breadth, not all formal requirements. Salary alone and degree distinction alone earn no recognition or research credit. Research is optional if two other qualifying categories are met. Evidence is self-reported and unverified; this is not a visa decision or approval probability.":"This automated assessment is based on your answers, not a review of your documents or a personal verdict from Grace. Each checklist item has equal weight. A high percentage does not override a missing core requirement. This is not a visa decision or a probability of approval.",`Rules version: ${result.rulesVersion}. Retake the checker when your circumstances or official guidance change.`] },
  { heading: "Official sources", paragraphs: result.sources },
 ] };
}
export async function reportPdf(report: Report): Promise<Uint8Array> {
 const pdf=await PDFDocument.create(); pdf.registerFontkit(fontkit);
 const [normalBytes,boldBytes]=await Promise.all([readFile(join(process.cwd(),"public/assets/poppins-report-regular.ttf")),readFile(join(process.cwd(),"public/assets/poppins-report-semibold.ttf"))]);
 const normal=await pdf.embedFont(normalBytes,{subset:true}), bold=await pdf.embedFont(boldBytes,{subset:true});
 const allowed=new Set(normal.getCharacterSet());
 const clean=(value:string)=>Array.from(value.replace(/[\u0000-\u0008\u000b-\u001f]/g,"").replace(/[‐‑–—]/g,"-")).map((c)=>c==="\n"||allowed.has(c.codePointAt(0)!)?c:" ").join("");
 const ink=rgb(.059,.039,.012),gold=rgb(.56,.36,0),muted=rgb(.34,.32,.28); const width=595.28,height=841.89,margin=48,content=width-margin*2;
 let page:PDFPage;let y=0;
 function nextPage(){page=pdf.addPage([width,height]);page.drawRectangle({x:0,y:0,width,height,color:rgb(1,1,1)});page.drawRectangle({x:0,y:height-12,width,height:12,color:gold});page.drawText("LiterallyGlobal",{x:margin,y:height-47,size:13,font:bold,color:ink});page.drawText("YOUR TALENT. A BIGGER WORLD.",{x:margin,y:height-65,size:7.5,font:normal,color:muted});y=height-98;}
 function lines(text:string,font:PDFFont,size:number){
  const out:string[]=[];
  for(const paragraph of clean(text).split("\n")){
   let line="";
   for(const word of paragraph.split(/\s+/)){
    if(!word)continue;
    if(font.widthOfTextAtSize(word,size)>content){if(line){out.push(line);line="";} for(const char of word){if(font.widthOfTextAtSize(line+char,size)>content){out.push(line);line="";}line+=char;}continue;}
    const test=line?`${line} ${word}`:word;
    if(font.widthOfTextAtSize(test,size)>content){out.push(line);line=word;}else line=test;
   }
   out.push(line);
  }
  return out;
 }
 function text(value:string,size=10.5,font=normal,color=ink){for(const line of lines(value,font,size)){if(y<68)nextPage();page.drawText(line,{x:margin,y,size,font,color});y-=size*1.65;}y-=8;}
 nextPage();text(report.title,23,bold);text(report.subtitle,10,normal,muted);y-=8;
 for(const section of report.sections){if(y<140)nextPage();text(section.heading,13,bold,gold);for(const paragraph of section.paragraphs)text(paragraph);y-=10;}
 const pages=pdf.getPages();pages.forEach((p,index)=>{p.drawLine({start:{x:margin,y:44},end:{x:width-margin,y:44},thickness:.5,color:rgb(.83,.8,.74)});p.drawText("Private report | LiterallyGlobal",{x:margin,y:29,size:8,font:normal,color:muted});p.drawText(`${index+1} / ${pages.length}`,{x:width-margin-35,y:29,size:8,font:normal,color:muted});});
 pdf.setTitle(report.title);pdf.setAuthor("LiterallyGlobal");return pdf.save();
}
export async function pdfResponse(report:Report,filename:string){const bytes=await reportPdf(report);return new Response(new Uint8Array(bytes),{headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename="${filename}"`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});}
