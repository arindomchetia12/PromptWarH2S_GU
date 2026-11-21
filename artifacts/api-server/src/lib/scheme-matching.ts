import type { ProfileAnswers, Scheme, SchemeCriteria, SchemeMatch } from "@workspace/api-zod";

type MatchStatus =
  | "potential_match"
  | "more_information_needed"
  | "does_not_appear_to_match";

type CriteriaCheck = {
  status: "match" | "unknown" | "mismatch";
  explanation: string;
};

const ageBands: Record<string, { min: number; max: number; label: string }> = {
  under18: { min: 0, max: 17, label: "Under 18" },
  "18to24": { min: 18, max: 24, label: "18–24 years" },
  "25to34": { min: 25, max: 34, label: "25–34 years" },
  "35to44": { min: 35, max: 44, label: "35–44 years" },
  "45to59": { min: 45, max: 59, label: "45–59 years" },
  "60plus": { min: 60, max: Number.POSITIVE_INFINITY, label: "60+ years" },
};

const friendlyValue: Record<string, string> = {
  rural: "rural / village area",
  urban: "urban / town area",
  student: "currently a student",
  not_student: "not currently a student",
  employed: "salaried / employed",
  unemployed: "not currently employed",
  self_employed: "self-employed",
  farmer: "farmer / cultivator",
};

/**
 * Step 3 of Webhook Flow: Edit Fields — clean and organize answers
 */
export function cleanAndOrganizeAnswers(input: ProfileAnswers): ProfileAnswers {
  const cleanedState = (input.state || "Assam").trim();
  const normalizedState =
    cleanedState.toLowerCase() === "not_sure" ||
    cleanedState.toLowerCase() === "prefer_not_to_say"
      ? cleanedState.toLowerCase()
      : cleanedState.replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    ageBand: input.ageBand,
    state: normalizedState,
    residence: input.residence,
    studentStatus: input.studentStatus,
    employmentStatus: input.employmentStatus,
  };
}

function compareList(
  answer: string | undefined,
  accepted: string[] | undefined,
  label: string,
): CriteriaCheck | undefined {
  if (!accepted?.length) return undefined;
  const acceptedText = accepted.map((v) => friendlyValue[v] ?? v).join(" or ");

  if (
    answer === undefined ||
    answer === "not_sure" ||
    answer === "prefer_not_to_say"
  ) {
    return {
      status: "unknown",
      explanation: `Confirm your ${label} (scheme requires: ${acceptedText}).`,
    };
  }
  const match = accepted.some((value) => value.toLowerCase() === answer.toLowerCase());
  const answerText = friendlyValue[answer] ?? answer;
  return match
    ? {
        status: "match",
        explanation: `Your ${label} (${answerText}) matches the scheme requirement.`,
      }
    : {
        status: "mismatch",
        explanation: `Requires ${label}: ${acceptedText} (you selected ${answerText}).`,
      };
}

/**
 * Step 5 of Webhook Flow: Code / If — check eligibility rules
 */
