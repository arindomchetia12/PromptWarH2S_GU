import { timingSafeEqual } from "node:crypto";
import { and, asc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateSchemeBody,
  CreateSchemeResponse,
  DeactivateSchemeParams,
  DeactivateSchemeResponse,
  GetSchemeParams,
  GetSchemeResponse,
  GetSchemeSummaryResponse,
  ListAdminSchemesQueryParams,
  ListAdminSchemesResponse,
  ListSchemesQueryParams,
  ListSchemesResponse,
  MatchSchemesBody,
  MatchSchemesResponse,
  UpdateSchemeBody,
  UpdateSchemeParams,
  UpdateSchemeResponse,
  VerifySchemeParams,
  VerifySchemeResponse,
  type ProfileAnswers,
  type Scheme,
} from "@workspace/api-zod";
import { db, schemesTable } from "@workspace/db";
import {
  cleanAndOrganizeAnswers,
  compareSchemeCriteria,
  formatMatchExplanation,
  sortSchemeMatches,
} from "../lib/scheme-matching";
import { getAllSchemes } from "../lib/schemes-db";
import {
  getLatestSyncReport,
  runScheduledSchemeSync,
  startSchemeSyncScheduler,
} from "../lib/scheme-sync";

const router: IRouter = Router();
const REVIEW_AFTER_DAYS = 365;
if (!process.env.VERCEL) {
  startSchemeSyncScheduler();
}

function requireAdmin(
  req: Parameters<Parameters<IRouter["get"]>[1]>[0],
  res: Parameters<Parameters<IRouter["get"]>[1]>[1],
): boolean {
  const expected = process.env.SCHEME_ADMIN_TOKEN;
  if (!expected) {
    res.status(503).json({
      error: "Catalogue administration is disabled until SCHEME_ADMIN_TOKEN is configured.",
    });
    return false;
  }

  const authorization = req.get("authorization") ?? "";
  const supplied = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  const authorized =
    expectedBuffer.length === suppliedBuffer.length &&
    timingSafeEqual(expectedBuffer, suppliedBuffer);

  if (!authorized) {
    res.status(401).json({ error: "Administrator access required." });
    return false;
  }
  return true;
}

function schemeIsDueForReview(scheme: { lastVerifiedAt: string | null }): boolean {
  if (!scheme.lastVerifiedAt) return true;
  const verifiedAt = new Date(`${scheme.lastVerifiedAt}T00:00:00Z`);
  const ageInDays = (Date.now() - verifiedAt.getTime()) / 86_400_000;
  return ageInDays > REVIEW_AFTER_DAYS;
}

router.get("/schemes", async (req, res): Promise<void> => {
  const parsed = ListSchemesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const allSchemes = await getAllSchemes();
  let rows = allSchemes;
  if (!parsed.data.includeInactive) {
    rows = rows.filter((s) => s.active);
  } else if (!requireAdmin(req, res)) {
    return;
  }
  if (parsed.data.category) {
    rows = rows.filter((s) => s.category.toLowerCase() === parsed.data.category!.toLowerCase());
  }
  if (parsed.data.governmentLevel) {
    rows = rows.filter((s) => s.governmentLevel === parsed.data.governmentLevel);
  }

  const state = parsed.data.state?.trim().toLowerCase();
  const query = parsed.data.q?.trim().toLowerCase();
  const results = rows.filter((scheme) => {
    const stateMatches =
      !state ||
      scheme.regions.some(
        (region) => region.toLowerCase() === "all india" || region.toLowerCase() === state,
      );
    const searchText = [
      scheme.name,
      scheme.category,
      ...scheme.regions,
      ...scheme.intendedBeneficiaries,
      ...scheme.benefits,
    ]
      .join(" ")
      .toLowerCase();
    return stateMatches && (!query || searchText.includes(query));
  });

  res.json(ListSchemesResponse.parse(results));
});

router.get("/schemes/summary", async (_req, res): Promise<void> => {
  const allSchemes = await getAllSchemes();
  const rows = allSchemes.filter((s) => s.active);

  const categories = [...new Set(rows.map((scheme) => scheme.category))].sort();
  res.json(
    GetSchemeSummaryResponse.parse({
      activeCount: rows.length,
      categoryCount: categories.length,
      centralCount: rows.filter((scheme) => scheme.governmentLevel === "central").length,
      stateCount: rows.filter((scheme) => scheme.governmentLevel === "state").length,
      categories,
    }),
  );
});

router.post("/schemes/match", async (req, res): Promise<void> => {
  // 1. Webhook — receive answers from website form
  const parsed = MatchSchemesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // 2. Edit Fields — clean and organize answers
  const cleanedAnswers = cleanAndOrganizeAnswers(parsed.data as ProfileAnswers);

  // 3. Database — get current scheme information
  const allSchemes = await getAllSchemes();
  const schemes = allSchemes.filter((s) => s.active);

  // 4. Code / If — check eligibility rules
  const rawMatches = schemes.map((scheme) => ({
    scheme,
    ...compareSchemeCriteria(
      cleanedAnswers,
      scheme.criteria as Scheme["criteria"],
      scheme.regions,
    ),
  }));

  // 5. Sort — put the best matches first
  const sortedMatches = sortSchemeMatches(rawMatches);

  // 6. Format & Respond to Webhook — send results to the website
  res.json(MatchSchemesResponse.parse(sortedMatches));
});

