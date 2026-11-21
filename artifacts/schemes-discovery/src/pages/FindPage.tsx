import { useMemo, useState } from 'react';
import type { ProfileAnswers, SchemeMatch } from '@workspace/api-client-react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  LayoutGrid,
  RotateCcw,
  ShieldCheck,
  Workflow,
} from 'lucide-react';
import { Link } from 'wouter';
import { MatchReason } from '../components/MatchReason';
import { OfficialSourceNotice } from '../components/OfficialSourceNotice';
import { QuestionStep, type GuidedQuestion } from '../components/QuestionStep';

interface PipelineStepTrace {
  step: number;
  node: string;
  detail: string;
}

interface WebhookMatchResponse {
  cleanedAnswers: ProfileAnswers;
  pipelineSteps: PipelineStepTrace[];
  matches: (SchemeMatch & {
    formatted?: {
      summaryExplanation: string;
      nextSteps: string[];
      requiredDocuments: string[];
      officialApplicationUrl: string;
      officialInformationUrl: string;
    };
  })[];
}

const FOCUS_QUESTION: GuidedQuestion = {
  key: 'focusCategory',
  title: 'What kind of support are you exploring today?',
  whyAsked:
    'Selecting a category lets Suvidha ask only the questions needed for those schemes.',
  choices: [
    {
      value: 'all',
      label: 'All available schemes',
      description: 'Check both Education and Agriculture schemes in Assam',
    },
    {
      value: 'Education',
      label: 'Education & scholarships',
      description: 'Awards, fee waivers, scholarships, and education loans',
    },
    {
      value: 'Agriculture',
      label: 'Agriculture & farmer support',
      description: 'Farm tools, crop insurance, credit subsidies, and solar pumps',
    },
  ],
};

