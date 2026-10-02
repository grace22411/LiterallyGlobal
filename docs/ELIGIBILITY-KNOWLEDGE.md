# Eligibility questions and shared knowledge

## Questionnaire source

The reference is https://graceajagbe.com/gtv/eligibility-checker. On 2 October 2026 the live HTML and deployed chunk `60fe8bd8b1665ab0.js` were downloaded successfully. A TypeScript parser extracted the nine-question literal without executing remote JavaScript. Exact titles, descriptions, option wording, order, single/multi-select types and the skills-link flag are in `lib/eligibility/tech-reference.json`. The deployed code confirms automatic progression after a single selection, explicit Continue for multi-select, Previous question, an intro and an end-of-form identity gate.

Interactive browser inspection could not be completed: computer use reported no browser, and an isolated Chrome launch failed. Do not describe this verification as having clicked through the live site. The deployed question data and transition code were inspected directly.

The new technology flow has exactly those nine questions with no additional age, prize, document-pack or conditional proof questions. It preserves LiterallyGlobal's signup and verified-email results rather than posting visitor details to the reference website. Official clarifications and imported preparation advice sit separately from the exact reference wording. Design and research retain direct route-specific questions and independent pathway requirements.

The live reference's additive activity score is not an official eligibility system. The new nine-question profile score retains full/partial answers and profile-breadth credit, but excludes salary alone and degree distinction alone from recognition/research credit. The server considers recognition examples and distinct optional categories separately when recommending review. It does not invent answers to omitted formal requirements, infer independent verification from a checkbox, or promise endorsement. Results, emails and downloads use the same saved report and explain these limits.

## Guidance sources

Reviewed on 2 October 2026:

- [Digital technology eligibility](https://www.gov.uk/global-talent-digital-technology/eligibility)
- [Technology endorsement documents](https://www.gov.uk/global-talent-digital-technology/documents-you-need-to-apply-endorsement)
- [Design industry](https://www.gov.uk/global-talent-arts-culture/design-industry)
- [Research peer review](https://www.gov.uk/global-talent-researcher-academic/peer-review)
- [Academic or research appointment](https://www.gov.uk/global-talent-researcher-academic/academic-or-researcher)
- [Individual fellowship](https://www.gov.uk/global-talent-researcher-academic/individual-fellowship)
- [UKRI endorsed funder](https://www.gov.uk/global-talent-researcher-academic/uk-research-innovation-endorsement)

`lib/knowledge/gtv.ts` provides shared official notes and provenance. The deterministic checker validates current answers and maps them to explicit requirement checks. Grace AI receives these same notes, route questions and optional saved assessment; it cannot invent a percentage or change the checker rules. The percentage is self-reported evidence readiness, not approval probability or an official visa score.

## Imported GTV Assistant plugin

Owner-provided GPT: https://chatgpt.com/g/g-68fbbc3a0cd08191b848705c539249d8-gtv-assistant.

Source folder: `/Users/grace/Downloads/plugin/skills/instructions`. Read its `SKILL.md`, technology DOCX, two research PDFs, one assessment PDF and ten feedback screenshots. All 14 references were reviewed; screenshots were visually read, PDFs extracted with PDFKit, and DOCX text read from its XML. No original client records are bundled, placed in public assets or uploaded to a provider.

The import is a reviewed, anonymised snapshot, not a live ChatGPT connection. `lib/knowledge/plugin-sources.json` records hashes for the instructions and all 14 references using anonymous IDs. Runtime context in `lib/knowledge/plugin.ts` applies the review method and supplies route-specific distilled lessons. `lib/knowledge/evidence-guidance.ts` supplies the same safe preparation advice to question help, deterministic reports and the AI. The full reviewer context is server-only; public help contains no case identities.

The two case studies are treated as illustrative feedback, not extra requirements or universal precedent. The later review's corrections take precedence over the initial case description: it acknowledged multiple initiatives/employers and clarified that recommendation letters themselves need not establish sector-wide recognition. No rule requiring multiple employers or excluding all community activity, general publications or a particular job title was inferred.

The technology guide snapshot includes older change-log material. Fees, processing times and outdated application procedures were not imported. The supplied guide cautions against AI-generated application material; Grace AI critiques and helps organise evidence rather than ghostwriting submission-ready documents. It reviews only text actually pasted in chat, not unseen uploaded files. No design-specific reference was supplied: design retains official requirements and uses the plugin's general review method only.

Grace AI receives this context with each request using the existing server-side Responses API. Original documents are not uploaded to a vector store. This bounded curated corpus does not require a new provider retrieval service or database migration. Future edits to the source plugin must be reviewed and imported again, with a new snapshot version.

## Versions and saved results

Current questionnaire/rules: `2026-10-02.4`. Shared guidance: `gtv-plugin-2026-10-02.1`. Technology score method: `profile-nine-v1`. Earlier question sets remain in `questions-v1.ts` and `questions-v2.ts` for historical labels; saved assessments are not rescored. The new draft key prevents legacy answers from being submitted as the nine-question form. Strict validation rejects unknown, omitted and irrelevant fields. New Grace AI reports save their rule version, knowledge source and knowledge version; older reports retain their original provenance.
