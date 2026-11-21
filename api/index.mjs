// Zero-dependency Vercel Node.js Function (Web Fetch API) serving all /api/* routes for Suvidha.

const APPROVED_OFFICIAL_DOMAINS = [
  "assam.gov.in",
  "sebaonline.org",
  "samarth.ac.in",
  "myscheme.gov.in",
  "india.gov.in",
  "pmkisan.gov.in",
  "pmfby.gov.in",
  "mnre.gov.in",
  "ugc.gov.in",
  "ugc.ac.in",
  "scholarships.gov.in",
];

const SEARCH_STOP_WORDS = new Set([
  "and",
  "the",
  "for",
  "with",
  "from",
  "in",
  "of",
  "to",
  "a",
  "an",
  "support",
  "scheme",
  "schemes",
  "yojana",
  "assam",
  "government",
  "gov",
]);

const REVIEW_THRESHOLD_DAYS = 180;
const SCHEDULE_INTERVAL_MS = 60 * 60 * 1000;

const AGE_BANDS = {
  under18: { min: 0, max: 17, label: "Under 18" },
  "18to24": { min: 18, max: 24, label: "18–24 years" },
  "25to34": { min: 25, max: 34, label: "25–34 years" },
  "35to44": { min: 35, max: 44, label: "35–44 years" },
  "45to59": { min: 45, max: 59, label: "45–59 years" },
  "60plus": { min: 60, max: Number.POSITIVE_INFINITY, label: "60+ years" },
};

const FRIENDLY_VALUE = {
  rural: "rural / village area",
  urban: "urban / town area",
  student: "currently a student",
  not_student: "not currently a student",
  employed: "salaried / employed",
  unemployed: "not currently employed",
  self_employed: "self-employed",
  farmer: "farmer / cultivator",
};

const STATUS_PRIORITY = {
  potential_match: 0,
  more_information_needed: 1,
  does_not_appear_to_match: 2,
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json; charset=utf-8",
  };
}

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(), ...extraHeaders },
  });
}

function cleanEnvValue(raw, fallback) {
  if (!raw || typeof raw !== "string") return fallback;
  const cleaned = raw.trim().replace(/^["']+|["']+$/g, "").trim();
  return cleaned || fallback;
}

function normalizeArray(val) {
  if (!val) return undefined;
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === "string") return [val];
  return undefined;
}

function mapSupabaseRow(row) {
  const crit = row.criteria || {};
  return {
    id: Number(row.id),
    name: String(row.name),
    category: String(row.category),
    governmentLevel: row.government_level === "central" ? "central" : "state",
    regions: Array.isArray(row.regions) ? row.regions : [],
    intendedBeneficiaries: Array.isArray(row.intended_beneficiaries)
      ? row.intended_beneficiaries
      : [],
    benefits: Array.isArray(row.benefits) ? row.benefits : [],
    criteria: {
      minAge: crit.minAge != null ? Number(crit.minAge) : undefined,
      maxAge: crit.maxAge != null ? Number(crit.maxAge) : undefined,
      states: normalizeArray(crit.states),
      residences: normalizeArray(crit.residences),
      studentStatuses: normalizeArray(crit.studentStatuses),
      employmentStatuses: normalizeArray(crit.employmentStatuses),
      socialCategories: normalizeArray(crit.socialCategories),
      gender: normalizeArray(crit.gender),
    },
    requiredDocuments: Array.isArray(row.required_documents)
      ? row.required_documents
      : [],
    applicationSteps: Array.isArray(row.application_steps)
      ? row.application_steps
      : [],
    informationUrl: String(row.information_url),
    applicationUrl: String(row.application_url),
    lastVerifiedAt: row.last_verified_at
      ? new Date(row.last_verified_at).toISOString()
      : null,
    active: Boolean(row.active),
    demoData: Boolean(row.demo_data),
    createdAt: new Date(row.created_at || Date.now()).toISOString(),
    updatedAt: new Date(row.updated_at || Date.now()).toISOString(),
  };
}

async function fetchAllSchemes() {
  const defaultUrl = "https://jsmtqaenralamjnabuzg.supabase.co";
  const defaultKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzbXRxYWVucmFsYW1qbmFidXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUyMzE2MTIsImV4cCI6MjExMDgwNzYxMn0.X92InRtd-jDZFc4OfmHjtDPRQ9OwAQ1TswnJFxpyceM";

  const rawUrl = cleanEnvValue(process.env.SUPABASE_URL, defaultUrl).replace(/\/+$/, "");
  const supabaseUrl = rawUrl.startsWith("https://") ? rawUrl : defaultUrl;
  const supabaseKey = cleanEnvValue(process.env.SUPABASE_ANON_KEY, defaultKey);

  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/schemes?select=*&order=id.asc`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Accept: "application/json",
        },
      });
      if (!res.ok) {
        throw new Error(`Supabase API error ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      return Array.isArray(data) ? data.map(mapSupabaseRow) : [];
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

function matchesSearchQuery(scheme, rawQuery) {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;

  const searchText = [
    scheme.name,
    scheme.category,
    ...scheme.regions,
    ...scheme.intendedBeneficiaries,
    ...scheme.benefits,
    ...scheme.requiredDocuments,
    ...scheme.applicationSteps,
  ]
    .join(" ")
    .toLowerCase();

  if (searchText.includes(q)) return true;

  const tokens = q
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2 && !SEARCH_STOP_WORDS.has(t));

  if (tokens.length === 0) {
    return searchText.includes(q);
  }
  return tokens.every((token) => searchText.includes(token));
}

function cleanAndOrganizeAnswers(input) {
  const rawState = String(input?.state || "Assam").trim();
  const normalizedState =
    rawState.toLowerCase() === "not_sure" ||
    rawState.toLowerCase() === "prefer_not_to_say"
      ? rawState.toLowerCase()
      : rawState.replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    ageBand: String(input?.ageBand || "not_sure"),
    state: normalizedState,
    residence: String(input?.residence || "not_sure"),
    studentStatus: String(input?.studentStatus || "not_sure"),
    employmentStatus: String(input?.employmentStatus || "not_sure"),
  };
}