router.post("/webhook/match", async (req, res): Promise<void> => {
  const parsed = MatchSchemesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const cleanedAnswers = cleanAndOrganizeAnswers(parsed.data as ProfileAnswers);
  const allSchemes = await getAllSchemes();
  const schemes = allSchemes.filter((s) => s.active);

  const rawMatches = schemes.map((scheme) => ({
    scheme,
    ...compareSchemeCriteria(
      cleanedAnswers,
      scheme.criteria as Scheme["criteria"],
      scheme.regions,
    ),
  }));

  const sortedMatches = sortSchemeMatches(rawMatches);
  const formattedResults = sortedMatches.map((m) => ({
    ...m,
    formatted: formatMatchExplanation(m),
  }));

  res.json({
    cleanedAnswers,
    pipelineSteps: [
      { step: 1, node: "Website form", detail: "Submitted guided profile answers" },
      { step: 2, node: "Webhook", detail: "Received answers at /api/webhook/match" },
      { step: 3, node: "Edit Fields", detail: `Cleaned & normalized answers (${cleanedAnswers.state}, ${cleanedAnswers.ageBand})` },
      { step: 4, node: "Database", detail: `Loaded ${schemes.length} active schemes from Supabase` },
      { step: 5, node: "Code / If", detail: `Evaluated deterministic eligibility rules across ${schemes.length} schemes` },
      { step: 6, node: "Sort", detail: `Ordered best matches first (${sortedMatches.filter((m) => m.status === "potential_match").length} potential, ${sortedMatches.filter((m) => m.status === "more_information_needed").length} need info)` },
      { step: 7, node: "Format", detail: "Generated plain-language explanations and application steps" },
      { step: 8, node: "Respond to Webhook", detail: "Sent sorted results back to website" },
    ],
    matches: formattedResults,
  });
});

router.get("/schemes/sync-status", async (_req, res): Promise<void> => {
  const report = await getLatestSyncReport();
  res.json(report);
});

router.post("/schemes/sync-check", async (_req, res): Promise<void> => {
  const report = await runScheduledSchemeSync("manual");
  res.json(report);
});

router.get("/schemes/:id", async (req, res): Promise<void> => {
  const parsed = GetSchemeParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const allSchemes = await getAllSchemes();
  const scheme = allSchemes.find((s) => s.id === parsed.data.id && s.active);
  if (!scheme) {
    res.status(404).json({ error: "Scheme not found." });
    return;
  }
  res.json(GetSchemeResponse.parse(scheme));
});

router.get("/admin/schemes", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const parsed = ListAdminSchemesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const schemes = await db.select().from(schemesTable).orderBy(asc(schemesTable.name));
  const results = parsed.data.needsReview
    ? schemes.filter(schemeIsDueForReview)
    : schemes;
  res.json(ListAdminSchemesResponse.parse(results));
});

router.post("/admin/schemes", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const parsed = CreateSchemeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const slugBase = parsed.data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  const { lastVerifiedAt, ...schemeInput } = parsed.data;
  const [scheme] = await db
    .insert(schemesTable)
    .values({
      ...schemeInput,
      slug: `${slugBase}-${crypto.randomUUID().slice(0, 8)}`,
      lastVerifiedAt: lastVerifiedAt?.toISOString().slice(0, 10) ?? null,
    })
    .returning();
  res.status(201).json(CreateSchemeResponse.parse(scheme));
});

router.patch("/admin/schemes/:id", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const params = UpdateSchemeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateSchemeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { lastVerifiedAt, ...schemeUpdates } = parsed.data;
  const [scheme] = await db
    .update(schemesTable)
    .set({
      ...schemeUpdates,
      ...(lastVerifiedAt !== undefined
        ? { lastVerifiedAt: lastVerifiedAt?.toISOString().slice(0, 10) ?? null }
        : {}),
    })
    .where(eq(schemesTable.id, params.data.id))
    .returning();
  if (!scheme) {
    res.status(404).json({ error: "Scheme not found." });
    return;
  }
  res.json(UpdateSchemeResponse.parse(scheme));
});

router.post("/admin/schemes/:id/deactivate", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const params = DeactivateSchemeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [scheme] = await db
    .update(schemesTable)
    .set({ active: false })
    .where(eq(schemesTable.id, params.data.id))
    .returning();
  if (!scheme) {
    res.status(404).json({ error: "Scheme not found." });
    return;
  }
  res.json(DeactivateSchemeResponse.parse(scheme));
});

router.post("/admin/schemes/:id/verify", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const params = VerifySchemeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [scheme] = await db
    .update(schemesTable)
    .set({ lastVerifiedAt: new Date().toISOString().slice(0, 10) })
    .where(eq(schemesTable.id, params.data.id))
    .returning();
  if (!scheme) {
    res.status(404).json({ error: "Scheme not found." });
    return;
  }
  res.json(VerifySchemeResponse.parse(scheme));
});

export default router;