const AGE_QUESTION: GuidedQuestion = {
  key: 'ageBand',
  title: 'Which age range fits you?',
  whyAsked: 'Many schemes specify a minimum or maximum age limit.',
  choices: [
    { value: 'under18', label: 'Under 18' },
    { value: '18to24', label: '18 to 24 years' },
    { value: '25to34', label: '25 to 34 years' },
    { value: '35to44', label: '35 to 44 years' },
    { value: '45to59', label: '45 to 59 years' },
    { value: '60plus', label: '60 years or above' },
    { value: 'not_sure', label: 'Not sure' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  ],
};

const STATE_QUESTION: GuidedQuestion = {
  key: 'state',
  title: 'Do you live in Assam?',
  whyAsked:
    'State schemes require permanent residence or domicile in Assam, while central schemes apply across India.',
  choices: [
    { value: 'Assam', label: 'Yes, I live in Assam' },
    { value: 'Other state in India', label: 'No, another state in India' },
    { value: 'not_sure', label: 'Not sure' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  ],
};

const RESIDENCE_QUESTION: GuidedQuestion = {
  key: 'residence',
  title: 'Do you live in a rural or urban area?',
  whyAsked:
    'Some agricultural and irrigation schemes specifically target rural or non-electrified village areas.',
  choices: [
    { value: 'rural', label: 'Rural / Village area' },
    { value: 'urban', label: 'Urban / Town or city' },
    { value: 'not_sure', label: 'Not sure' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  ],
};

const STUDENT_QUESTION: GuidedQuestion = {
  key: 'studentStatus',
  title: 'Are you currently a student?',
  whyAsked:
    'Scholarships, merit awards, and college fee waivers require active enrollment or recent exam completion.',
  choices: [
    { value: 'student', label: 'Yes, I am a student' },
    { value: 'not_student', label: 'No, not currently studying' },
    { value: 'not_sure', label: 'Not sure' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  ],
};

const EMPLOYMENT_QUESTION: GuidedQuestion = {
  key: 'employmentStatus',
  title: 'Which best describes your work situation?',
  whyAsked:
    'Farmer support, crop insurance, and credit schemes check whether you cultivate crops or work in farming.',
  choices: [
    { value: 'farmer', label: 'Farmer / Cultivator' },
    { value: 'self_employed', label: 'Self-employed / Small business' },
    { value: 'employed', label: 'Salaried / Employed' },
    { value: 'unemployed', label: 'Not currently employed' },
    { value: 'not_sure', label: 'Not sure' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  ],
};

export default function FindPage() {
  const [step, setStep] = useState(0);
  const [formState, setFormState] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [webhookResult, setWebhookResult] = useState<WebhookMatchResponse | null>(null);
  const [showNonMatches, setShowNonMatches] = useState(false);
  const [showPipelineTrace, setShowPipelineTrace] = useState(false);

  const focusCategory = formState.focusCategory ?? 'all';

  // Only ask details needed by the selected scheme categories
  const activeQuestions = useMemo<GuidedQuestion[]>(() => {
    if (focusCategory === 'Education') {
      return [FOCUS_QUESTION, AGE_QUESTION, STATE_QUESTION, STUDENT_QUESTION];
    }
    if (focusCategory === 'Agriculture') {
      return [
        FOCUS_QUESTION,
        AGE_QUESTION,
        STATE_QUESTION,
        RESIDENCE_QUESTION,
        EMPLOYMENT_QUESTION,
      ];
    }
    return [
      FOCUS_QUESTION,
      AGE_QUESTION,
      STATE_QUESTION,
      RESIDENCE_QUESTION,
      STUDENT_QUESTION,
      EMPLOYMENT_QUESTION,
    ];
  }, [focusCategory]);

  const currentQuestion = activeQuestions[Math.min(step, activeQuestions.length - 1)];
  const selectedValue = formState[currentQuestion.key];

  const handleSelect = (val: string) => {
    setFormState((prev) => ({ ...prev, [currentQuestion.key]: val }));
  };

  const submitToWebhook = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const payload: ProfileAnswers = {
        ageBand: (formState.ageBand ?? 'not_sure') as ProfileAnswers['ageBand'],
        state: formState.state ?? 'Assam',
        residence: (formState.residence ?? 'not_sure') as ProfileAnswers['residence'],
        studentStatus: (formState.studentStatus ??
          (focusCategory === 'Agriculture' ? 'not_student' : 'not_sure')) as ProfileAnswers['studentStatus'],
        employmentStatus: (formState.employmentStatus ??
          (focusCategory === 'Education' ? 'not_sure' : 'not_sure')) as ProfileAnswers['employmentStatus'],
      };

      // Webhook flow: Website form -> Webhook -> Edit Fields -> Database -> Code/If -> Sort -> Format -> Respond
      const res = await fetch('/api/webhook/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Could not evaluate matching schemes.');
      }

      const data = (await res.json()) as WebhookMatchResponse;
      setWebhookResult(data);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Something went wrong while matching schemes.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!selectedValue) return;
    if (step < activeQuestions.length - 1) {
      setStep((prev) => prev + 1);
    } else {
      submitToWebhook();
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(0, prev - 1));
  };

  const handleEditAnswers = () => {
    setWebhookResult(null);
    setStep(0);
  };

  const handleRestart = () => {
    setFormState({});
    setWebhookResult(null);
    setSubmitError(null);
    setStep(0);
    setShowNonMatches(false);
  };

  const relevantMatches = useMemo(() => {
    if (!webhookResult) return [];
    return webhookResult.matches.filter((m) => {
      const catOk =
        focusCategory === 'all' ||
        m.scheme.category.toLowerCase() === focusCategory.toLowerCase();
      return (
        catOk &&
        (m.status === 'potential_match' || m.status === 'more_information_needed')
      );
    });
  }, [webhookResult, focusCategory]);

  const otherMatches = useMemo(() => {
    if (!webhookResult) return [];
    const relevantIds = new Set(relevantMatches.map((m) => m.scheme.id));
    return webhookResult.matches.filter((m) => !relevantIds.has(m.scheme.id));
  }, [webhookResult, relevantMatches]);

  return (
    <div className="page-wrap py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/browse"
          className="inline-flex items-center gap-2 text-base font-bold text-[#1769AA] hover:text-[#123E67] hover:underline"
          data-testid="link-back-to-browse"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Browse all schemes
        </Link>

        {!webhookResult ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
            <aside className="rounded-2xl bg-[#123E67] p-6 text-white sm:p-7 on-dark">
              <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#DCEFFA]">
                Guided search
              </span>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight">
                Find schemes for me
              </h1>
              <p className="mt-3 text-base leading-relaxed text-[#DCEFFA]">
                Answer a few simple questions. Your answers are sent through our transparent rule-checking workflow to find schemes that may fit.
              </p>

              <div className="mt-6 space-y-3 border-t border-white/15 pt-5 text-sm text-[#DCEFFA]">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck size={18} className="mt-0.5 shrink-0 text-white" aria-hidden="true" />
                  <p>
                    <strong className="text-white">Private by design:</strong> We never ask for Aadhaar numbers, bank details, exact address, or documents.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-white" aria-hidden="true" />
                  <p>
                    You can choose <strong className="text-white">Not sure</strong> or{' '}
                    <strong className="text-white">Prefer not to say</strong> at any step.
                  </p>
                </div>
              </div>
            </aside>

            <div>
              <QuestionStep
                question={currentQuestion}
                stepIndex={step}
                totalSteps={activeQuestions.length}
                selectedValue={selectedValue}
                onSelect={handleSelect}
                onBack={handleBack}
                onNext={handleNext}
                isSubmitting={isSubmitting}
              />

              {submitError && (
                <div
                  role="alert"
                  className="mt-4 flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900"
                >
                  <CircleAlert size={19} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-bold">Could not check matching schemes</p>
                    <p className="mt-1">{submitError}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <section className="mt-6" aria-labelledby="match-results-heading">
            <div className="rounded-2xl border border-[#1769AA]/25 bg-white p-6 shadow-xs sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCEFFA] px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#123E67]">
                    <CheckCircle2 size={14} className="text-[#1769AA]" aria-hidden="true" />
                    Best matches sorted first
                  </span>
                  <h1
                    id="match-results-heading"
                    className="mt-3 text-3xl font-extrabold text-[#123E67] sm:text-4xl"
                  >
                    Schemes that may fit your answers
                  </h1>
                  <p className="mt-2 max-w-2xl text-base text-[#203040]" aria-live="polite">
                    Found <strong>{relevantMatches.length}</strong>{' '}
                    {relevantMatches.length === 1 ? 'scheme' : 'schemes'} marked as{' '}
                    <strong>Potential match</strong> or{' '}
                    <strong>More information needed</strong>.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleEditAnswers}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#1769AA]/30 bg-[#F5F9FC] px-4 py-2 text-sm font-bold text-[#123E67] hover:bg-[#DCEFFA]"
                    data-testid="button-change-answers"
                  >
                    Change answers
                  </button>
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#1769AA]/30 bg-white px-4 py-2 text-sm font-bold text-[#1769AA] hover:bg-[#DCEFFA]"
                    data-testid="button-start-over"
                  >
                    <RotateCcw size={15} aria-hidden="true" />
                    Start over
                  </button>
                </div>
              </div>

              {/* Transparent 8-step Webhook Flow trace */}
              <div className="mt-5 border-t border-[#1769AA]/15 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPipelineTrace((prev) => !prev)}
                  aria-expanded={showPipelineTrace}
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#1769AA] hover:text-[#123E67]"
                >
                  <Workflow size={16} aria-hidden="true" />
                  <span>How these results were generated (8-step matching flow)</span>
                  {showPipelineTrace ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showPipelineTrace && (
                  <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {webhookResult.pipelineSteps.map((s) => (
                      <li
                        key={s.step}
                        className="rounded-xl border border-[#1769AA]/20 bg-[#F5F9FC] p-3 text-xs"
                      >
                        <span className="font-extrabold text-[#1769AA]">
                          {s.step}. {s.node}
                        </span>
                        <p className="mt-1 text-[#203040]">{s.detail}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>

            <div className="mt-5">
              <OfficialSourceNotice />
            </div>

            {relevantMatches.length > 0 ? (
              <div className="mt-6 space-y-5">
                {relevantMatches.map((match) => (
                  <MatchReason key={match.scheme.id} match={match} />
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border-2 border-dashed border-[#1769AA]/30 bg-white p-8 text-center">
                <h2 className="text-xl font-extrabold text-[#123E67]">
                  No close matches found for those exact answers
                </h2>
                <p className="mx-auto mt-2 max-w-lg text-base text-[#203040]">
                  You can still explore the complete scheme catalogue or adjust your answers to see additional options.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleEditAnswers}
                    className="inline-flex min-h-11 items-center rounded-xl border border-[#1769AA] bg-white px-5 py-2.5 text-base font-bold text-[#1769AA] hover:bg-[#DCEFFA]"
                  >
                    Change answers
                  </button>
                  <Link
                    href="/browse"
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1769AA] px-5 py-2.5 text-base font-bold text-white hover:bg-[#123E67]"
                    data-testid="link-browse-after-empty"
                  >
                    <LayoutGrid size={17} aria-hidden="true" />
                    View complete scheme catalogue
                  </Link>
                </div>
              </div>
            )}

            {otherMatches.length > 0 && (
              <div className="mt-8 rounded-2xl border border-[#1769AA]/20 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#123E67]">
                      Other schemes in the catalogue ({otherMatches.length})
                    </h2>
                    <p className="text-sm text-[#203040]/80">
                      These schemes did not appear to match your answers or belong to another category.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setShowNonMatches((prev) => !prev)}
                      aria-expanded={showNonMatches}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[#1769AA]/30 bg-[#F5F9FC] px-4 text-sm font-bold text-[#123E67] hover:bg-[#DCEFFA]"
                    >
                      {showNonMatches ? 'Hide' : 'Show'} other schemes
                      {showNonMatches ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <Link
                      href="/browse"
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#1769AA] px-4 text-sm font-bold text-white hover:bg-[#123E67]"
                    >
                      View complete catalogue
                    </Link>
                  </div>
                </div>

                {showNonMatches && (
                  <div className="mt-5 space-y-4">
                    {otherMatches.map((match) => (
                      <MatchReason key={match.scheme.id} match={match} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