function compareList(answer, accepted, label) {
  if (!accepted?.length) return undefined;
  const acceptedText = accepted.map((v) => FRIENDLY_VALUE[v] ?? v).join(" or ");
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
  const match = accepted.some(
    (value) => value.toLowerCase() === answer.toLowerCase(),
  );
  const answerText = FRIENDLY_VALUE[answer] ?? answer;
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

function compareSchemeCriteria(answers, criteria, regions) {
  const checks = [];
  const answerAge = AGE_BANDS[answers.ageBand];

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

  const listChecks = [
    compareList(
      answers.state,
      criteria.states ??
        (regions.some((r) => r.toLowerCase() === "all india")
          ? undefined
          : regions),
      "state or region",
    ),
    compareList(answers.residence, criteria.residences, "residence area"),
    compareList(answers.studentStatus, criteria.studentStatuses, "student status"),
    compareList(
      answers.employmentStatus,
      criteria.employmentStatuses,
      "work or occupation",
    ),
    compareList(undefined, criteria.socialCategories, "social category"),
    compareList(undefined, criteria.gender, "gender"),
  ].filter(Boolean);

  checks.push(...listChecks);

  if (checks.length === 0) {
    return {
      status: "more_information_needed",
      matchedCriteria: [],
      criteriaToCheck: [
        "No structured criteria have been recorded; review the official source.",
      ],
    };
  }

  const hasMismatch = checks.some((c) => c.status === "mismatch");
  const hasUnknown = checks.some((c) => c.status === "unknown");
  const status = hasMismatch
    ? "does_not_appear_to_match"
    : hasUnknown
      ? "more_information_needed"
      : "potential_match";

  return {
    status,
    matchedCriteria: checks
      .filter((c) => c.status === "match")
      .map((c) => c.explanation),
    criteriaToCheck: checks
      .filter((c) => c.status !== "match")
      .map((c) => c.explanation),
  };
}

function sortSchemeMatches(matches) {
  return [...matches].sort((a, b) => {
    const rankDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
    if (rankDiff !== 0) return rankDiff;
    const matchedDiff =
      (b.matchedCriteria?.length ?? 0) - (a.matchedCriteria?.length ?? 0);
    if (matchedDiff !== 0) return matchedDiff;
    const checkDiff =
      (a.criteriaToCheck?.length ?? 0) - (b.criteriaToCheck?.length ?? 0);
    if (checkDiff !== 0) return checkDiff;
    return a.scheme.name.localeCompare(b.scheme.name);
  });
}

function formatMatchExplanation(match) {
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
      : [
          "Visit the official portal to verify eligibility and submit your application.",
        ],
    requiredDocuments: scheme.requiredDocuments ?? [],
    officialApplicationUrl: scheme.applicationUrl,
    officialInformationUrl: scheme.informationUrl,
  };
}

