import { test } from "node:test";
import assert from "node:assert/strict";
import { PDFDocument } from "pdf-lib";
import { reportPdf,pdfResponse } from "../lib/reports/pdf";
test("downloadable reports embed working fonts and paginate long discussion text",async()=>{
 const report={title:"Your report",subtitle:"Digital technology • £1,000",sections:[{heading:"Your next steps",paragraphs:Array.from({length:32},()=>"A clear action plan with real evidence, recommendations and questions to explore. ".repeat(4))}]};
 const bytes=await reportPdf(report);const parsed=await PDFDocument.load(bytes);assert(parsed.getPageCount()>2);assert.equal(parsed.getTitle(),"Your report");
 const response=await pdfResponse({title:"Short report",subtitle:"Private",sections:[]},"report.pdf");assert.equal(response.headers.get("Content-Type"),"application/pdf");assert.equal(response.headers.get("Cache-Control"),"private, no-store");assert.match(response.headers.get("Content-Disposition")!,/^attachment;/);
});