export function compareSchemeCriteria(
  answers: ProfileAnswers,
  criteria: SchemeCriteria,
  regions: string[],
): { status: MatchStatus; matchedCriteria: string[]; criteriaToCheck: string[] } {
  const checks: CriteriaCheck[] = [];
  const answerAge = ageBands[answers.ageBand];

  if (criteria.minAge != null || criteria.maxAge != null) {
    const minAge = criteria.minAge ?? 0;
    const maxAge = criteria.maxAge ?? Number.POSITIVE_INFINITY;
    const rangeLabel =
      criteria.minAge != null && criteria.maxAge != null
        ? `${criteria.minAge}–${criteria.maxAge} years`
        : criteria.minAge != null
          ? `${criteria.minAge}+ years`
          : `up to ${criteria.maxAge} years`;

    if (!answerAge) {
      checks.push({
        status: "unknown",
        explanation: `Check the scheme's age requirement (${rangeLabel}).`,
      });
    } else if (answerAge.max < minAge || answerAge.min > maxAge) {
      checks.push({
        status: "mismatch",
        explanation: `Age requirement is ${rangeLabel} (your selection: ${answerAge.label}).`,
      });
    } else if (answerAge.min >= minAge && answerAge.max <= maxAge) {
      checks.push({
        status: "match",
        explanation: `Your age group (${answerAge.label}) fits within ${rangeLabel}.`,
      });
    } else {
      checks.push({
        status: "unknown",
        explanation: `Your age range (${answerAge.label}) overlaps the requirement (${rangeLabel}); confirm your exact age.`,
      });
    }
  }

  checks.push(
    ...[
      compareList(
        answers.state,
        criteria.states ??
          (regions.some((region) => region.toLowerCase() === "all india")
            ? undefined
            : regions),
        "state or region",
      ),
      compareList(answers.residence, criteria.residences, "residence area"),
      compareList(answers.studentStatus, criteria.studentStatuses, "student status"),
      compareList(answers.employmentStatus, criteria.employmentStatuses, "work or occupation"),
      compareList(undefined, criteria.socialCategories, "social category"),
      compareList(undefined, criteria.gender, "gender"),
    ].filter((check): check is CriteriaCheck => Boolean(check)),
  );

  if (checks.length === 0) {
    return {
      status: "more_information_needed",
      matchedCriteria: [],
      criteriaToCheck: ["No structured criteria have been recorded; review the official source."],
    };
  }

  const hasMismatch = checks.some((check) => check.status === "mismatch");
  const hasUnknown = checks.some((check) => check.status === "unknown");
  const status: MatchStatus = hasMismatch
    ? "does_not_appear_to_match"
    : hasUnknown
      ? "more_information_needed"
      : "potential_match";

  return {
    status,
    matchedCriteria: checks
      .filter((check) => check.status === "match")
      .map((check) => check.explanation),
    criteriaToCheck: checks
      .filter((check) => check.status !== "match")
      .map((check) => check.explanation),
  };
}

const STATUS_PRIORITY: Record<MatchStatus, number> = {
  potential_match: 0,
  more_information_needed: 1,
  does_not_appear_to_match: 2,
};

/**
 * Step 6 of Webhook Flow: Sort — put the best matches first
 */
export function sortSchemeMatches(matches: SchemeMatch[]): SchemeMatch[] {
  return [...matches].sort((a, b) => {
    const rankDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
    if (rankDiff !== 0) return rankDiff;

    const matchedDiff = (b.matchedCriteria?.length ?? 0) - (a.matchedCriteria?.length ?? 0);
    if (matchedDiff !== 0) return matchedDiff;

    const checkDiff = (a.criteriaToCheck?.length ?? 0) - (b.criteriaToCheck?.length ?? 0);
    if (checkDiff !== 0) return checkDiff;

    return a.scheme.name.localeCompare(b.scheme.name);
  });
}

/**
 * Step 7 of Webhook Flow: Format — create simple explanations and application steps
 */
export function formatMatchExplanation(match: SchemeMatch): {
  summaryExplanation: string;
  nextSteps: string[];
  requiredDocuments: string[];
  officialApplicationUrl: string;
  officialInformationUrl: string;
} {
  const { scheme, status, matchedCriteria, criteriaToCheck } = match;
  let summaryExplanation = "";

  if (status === "potential_match") {
    summaryExplanation = `Based on your answers (${matchedCriteria.length} matching criteria), you appear to fit the main published requirements for ${scheme.name}.`;
  } else if (status === "more_information_needed") {
    summaryExplanation = `${scheme.name} may be relevant, but ${criteriaToCheck.length} requirement${criteriaToCheck.length === 1 ? " needs" : "s need"} to be checked on the official portal.`;
  } else {
    summaryExplanation = `One or more of your answers did not align with the recorded requirements for ${scheme.name}.`;
  }

  return {
    summaryExplanation,
    nextSteps: scheme.applicationSteps?.length
      ? scheme.applicationSteps
      : ["Visit the official portal to verify eligibility and submit your application."],
    requiredDocuments: scheme.requiredDocuments ?? [],
    officialApplicationUrl: scheme.applicationUrl,
    officialInformationUrl: scheme.informationUrl,
  };
}