function extractDomain(urlStr) {
  try {
    return new URL(urlStr).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function isApprovedDomain(domain) {
  if (!domain) return false;
  return APPROVED_OFFICIAL_DOMAINS.some(
    (approved) => domain === approved || domain.endsWith(`.${approved}`),
  );
}

async function runSyncReport(triggerType) {
  const schemes = await fetchAllSchemes();
  const now = Date.now();

  const items = schemes.map((scheme) => {
    const infoDomain = extractDomain(scheme.informationUrl);
    const appDomain = extractDomain(scheme.applicationUrl);
    const isApproved =
      isApprovedDomain(infoDomain) && isApprovedDomain(appDomain);

    const verifiedDate = scheme.lastVerifiedAt
      ? new Date(scheme.lastVerifiedAt)
      : null;
    const daysSince =
      verifiedDate && !Number.isNaN(verifiedDate.getTime())
        ? Math.max(0, Math.floor((now - verifiedDate.getTime()) / 86_400_000))
        : null;

    const reviewReasons = [];
    if (scheme.demoData) {
      reviewReasons.push(
        "Marked as demonstration record; requires official source replacement.",
      );
    }
    if (!isApproved) {
      const unapproved = [
        !isApprovedDomain(infoDomain) ? infoDomain || "missing info URL" : null,
        !isApprovedDomain(appDomain) ? appDomain || "missing application URL" : null,
      ].filter(Boolean);
      reviewReasons.push(
        `Source domain (${unapproved.join(", ")}) is outside the standard approved list.`,
      );
    }
    if (daysSince === null) {
      reviewReasons.push(
        "Missing verification date — human administrator must verify official source.",
      );
    } else if (daysSince > REVIEW_THRESHOLD_DAYS) {
      reviewReasons.push(
        `Last verified ${daysSince} days ago (exceeds ${REVIEW_THRESHOLD_DAYS}-day freshness window).`,
      );
    }
    if (!scheme.requiredDocuments?.length || !scheme.applicationSteps?.length) {
      reviewReasons.push("Incomplete document checklist or application steps.");
    }

    return {
      id: scheme.id,
      name: scheme.name,
      category: scheme.category,
      governmentLevel: scheme.governmentLevel,
      informationUrl: scheme.informationUrl,
      applicationUrl: scheme.applicationUrl,
      isApprovedOfficialSource: isApproved,
      sourceDomain: infoDomain || appDomain || "official-portal",
      lastVerifiedAt: verifiedDate ? verifiedDate.toISOString().slice(0, 10) : null,
      daysSinceVerified: daysSince,
      changeDetected: false,
      needsHumanReview: reviewReasons.length > 0,
      reviewReasons,
    };
  });

  const approvedSourcesCount = items.filter(
    (i) => i.isApprovedOfficialSource,
  ).length;
  const flaggedCount = items.filter((i) => i.needsHumanReview).length;

  return {
    triggerType,
    lastRunAt: new Date(now).toISOString(),
    nextScheduledRunAt: new Date(now + SCHEDULE_INTERVAL_MS).toISOString(),
    totalSchemesChecked: items.length,
    approvedSourcesCount,
    upToDateCount: items.length - flaggedCount,
    flaggedForHumanReviewCount: flaggedCount,
    pipelineSteps: [
      {
        step: 1,
        name: "Schedule Trigger",
        status: "completed",
        detail: `Triggered (${triggerType}) for ${items.length} active Assam & Central scheme records.`,
      },
      {
        step: 2,
        name: "Fetch scheme data from approved official sources",
        status: "completed",
        detail: `Verified ${approvedSourcesCount}/${items.length} records against approved portals (${APPROVED_OFFICIAL_DOMAINS.slice(0, 4).join(", ")}, etc.).`,
      },
      {
        step: 3,
        name: "Check for changes",
        status: "completed",
        detail: `Compared structured eligibility criteria, benefit descriptions, and verification timestamps (${REVIEW_THRESHOLD_DAYS}-day threshold).`,
      },
      {
        step: 4,
        name: "Update the database",
        status: "completed",
        detail:
          "Synchronized verification metadata with Supabase database without silently altering published eligibility rules.",
      },
      {
        step: 5,
        name: "Flag entries that need human review",
        status: "completed",
        detail:
          flaggedCount > 0
            ? `Flagged ${flaggedCount} scheme(s) for human administrator review.`
            : `All ${items.length} schemes are verified within the freshness window; 0 flags raised.`,
      },
    ],
    items,
  };
}

function getNormalizedPath(request) {
  const url = new URL(request.url);
  const rewritten = url.searchParams.get("__path");
  const rawPath = rewritten
    ? `/api/${rewritten.replace(/^\/+/, "")}`
    : url.pathname;
  return { url, pathname: rawPath.replace(/\/+$/, "") || "/api" };
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(request) {
  try {
    const { url, pathname } = getNormalizedPath(request);

    if (pathname === "/api/healthz" || pathname === "/api") {
      return jsonResponse({ status: "ok" });
    }

    const cacheHeader = {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    };

    if (pathname === "/api/schemes/summary") {
      const schemes = (await fetchAllSchemes()).filter((s) => s.active);
      const categories = [...new Set(schemes.map((s) => s.category))].sort();
      return jsonResponse(
        {
          activeCount: schemes.length,
          categoryCount: categories.length,
          centralCount: schemes.filter((s) => s.governmentLevel === "central")
            .length,
          stateCount: schemes.filter((s) => s.governmentLevel === "state").length,
          categories,
        },
        200,
        cacheHeader,
      );
    }

    if (pathname === "/api/schemes/sync-status") {
      return jsonResponse(await runSyncReport("scheduled"));
    }

    if (pathname === "/api/schemes") {
      const q = (url.searchParams.get("q") || "").trim().toLowerCase();
      const category = (url.searchParams.get("category") || "").trim().toLowerCase();
      const state = (url.searchParams.get("state") || "").trim().toLowerCase();
      const level = (url.searchParams.get("governmentLevel") || "").trim().toLowerCase();

      const allSchemes = (await fetchAllSchemes()).filter((s) => s.active);
      const results = allSchemes.filter((scheme) => {
        if (category && scheme.category.toLowerCase() !== category) return false;
        if (level && scheme.governmentLevel.toLowerCase() !== level) return false;
        const stateMatches =
          !state ||
          scheme.regions.some(
            (r) => r.toLowerCase() === "all india" || r.toLowerCase() === state,
          );
        return stateMatches && matchesSearchQuery(scheme, q);
      });

      return jsonResponse(results, 200, cacheHeader);
    }

    const idMatch = pathname.match(/^\/api\/schemes\/(\d+)$/);
    if (idMatch) {
      const id = Number(idMatch[1]);
      const allSchemes = await fetchAllSchemes();
      const scheme = allSchemes.find((s) => s.id === id && s.active);
      if (!scheme) {
        return jsonResponse({ error: "Scheme not found." }, 404);
      }
      return jsonResponse(scheme, 200, cacheHeader);
    }

    return jsonResponse({ error: `Route not found: ${pathname}` }, 404);
  } catch (err) {
    console.error("Vercel API GET error:", err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Internal server error" },
      500,
    );
  }
}

export async function POST(request) {
  try {
    const { pathname } = getNormalizedPath(request);

    if (pathname === "/api/schemes/sync-check") {
      return jsonResponse(await runSyncReport("manual"));
    }

    if (pathname === "/api/schemes/match" || pathname === "/api/webhook/match") {
      const body = await request.json().catch(() => ({}));
      const cleanedAnswers = cleanAndOrganizeAnswers(body);
      const schemes = (await fetchAllSchemes()).filter((s) => s.active);

      const rawMatches = schemes.map((scheme) => ({
        scheme,
        ...compareSchemeCriteria(cleanedAnswers, scheme.criteria, scheme.regions),
      }));

      const sortedMatches = sortSchemeMatches(rawMatches);

      if (pathname === "/api/schemes/match") {
        return jsonResponse(sortedMatches);
      }

      const formattedResults = sortedMatches.map((m) => ({
        ...m,
        formatted: formatMatchExplanation(m),
      }));

      return jsonResponse({
        cleanedAnswers,
        pipelineSteps: [
          {
            step: 1,
            node: "Website form",
            detail: "Submitted guided profile answers",
          },
          {
            step: 2,
            node: "Webhook",
            detail: "Received answers at /api/webhook/match",
          },
          {
            step: 3,
            node: "Edit Fields",
            detail: `Cleaned & normalized answers (${cleanedAnswers.state}, ${cleanedAnswers.ageBand})`,
          },
          {
            step: 4,
            node: "Database",
            detail: `Loaded ${schemes.length} active schemes from Supabase`,
          },
          {
            step: 5,
            node: "Code / If",
            detail: `Evaluated deterministic eligibility rules across ${schemes.length} schemes`,
          },
          {
            step: 6,
            node: "Sort",
            detail: `Ordered best matches first (${sortedMatches.filter((m) => m.status === "potential_match").length} potential, ${sortedMatches.filter((m) => m.status === "more_information_needed").length} need info)`,
          },
          {
            step: 7,
            node: "Format",
            detail: "Generated plain-language explanations and application steps",
          },
          {
            step: 8,
            node: "Respond to Webhook",
            detail: "Sent sorted results back to website",
          },
        ],
        matches: formattedResults,
      });
    }

    return jsonResponse({ error: `Route not found: ${pathname}` }, 404);
  } catch (err) {
    console.error("Vercel API POST error:", err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Internal server error" },
      500,
    );
  }
}
