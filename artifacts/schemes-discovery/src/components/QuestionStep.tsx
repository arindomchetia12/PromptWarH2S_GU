import { ArrowLeft, ArrowRight, Check, HelpCircle } from 'lucide-react';

export type QuestionChoice = {
  value: string;
  label: string;
  description?: string;
};

export type GuidedQuestion = {
  key: string;
  title: string;
  whyAsked: string;
  choices: QuestionChoice[];
};

export function QuestionStep({
  question,
  stepIndex,
  totalSteps,
  selectedValue,
  onSelect,
  onBack,
  onNext,
  isSubmitting,
}: {
  question: GuidedQuestion;
  stepIndex: number;
  totalSteps: number;
  selectedValue: string | undefined;
  onSelect: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
  isSubmitting: boolean;
}) {
  const progressPct = Math.round(((stepIndex + 1) / totalSteps) * 100);

  return (
    <section
      aria-labelledby="current-question-heading"
      className="rounded-2xl border border-[#1769AA]/25 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm font-bold">
          <span className="uppercase tracking-wider text-[#1769AA]">
            Step {stepIndex + 1} of {totalSteps}
          </span>
          <span className="text-[#123E67]">{progressPct}% complete</span>
        </div>
        <div
          className="h-2.5 overflow-hidden rounded-full bg-[#DCEFFA]"
          role="progressbar"
          aria-label="Guided questionnaire progress"
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-valuenow={stepIndex + 1}
        >
          <div
            className="h-full rounded-full bg-[#1769AA] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <h2
        id="current-question-heading"
        className="text-2xl font-extrabold text-[#123E67] sm:text-3xl"
      >
        {question.title}
      </h2>

      <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-[#F5F9FC] p-3.5 text-sm text-[#203040]">
        <HelpCircle size={18} className="mt-0.5 shrink-0 text-[#1769AA]" aria-hidden="true" />
        <p>
          <strong className="font-bold text-[#123E67]">Why we ask:</strong> {question.whyAsked}
        </p>
      </div>

      <fieldset className="mt-6">
        <legend className="sr-only">{question.title}</legend>
        <div className="grid gap-3 sm:grid-cols-2" role="radiogroup">
          {question.choices.map((choice) => {
            const checked = selectedValue === choice.value;
            return (
              <button
                key={choice.value}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => onSelect(choice.value)}
                className={`flex min-h-14 items-center justify-between gap-3 rounded-xl border-2 px-4 py-3.5 text-left text-base font-bold transition-all ${
                  checked
                    ? 'border-[#1769AA] bg-[#1769AA] text-white shadow-xs'
                    : 'border-[#1769AA]/20 bg-[#F5F9FC] text-[#123E67] hover:border-[#1769AA] hover:bg-[#DCEFFA]/60'
                }`}
                data-testid={`answer-${question.key}-${choice.value.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div>
                  <span className="block">{choice.label}</span>
                  {choice.description && (
                    <span
                      className={`mt-0.5 block text-xs font-medium ${
                        checked ? 'text-white/85' : 'text-[#203040]/75'
                      }`}
                    >
                      {choice.description}
                    </span>
                  )}
                </div>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                    checked
                      ? 'border-white bg-white text-[#1769AA]'
                      : 'border-[#1769AA]/40 bg-white'
                  }`}
                  aria-hidden="true"
                >
                  {checked && <Check size={15} strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#1769AA]/15 pt-5">
        <button
          type="button"
          onClick={onBack}
          disabled={stepIndex === 0 || isSubmitting}
          className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[#1769AA]/30 bg-white px-5 text-base font-bold text-[#123E67] hover:bg-[#DCEFFA] disabled:cursor-not-allowed disabled:opacity-40"
          data-testid="button-previous-question"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Back
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!selectedValue || isSubmitting}
          className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#1769AA] px-6 text-base font-bold text-white shadow-xs transition-colors hover:bg-[#123E67] disabled:cursor-not-allowed disabled:opacity-50"
          data-testid="button-next-question"
        >
          {isSubmitting
            ? 'Checking scheme rules…'
            : stepIndex === totalSteps - 1
              ? 'Find matching schemes'
              : 'Next question'}
          {!isSubmitting && <ArrowRight size={18} aria-hidden="true" />}
        </button>
      </div>
    </section>
  );
}
