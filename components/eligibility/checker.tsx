"use client";

import { UiIcon } from "@/components/ui-icon";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { questionsFor, validAnswer, selectedOptions, toggleAnswer, routes, RULES_VERSION, REVIEWED_ON, type Route, type Answers } from "@/lib/eligibility/questions";
import { ClientError, loadDraft, saveDraft, submitDraft, type Draft } from "@/lib/eligibility/draft";

export function EligibilityChecker({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  const [route, setRoute] = useState<Route | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [storageWarning, setStorageWarning] = useState(false);
  const draftIdentity = useRef({ createdAt: 0, submissionId: "" });
  const heading = useRef<HTMLHeadingElement>(null);
  const questions = route ? questionsFor(route, answers) : [];
  const question = questions[step];

  useEffect(() => {
    draftIdentity.current = { createdAt: Date.now(), submissionId: crypto.randomUUID() };
    try {
      const draft = loadDraft();
      if (draft) {
        setStarted(Object.keys(draft.answers).length > 0);
        setRoute(draft.route); setAnswers(draft.answers); setConsent(draft.consent);
        draftIdentity.current = { createdAt: draft.createdAt, submissionId: draft.submissionId };
        const all = questionsFor(draft.route, draft.answers);
        const incomplete = all.findIndex((item) => !validAnswer(item,draft.answers[item.id]));
        setStep(incomplete === -1 ? all.length : incomplete);
      }
    } catch { setStorageWarning(true); }
    setLoaded(true);
  }, []);
  useEffect(() => () => { if (advanceTimer.current) clearTimeout(advanceTimer.current); }, []);
  useEffect(() => {
    if (!loaded || !route) return;
    try { saveDraft({ ...draftIdentity.current, version: RULES_VERSION, route, answers, consent, completed: false }); }
    catch { setStorageWarning(true); }
  }, [route, answers, consent, loaded]);
  useEffect(() => { if (loaded && (route || step)) heading.current?.focus({ preventScroll: true }); }, [step, route, loaded]);

  function chooseRoute(value: Route) {
    setRoute(value); setAnswers({}); setStep(0); setStarted(value!=="digital-technology"); setConsent(false); setError("");
    draftIdentity.current = { createdAt: Date.now(), submissionId: crypto.randomUUID() };
  }
  function answer(value: string) {
    if (!route || !question) return;
    const next = { ...answers, [question.id]: toggleAnswer(question,answers[question.id],value) };
    const ids = new Set(questionsFor(route, next).map((item) => item.id));
    setAnswers(Object.fromEntries(Object.entries(next).filter(([id]) => ids.has(id))));
    draftIdentity.current.submissionId = crypto.randomUUID();
    setError("");
    if (route === "digital-technology" && question.type !== "multi") {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      setAdvancing(true);
      advanceTimer.current = setTimeout(() => { setStep(value => value + 1); setAdvancing(false); }, 300);
    }
  }
  function next(event: FormEvent) {
    event.preventDefault();
    if (!validAnswer(question,answers[question.id])) { setError("Choose an answer to continue."); return; }
    setError(""); setStep((value) => value + 1);
  }
  async function finish(event: FormEvent) {
    event.preventDefault();
    if (!route || !consent) { setError("Please acknowledge how we’ll save and email your result."); return; }
    const draft: Draft = { ...draftIdentity.current, version: RULES_VERSION, route, answers, consent: true, completed: true };
    setBusy(true); setError("");
    try {
      saveDraft(draft);
      if (signedIn) {
        const id = await submitDraft(draft);
        router.push(`/dashboard?assessment=${id}`); router.refresh();
      } else router.push("/signup?from=checker");
    } catch (caught) {
      if (caught instanceof ClientError && caught.status === 401) router.push("/login?from=checker");
      else setError(caught instanceof Error ? caught.message : "We couldn’t continue. Your answers are still here.");
    } finally { setBusy(false); }
  }

  if (!loaded) return <div className="checker-card" role="status">Preparing your checker…</div>;
  return (
    <div className={`checker-layout${route==="digital-technology"?" reference-checker":""}`}>
      <aside className="checker-aside">
        <p className="eyebrow">YOUR TALENT. A CLEARER DIRECTION.</p>
        <h1>Find your<br /><em>way forward.</em></h1>
        <p>A few questions about your work, recognition and evidence. Choose the answers you can support today.</p>
        <ol className="journey-list"><li className={!route ? "current" : "complete"}>Choose your route</li><li className={route && question ? "current" : ""}>Check your evidence</li><li className={route && !question ? "current" : ""}>{signedIn?"Save & see your result":"Sign up & see your result"}</li></ol>
        <div className="checker-explainer"><strong>What you’ll receive</strong><p>A personalised readiness score, gaps to address, and recommended next steps—saved to your account and sent to your verified email.</p></div>
        <p className="fine-print">Based on official guidance reviewed {REVIEWED_ON}. This is an initial endorsement check, not a visa decision or an approval prediction.</p>
      </aside>
      <div className="checker-card">
        {!route ? <>
          <p className="eyebrow">01 / YOUR ROUTE</p>
          <h2 ref={heading} tabIndex={-1}>Where does your work fit?</h2>
          <p>Choose a field to see the questions for that pathway.</p>
          <div className="route-options">{routes.map((item) => <button type="button" className="route-option" onClick={() => chooseRoute(item.id)} key={item.id}><span className="route-index">{item.mark}</span><span><strong>{item.name}</strong><span>{item.description}</span></span><span aria-hidden="true"><UiIcon name="arrow-up-right" /></span></button>)}</div>
          <p className="fine-print">Free to check. You’ll be asked to create an account at the end to view your result.</p>
        </> : !started ? <div className="checker-intro">
          <span className="checker-intro-icon" aria-hidden="true">✓</span>
          <h2 ref={heading} tabIndex={-1}>Are You Eligible for the UK Global Talent Visa?</h2>
          <p>Answer a few questions to find out if you could qualify for the UK Global Talent Visa (Digital Technology route) and get personalised recommendations.</p>
          <p className="fine-print">Takes less than 3 minutes</p>
          <button className="button button-gold" onClick={()=>setStarted(true)}>Start the Assessment <UiIcon name="arrow-right" /></button>
          <button className="text-button" onClick={()=>setRoute(null)}><UiIcon name="arrow-left" /> Choose another route</button>
        </div> : question ? <form onSubmit={next} key={question.id} className="checker-question-step">
          <div className="checker-progress-label"><span>Question {step + 1} of {questions.length}</span><span>{Math.round((step+1)/(questions.length+2)*100)}%</span></div>
          <progress value={step} max={questions.length} aria-label="Questions completed" />
          <h2 ref={heading} tabIndex={-1} id="question-title">{question.title}</h2>
          {question.help && <p id="question-help" className="question-help">{question.help}</p>}
          {question.hasSkillsLink&&<a className="official-link" href="https://www.gov.uk/government/publications/global-talent-endorsing-bodies/technical-or-business-skills-covered-by-tech-nation" target="_blank" rel="noreferrer">See full list of skills accepted <UiIcon name="arrow-up-right" /></a>}
          {question.reviewHelp&&<details className="checker-guidance"><summary>How this evidence is assessed</summary><p>{question.reviewHelp}</p></details>}
          {question.type==="multi"&&<p className="multi-select-hint">Select all that apply. “None of the above” clears other choices.</p>}
          <fieldset className="answer-options" aria-labelledby="question-title" aria-describedby={question.help ? "question-help" : undefined}>
            {question.options.map((option) => route==="digital-technology"&&question.type!=="multi"?<button type="button" className={`answer-option${answers[question.id]===option.value?" chosen":""}`} key={option.value} disabled={advancing} aria-pressed={answers[question.id]===option.value} onClick={()=>answer(option.value)}>{option.label}</button>:<label className={`answer-option${(question.type==="multi"?selectedOptions(answers[question.id]).includes(option.value):answers[question.id] === option.value) ? " chosen" : ""}`} key={option.value}><input type={question.type==="multi"?"checkbox":"radio"} name={question.id} value={option.value} checked={(question.type==="multi"?selectedOptions(answers[question.id]).includes(option.value):answers[question.id] === option.value)} onChange={() => answer(option.value)} /><span>{option.label}</span></label>)}
          </fieldset>
          {question.source && <a className="official-link" href={question.source} target="_blank" rel="noreferrer">Read the official guidance <span aria-hidden="true"><UiIcon name="arrow-up-right" /></span></a>}
          {error && <p role="alert" className="form-error">{error}</p>}
          <div className="form-actions"><button type="button" className="text-button" disabled={advancing} onClick={() => { setError(""); if (step === 0) {if(route==="digital-technology")setStarted(false);else setRoute(null);} else setStep((value) => value - 1); }}><UiIcon name="arrow-left" /> {step>0?"Previous question":"Back"}</button>{(route!=="digital-technology"||question.type==="multi")&&<button className="button button-dark" type="submit">{step === questions.length - 1 ? "Finish questions" : "Continue"} <span aria-hidden="true"><UiIcon name="arrow-right" /></span></button>}</div>
        </form> : <form onSubmit={finish}>
          <p className="eyebrow">YOUR QUESTIONS ARE COMPLETE</p>
          <h2 ref={heading} tabIndex={-1}>Your results are ready!</h2>
          <p>{signedIn ? "Save this assessment to see your updated score and next steps." : "Create your free account to see your eligibility readiness score, evidence gaps and personalised recommendations."}</p>
          <div className="completion-summary"><span>Selected route</span><strong>{routes.find((item) => item.id === route)?.name}</strong><span>{questions.length} questions answered</span></div>
          <label className="consent-label"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required /><span>Save my answers and email my result to my verified address. I’ve read the <Link href="/privacy" target="_blank">privacy notice</Link>.</span></label>
          <p className="fine-print">Your score reflects this checklist, not a government scoring system. Your result email is not a marketing subscription.</p>
          {error && <p role="alert" className="form-error">{error}</p>}
          <button type="submit" className="button button-gold full-width" disabled={busy}>{busy ? "Saving your assessment…" : signedIn ? "See my result" : "Sign up to see my result"}<span aria-hidden="true"><UiIcon name="arrow-up-right" /></span></button>
          <div className="form-actions"><button type="button" className="text-button" onClick={() => { setStep(0); setError(""); }}>Review my answers</button>{!signedIn && <Link href="/login?from=checker" onClick={() => { if (consent) saveDraft({ ...draftIdentity.current, version: RULES_VERSION, route, answers, consent, completed: true }); }}>Already have an account?</Link>}</div>
        </form>}
        {storageWarning && <p className="form-error">Your browser is blocking temporary storage. Enable it for this site to keep your answers through signup.</p>}
      </div>
    </div>
  );
}
