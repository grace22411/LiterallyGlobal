# Eligibility checker rules and sources

Rules version: `2026-10-02.4`. Research reviewed 1–2 October 2026. This is an endorsement evidence-readiness questionnaire, not a legal eligibility decision or approval prediction. It does not examine uploaded evidence, immigration history, suitability, identity, dependants or every visa-stage requirement.

The technology checker now follows the owner’s exact nine-question live reference. It is a short profile assessment and does not ask every formal requirement listed below. Unasked conditions are never treated as confirmed. See `ELIGIBILITY-KNOWLEDGE.md` for source verification and imported GTV Assistant guidance.

## Research mapping

| Pathway | Rules represented | Primary sources |
| --- | --- | --- |
| All routes | Adult applicant; exact eligible prestigious-prize exception. A qualifying prize may bypass endorsement and receives no endorsement score or automatic package recommendation. | [Global Talent overview](https://www.gov.uk/global-talent), [eligible prestigious-prize lists](https://www.gov.uk/government/publications/global-talent-eligible-prestigious-prize-lists) |
| Digital technology | Technical or digital-product business expertise; recent leader/potential-leader recognition; two distinct additional criteria among innovation, activity beyond work, significant contributions and research. Founder and employee innovation are alternatives within one criterion. Promise is normally associated with under five years in technology, not treated as an absolute cutoff. | [Eligibility](https://www.gov.uk/global-talent-digital-technology/eligibility) |
| Technology documents | Three qualifying expert letters with at least 12 months' knowledge of the work; CV; maximum ten evidence documents, up to three pages each, with distinct documents for mandatory and two additional criteria; business-connection evidence where relevant. | [Required documents](https://www.gov.uk/global-talent-digital-technology/documents-you-need-to-apply-endorsement) |
| DBA design | Supported design discipline, professional work within the past five years, internationally shown work, substantial record in two countries for talent or developing record in one for promise. At least two categories: media recognition, qualifying awards, or qualifying international appearances/publications/exhibitions. Award nomination/shortlisting is allowed for promise, whereas talent needs a qualifying win. Letter and document requirements are checked separately. | [GOV.UK design criteria](https://www.gov.uk/global-talent-arts-culture/design-industry), [DBA pathway information](https://www.dba.org.uk/the-global-talent-visa-for-design/) |
| Academic/research appointment | Accepted eligible appointment at an approved institution, role and qualification conditions, recruitment checks and HR/job-description evidence. | [Appointments](https://www.gov.uk/global-talent-researcher-academic/academic-or-researcher) |
| Individual fellowship | Exact approved fellowship held within the past five years and award-letter evidence. Fellowship classification determines talent/promise. No unrelated peer-review PhD or reference-letter gate is added. | [Fellowships](https://www.gov.uk/global-talent-researcher-academic/individual-fellowship) |
| UKRI endorsed funder | Approved funder and host; eligible grant structure; grant at least £30,000 over at least two years; at least one year left on the agreement; at least 50% time on qualifying work. Role-dependent qualifications, named lead/job-title and grant/HR evidence. Contributor requirements are not replaced by lead-researcher requirements. | [Endorsed funder](https://www.gov.uk/global-talent-researcher-academic/uk-research-innovation-endorsement) |
| Research peer review | Active researcher with PhD or equivalent research experience; leadership/potential; early career for promise; eminent UK-resident referee; additional objective senior UK assessment for talent; CV and UK contribution. No invented publication-count threshold. | [GOV.UK peer review](https://www.gov.uk/global-talent-researcher-academic/peer-review), [Royal Society peer review](https://royalsociety.org/grants/global-talent-visa-overview/route-4-peer-review/) |

The design checker covers the DBA pathway. Fashion and architecture are routed to their separate official guidance without a misleading DBA score. Other arts disciplines are not assessed by this questionnaire.

The linked Arts Council design-discipline guidance could not be fetched during research (HTTP 403). The form asks users to confirm their discipline against that live official list; it does not invent or embed an unverified list. The GOV.UK-linked Tech Nation Notion guide was unavailable, so the implemented technology rules rely on the accessible official GOV.UK criteria and document guidance. Exact award/fellowship/funder/institution lists remain live references rather than copied lists that could silently become stale.

## Nine-question technology score

Each of nine profile questions contributes up to one point, with half credit for partial answers. Two or more relevant recognition examples or outside-work activities earn the profile item’s full credit; these selections do not become separate official criteria. Salary alone and a distinction alone contribute no recognition/research credit. Research publications without supporting-proof selection receive partial profile credit. A missing research category is not an automatic core gap when two other optional categories are available.

The status separately considers relevant role, recognition examples, chosen talent/promise pathway and examples in two distinct optional categories. All evidence remains unverified. Missing age, referee-tenure, document-format and full-career information is disclosed rather than invented. Consultation is recommended to verify fit before a package commitment. Historic results keep their stored score and methodology.

## Other routes and historical checklist scoring

The server validates all answers against the selected route's current conditional questions, then creates requirement and evidence checks. A confirmed check receives one point; a gap or uncertain answer receives zero. A grouped requirement for two distinct categories receives `min(confirmed categories / 2, 1)`. The displayed score is the rounded percentage of available checklist points. All displayed checks have equal weight. This percentage is LiterallyGlobal's own checklist measure, not a Home Office scoring system.

A missing core requirement always produces `requirements-gap`, even with a high percentage. Uncertain criteria or an uncertain route produce `needs-clarification`; missing documents alone produce `evidence-to-build`. A fully affirmative checklist produces `ready-for-review`, never a promise of endorsement. Prize and out-of-scope design pathways have no numeric score.

Document readiness affects the service recommendation separately: document review for a ready draft, full support for preparation, a consultation for fundamental/uncertain route questions, or the ultimate development package where a technology/design track record needs work. The package does not guarantee eligibility. Report copies are calculated once on the server and stored with their rules version so the dashboard and email use the same result.

## Review limits

Answers are self-reported. The checker cannot verify quality, independence, dates, significance, exact discipline/list membership or whether evidence persuasively satisfies an endorsing body. Compound questions require the user to satisfy every condition stated; uncertain users should select “Not sure”. Official source links accompany questions, results and the email so users can check the detailed rules.

When updating rules, update the reviewed date/version, question branches, server evaluator and regression cases together. Test talent and promise separately, each research pathway, uncertain answers, prize exceptions and unsupported disciplines.
