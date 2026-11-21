import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, ArrowRight, Check, CircleAlert, RotateCcw, ShieldCheck } from 'lucide-react';
import { useMatchSchemes } from '@workspace/api-client-react';
import type { ProfileAnswers, SchemeMatch } from '@workspace/api-client-react';

type AnswerKey = keyof ProfileAnswers;
type Choice = { value: string; label: string };
type Question = { key: AnswerKey; title: string; help: string; choices: Choice[] };

const questions: Question[] = [
  { key: 'ageBand', title: 'Which age range are you in?', help: 'Some schemes set age ranges. Your answer is only compared with published criteria.', choices: [
    { value: 'under18', label: 'Under 18' }, { value: '18to24', label: '18–24' }, { value: '25to34', label: '25–34' }, { value: '35to44', label: '35–44' }, { value: '45to59', label: '45–59' }, { value: '60plus', label: '60 or above' }, { value: 'not_sure', label: 'Not sure' }, { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  ] },
  { key: 'state', title: 'Where do you live?', help: 'This helps identify schemes limited to a state or union territory.', choices: [
    ...['Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'].map((state) => ({ value: state, label: state })),
    { value: 'not_sure', label: 'Not sure' }, { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  ] },
  { key: 'residence', title: 'How would you describe your area?', help: 'Choose the closest option. Published scheme criteria can use rural or urban residence.', choices: [
    { value: 'rural', label: 'Rural' }, { value: 'urban', label: 'Urban' }, { value: 'not_sure', label: 'Not sure' }, { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  ] },
  { key: 'studentStatus', title: 'Are you currently a student?', help: 'This is used only to compare against criteria published in the scheme directory.', choices: [
    { value: 'student', label: 'Yes, I am a student' }, { value: 'not_student', label: 'No' }, { value: 'not_sure', label: 'Not sure' }, { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  ] },
  { key: 'employmentStatus', title: 'Which best describes your work situation?', help: 'Select the closest description. This answer does not affect any official application.', choices: [
    { value: 'employed', label: 'Employed' }, { value: 'unemployed', label: 'Not currently employed' }, { value: 'self_employed', label: 'Self-employed' }, { value: 'farmer', label: 'Farmer' }, { value: 'not_sure', label: 'Not sure' }, { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  ] },
];

const statusText: Record<SchemeMatch['status'], string> = {
  potential_match: 'Potential match',
  more_information_needed: 'More information needed',
  does_not_appear_to_match: 'Does not appear to match',
};

function MatchResult({ match }: { match: SchemeMatch }) {
  const statusId = `match-status-${match.scheme.id}`;
  return (
    <article className="rounded-2xl border border-border bg-card p-5 sm:p-6" data-testid={`card-match-${match.scheme.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><span id={statusId} className="inline-flex items-center rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-bold">{statusText[match.status]}</span><h3 className="display-font mt-4 text-2xl leading-tight">{match.scheme.name}</h3><p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{match.scheme.category} · {match.scheme.governmentLevel === 'central' ? 'Central' : 'State'} government</p></div>
        {match.scheme.demoData && <span className="rounded-full bg-[hsl(var(--accent))]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">Demo record</span>}
      </div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">This is a comparison with the criteria available here, not a decision by the scheme authority.</p>
      {match.matchedCriteria?.length > 0 && <div className="mt-4"><h4 className="text-sm font-bold">Criteria that appear to align</h4><ul className="mt-2 space-y-2">{match.matchedCriteria.map((criterion, index) => <li className="flex gap-2 text-sm leading-6 text-muted-foreground" key={`${criterion}-${index}`}><Check size={16} className="mt-1 shrink-0 text-primary" />{criterion}</li>)}</ul></div>}
      {match.criteriaToCheck?.length > 0 && <div className="mt-4 rounded-xl bg-secondary/70 p-4"><h4 className="text-sm font-bold">Still worth checking</h4><ul className="mt-2 space-y-2">{match.criteriaToCheck.map((criterion, index) => <li className="flex gap-2 text-sm leading-6 text-muted-foreground" key={`${criterion}-${index}`}><span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{criterion}</li>)}</ul></div>}
      <Link href={`/schemes/${match.scheme.id}`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline" data-testid={`link-match-details-${match.scheme.id}`}>Read scheme details <ArrowRight size={15} /></Link>
    </article>
  );
}

export default function FindPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<ProfileAnswers>>({});
  const matchMutation = useMatchSchemes();
  const activeQuestion = questions[step];
  const selected = answers[activeQuestion.key] as string | undefined;
  const hasResults = matchMutation.isSuccess && Array.isArray(matchMutation.data);
  const results = (matchMutation.data ?? []) as SchemeMatch[];

  const selectAnswer = (value: string) => setAnswers((current) => ({ ...current, [activeQuestion.key]: value }));
  const next = () => {
    if (!selected) return;
    if (step < questions.length - 1) setStep((current) => current + 1);
    else matchMutation.mutate({ data: answers as ProfileAnswers });
  };
  const restart = () => { setStep(0); setAnswers({}); matchMutation.reset(); };

  return (
    <div className="page-wrap py-10 sm:py-14">
      <div className="mx-auto max-w-[850px]">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground" data-testid="link-back-to-browse"><ArrowLeft size={16} /> Browse schemes</Link>
        {!hasResults ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[.72fr_1.28fr]">
            <aside className="rounded-2xl bg-primary p-6 text-primary-foreground sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[.14em] opacity-75">Find possible matches</p>
              <h1 className="display-font mt-4 text-4xl leading-[1.05] tracking-[-.03em]">A few answers.<br />A clearer next step.</h1>
              <p className="mt-5 text-sm leading-6 opacity-80">Compare the details you choose to share with the criteria available in the scheme directory.</p>
              <div className="mt-7 flex items-start gap-3 border-t border-primary-foreground/20 pt-5 text-xs leading-5 opacity-80"><ShieldCheck size={17} className="mt-0.5 shrink-0" />No account or application details are requested. Answers are used to run this comparison.</div>
              <div className="mt-7 text-xs leading-5 opacity-75">A match is guidance—not confirmation of eligibility or approval. Always check with the official department.</div>
            </aside>
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-8">
              <div className="mb-7">
                <div className="mb-3 flex items-center justify-between text-xs font-bold"><span className="uppercase tracking-[.12em] text-muted-foreground">Question {step + 1} of {questions.length}</span><span className="text-primary">{Math.round(((step + 1) / questions.length) * 100)}%</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-label="Questionnaire progress" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={step + 1}><div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div>
              </div>
              <h2 className="display-font text-3xl leading-tight tracking-[-.025em] sm:text-4xl">{activeQuestion.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{activeQuestion.help}</p>
              <fieldset className="mt-6">
                <legend className="sr-only">{activeQuestion.title}</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {activeQuestion.choices.map((choice) => {
                    const checked = selected === choice.value;
                    return <button key={choice.value} type="button" role="radio" aria-checked={checked} onClick={() => selectAnswer(choice.value)} className={`flex min-h-12 items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${checked ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:border-primary/60 hover:bg-secondary/50'}`} data-testid={`answer-${activeQuestion.key}-${choice.value.toLowerCase().replaceAll(' ', '-')}`}><span>{choice.label}</span>{checked && <Check size={16} aria-hidden="true" />}</button>;
                  })}
                </div>
              </fieldset>
              {matchMutation.isError && <div className="mt-5 flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm" role="alert"><CircleAlert size={18} className="shrink-0 text-destructive" /><div><p className="font-bold">We couldn’t compare your answers.</p><p className="mt-1 text-muted-foreground">Your answers are still on this page. Please try again.</p></div></div>}
              <div className="mt-7 flex items-center justify-between gap-3 border-t border-border pt-5">
                <button type="button" disabled={step === 0 || matchMutation.isPending} onClick={() => setStep((current) => Math.max(0, current - 1))} className="min-h-11 rounded-full px-4 text-sm font-bold text-muted-foreground hover:bg-secondary disabled:opacity-40" data-testid="button-previous-question">Back</button>
                <button type="button" disabled={!selected || matchMutation.isPending} onClick={next} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50" data-testid="button-next-question">{matchMutation.isPending ? 'Comparing criteria…' : step === questions.length - 1 ? 'Show possible matches' : 'Continue'}{!matchMutation.isPending && <ArrowRight size={16} />}</button>
              </div>
              <p className="mt-4 text-xs leading-5 text-muted-foreground">Every answer is required. “Not sure” and “Prefer not to say” are available where supported; choosing one may make matching less complete.</p>
            </section>
          </div>
        ) : (
          <section className="mt-8">
            <div className="rounded-3xl bg-[hsl(var(--secondary))] p-6 sm:p-9">
              <p className="eyebrow">Your comparison</p>
              <h1 className="display-font mt-3 text-4xl tracking-[-.035em] sm:text-5xl">Possible next steps</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">These results compare your answers with the criteria currently available. They do not confirm eligibility, guarantee benefits, or submit an application.</p>
            </div>
            <div className="mt-6 flex items-center justify-between gap-3"><p className="text-sm font-bold" aria-live="polite" data-testid="text-match-count">{results.length} {results.length === 1 ? 'scheme' : 'schemes'} returned</p><button type="button" onClick={restart} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-bold hover:bg-secondary" data-testid="button-start-over"><RotateCcw size={15} /> Start over</button></div>
            {results.length > 0 ? <div className="mt-4 space-y-4">{results.map((match) => <MatchResult key={match.scheme.id} match={match} />)}</div> : <div className="mt-4 rounded-2xl border border-dashed border-border bg-card p-9 text-center"><p className="display-font text-2xl">No results were returned</p><p className="mt-2 text-sm leading-6 text-muted-foreground">This does not mean no support is available. Browse the directory or contact the relevant department for guidance.</p><Link href="/" className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground" data-testid="link-browse-after-empty">Browse schemes</Link></div>}
             <div className="mt-6 flex gap-3 rounded-xl border border-border bg-card p-4 text-sm leading-6 text-muted-foreground"><CircleAlert className="mt-0.5 shrink-0 text-accent" size={18} /><p>Results are for discovery guidance only and do not confirm eligibility. Scheme rules can change. Check the official government source before applying.</p></div>
          </section>
        )}
      </div>
    </div>
  );
}
