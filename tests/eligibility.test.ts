// Regression coverage for the retained v1 scoring kernel. Current question coverage is in eligibility-direct.test.ts.
import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluate } from "../lib/eligibility/evaluate-v1";
import { questionsFor, type Route, type Answers } from "../lib/eligibility/questions-v1";
import { submissionSchema, validateAnswers } from "../lib/eligibility/schema-v1";
import { reportEmail } from "../lib/eligibility/report-email";
import { services } from "../lib/services";

function complete(route: Route, overrides: Answers = {}): Answers {
  const defaults: Answers = { adult: "yes", prize: "no", track: "talent", techRole: "technical", techExperience: "under5", founder: "no", stage: "ready", researchPath: "peer", researchRole: "lead", designScope: "listed", ...overrides };
  const answers: Answers = {};
  for (let pass = 0; pass < 3; pass++) for (const question of questionsFor(route, { ...defaults, ...answers })) answers[question.id] = overrides[question.id] ?? defaults[question.id] ?? (question.options.some((option) => option.value === "yes") ? "yes" : question.options[0].value);
  return answers;
}

test("updated prices are shared by the homepage and dashboard", () => {
  assert.deepEqual(services.map((service) => service.price), ["£199.99", "£1,000", "£2,500", "£4,950"]);
  assert.equal(services[2].name, "Full support");
});
test("technology requires mandatory recognition even when all other answers are positive", () => {
  const result = evaluate("digital-technology", complete("digital-technology", { recognition: "no" }));
  assert.equal(result.status, "requirements-gap");
  assert.notEqual(result.status, "ready-for-review");
});
test("one technology optional category cannot satisfy the two-category requirement", () => {
  const result = evaluate("digital-technology", complete("digital-technology", { innovation: "yes", beyondWork: "no", impact: "no", research: "no" }));
  assert.equal(result.checks.find((check) => check.id === "techOptional")?.credit, 0.5);
  assert.equal(result.status, "requirements-gap");
});
test("any two different optional categories work; unselected alternatives are not blockers", () => {
  const result = evaluate("digital-technology", complete("digital-technology", { innovation: "no", beyondWork: "yes", impact: "yes", research: "no" }));
  assert.equal(result.status, "ready-for-review");
  assert.equal(result.score, 100);
});
test("promise technology experience is advisory, not an invented hard five-year cutoff", () => {
  const result = evaluate("digital-technology", complete("digital-technology", { track: "promise", techExperience: "fiveplus" }));
  assert.equal(result.status, "ready-for-review");
  assert(result.notes.some((note) => note.includes("not an automatic exclusion")));
});
test("unconfirmed conditions remain uncertain rather than becoming positive answers", () => {
  const result = evaluate("digital-technology", complete("digital-technology", { recognition: "unsure" }));
  assert.equal(result.status, "needs-clarification");
});
test("application drafting stage affects recommendations, not eligibility score", () => {
  const ready = evaluate("digital-technology", complete("digital-technology"));
  const starting = evaluate("digital-technology", complete("digital-technology", { stage: "starting" }));
  assert.equal(ready.score, starting.score);
  assert.equal(ready.recommendedService, "document-review");
  assert.equal(starting.recommendedService, "done-with-you");
});
test("an age requirement cannot be overridden by a high checklist percentage", () => {
  const result = evaluate("digital-technology", complete("digital-technology", { adult: "no" }));
  assert.equal(result.status, "requirements-gap");
  assert.equal(result.recommendedService, "consultation");
});
test("founders must answer the additional business-proof question", () => {
  const answers = complete("digital-technology", { founder: "yes" });
  delete answers.businessProof;
  assert.throws(() => evaluate("digital-technology", answers), /connection to that technology business/);
});
test("design needs two evidence categories, with talent/promise wording distinguished", () => {
  assert.equal(evaluate("design", complete("design", { designMedia: "no", designAwards: "yes", designExhibitions: "no" })).status, "requirements-gap");
  assert(questionsFor("design", { track: "promise", prize: "no" }).find((question) => question.id === "designAwards")?.title.includes("shortlisted"));
  assert(!questionsFor("design", { track: "talent", prize: "no" }).find((question) => question.id === "designAwards")?.title.includes("shortlisted"));
});
test("fashion and architecture do not receive a misleading DBA design score", () => {
  for (const discipline of ["fashion", "architecture"]) {
    const result = evaluate("design", complete("design", { designScope: discipline }));
    assert.equal(result.status, "outside-scope"); assert.equal(result.score, null);
  }
});
test("eligible prize pathway is separately flagged without an endorsement score or package upsell", () => {
  const result = evaluate("digital-technology", complete("digital-technology", { prize: "yes" }));
  assert.equal(result.status, "prize-pathway"); assert.equal(result.score, null); assert.equal(result.recommendedService, null);
});
test("fellowship pathway does not accidentally apply the peer-review requirements", () => {
  const answers = complete("academia-research", { researchPath: "fellowship" });
  assert(!("phd" in answers)); assert(!("ukReferee" in answers));
  assert.equal(evaluate("academia-research", answers).status, "ready-for-review");
  assert.equal(evaluate("academia-research", { ...answers, fellowship: "no" }).status, "requirements-gap");
});
test("academic appointment needs recruitment evidence", () => {
  assert.equal(evaluate("academia-research", complete("academia-research", { researchPath: "appointment", recruitment: "no" })).status, "requirements-gap");
});
test("UKRI grant thresholds are independent requirements", () => {
  for (const key of ["grant", "contract", "grantTime", "funder", "host", "awardType"]) {
    assert.equal(evaluate("academia-research", complete("academia-research", { researchPath: "funded", [key]: "no" })).status, "requirements-gap", key);
  }
});
test("UKRI research contributor is not asked for the lead-only naming rule", () => {
  const answers = complete("academia-research", { researchPath: "funded", researchRole: "contributor" });
  assert(!("namedOnGrant" in answers)); assert.equal(evaluate("academia-research", answers).status, "ready-for-review");
});
test("peer review talent needs the extra objective letter; promise needs early career", () => {
  const talent = complete("academia-research", { objectiveLetter: "no" });
  assert.equal(evaluate("academia-research", talent).status, "evidence-to-build");
  const promise = complete("academia-research", { track: "promise", earlyCareer: "no" });
  assert(!("objectiveLetter" in promise)); assert.equal(evaluate("academia-research", promise).status, "requirements-gap");
});
test("incomplete, unknown, cross-route and forged-score payloads are rejected", () => {
  const answers = complete("digital-technology");
  assert.throws(() => validateAnswers("digital-technology", { ...answers, irrelevant: "yes" }));
  assert.throws(() => validateAnswers("digital-technology", { ...answers, recognition: "100" }));
  delete answers.recognition; assert.throws(() => validateAnswers("digital-technology", answers));
  assert(!submissionSchema.safeParse({ submissionId: crypto.randomUUID(), route: "digital-technology", answers: complete("digital-technology"), consent: true, score: 100 }).success);
  assert(!submissionSchema.safeParse({ submissionId: crypto.randomUUID(), route: "design", answers: complete("design"), consent: false }).success);
});
test("email includes the computed score, recommendations, sources and safely escaped content", () => {
  const result = evaluate("digital-technology", complete("digital-technology", { recognition: "no" }));
  result.notes.push('<img src=x onerror="alert(1)">');
  const email = reportEmail(result, "https://example.com/dashboard");
  assert(email.text.includes(`${result.score}/100`));
  assert(email.text.includes(result.recommendationReason));
  assert(email.html.includes("&lt;img")); assert(!email.html.includes("<img src=x"));
  assert(email.text.includes("https://www.gov.uk/"));
});
