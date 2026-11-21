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
import { compareSchemeCriteria } from "../lib/scheme-matching";

const router: IRouter = Router();
const REVIEW_AFTER_DAYS = 365;

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

  const filters = [];
  if (!parsed.data.includeInactive) {
    filters.push(eq(schemesTable.active, true));
  } else if (!requireAdmin(req, res)) {
    return;
  }
  if (parsed.data.category) {
    filters.push(eq(schemesTable.category, parsed.data.category));
  }
  if (parsed.data.governmentLevel) {
    filters.push(eq(schemesTable.governmentLevel, parsed.data.governmentLevel));
  }
  const rows = await db
    .select()
    .from(schemesTable)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(asc(schemesTable.category), asc(schemesTable.name));

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
  const rows = await db
    .select({
      category: schemesTable.category,
      governmentLevel: schemesTable.governmentLevel,
    })
    .from(schemesTable)
    .where(eq(schemesTable.active, true));

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
  const parsed = MatchSchemesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const schemes = await db
    .select()
    .from(schemesTable)
    .where(eq(schemesTable.active, true))
    .orderBy(asc(schemesTable.name));

  const matches = schemes.map((scheme) => ({
    scheme,
    ...compareSchemeCriteria(
      parsed.data as ProfileAnswers,
      scheme.criteria as Scheme["criteria"],
      scheme.regions,
    ),
  }));

  res.json(MatchSchemesResponse.parse(matches));
});

router.get("/schemes/:id", async (req, res): Promise<void> => {
  const parsed = GetSchemeParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [scheme] = await db
    .select()
    .from(schemesTable)
    .where(and(eq(schemesTable.id, parsed.data.id), eq(schemesTable.active, true)))
    .limit(1);
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
