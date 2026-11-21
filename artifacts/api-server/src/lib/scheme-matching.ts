import type { ProfileAnswers, SchemeCriteria } from "@workspace/api-zod";

type MatchStatus =
  | "potential_match"
  | "more_information_needed"
  | "does_not_appear_to_match";

type CriteriaCheck = {
  status: "match" | "unknown" | "mismatch";
  explanation: string;
};

const ageBands: Record<string, { min: number; max: number }> = {
  under18: { min: 0, max: 17 },
  "18to24": { min: 18, max: 24 },
  "25to34": { min: 25, max: 34 },
  "35to44": { min: 35, max: 44 },
  "45to59": { min: 45, max: 59 },
  "60plus": { min: 60, max: Number.POSITIVE_INFINITY },
};

function compareList(
  answers: string | undefined,
  accepted: string[] | undefined,
  label: string,
): CriteriaCheck | undefined {
  if (!accepted?.length) return undefined;
  if (
    answers === undefined ||
    answers === "not_sure" ||
    answers === "prefer_not_to_say"
  ) {
    return {
      status: "unknown",
      explanation: `Check whether the scheme requires a specific ${label}.`,
    };
  }
  const match = accepted.some((value) => value.toLowerCase() === answers.toLowerCase());
  return match
    ? { status: "match", explanation: `${label} matches the listed criteria.` }
    : { status: "mismatch", explanation: `The listed ${label} does not match this answer.` };
}

export function compareSchemeCriteria(
  answers: ProfileAnswers,
  criteria: SchemeCriteria,
  regions: string[],
): { status: MatchStatus; matchedCriteria: string[]; criteriaToCheck: string[] } {
  const checks: CriteriaCheck[] = [];
  const answerAge = ageBands[answers.ageBand];

  if (criteria.minAge != null || criteria.maxAge != null) {
    if (!answerAge) {
      checks.push({
        status: "unknown",
        explanation: "Check the scheme's age requirement.",
      });
    } else {
      const minAge = criteria.minAge ?? 0;
      const maxAge = criteria.maxAge ?? Number.POSITIVE_INFINITY;
      if (answerAge.max < minAge || answerAge.min > maxAge) {
        checks.push({
          status: "mismatch",
          explanation: "This age range falls outside the listed age requirement.",
        });
      } else if (answerAge.min >= minAge && answerAge.max <= maxAge) {
        checks.push({
          status: "match",
          explanation: "This age range fits the listed age requirement.",
        });
      } else {
        checks.push({
          status: "unknown",
          explanation: "Your age range overlaps the requirement; check your exact age.",
        });
      }
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
      compareList(answers.residence, criteria.residences, "residence type"),
      compareList(answers.studentStatus, criteria.studentStatuses, "student status"),
      compareList(answers.employmentStatus, criteria.employmentStatuses, "employment status"),
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
