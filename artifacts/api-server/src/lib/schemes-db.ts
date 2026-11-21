import { and, asc, eq } from "drizzle-orm";
import { db, schemesTable } from "@workspace/db";
import type { Scheme } from "@workspace/api-zod";

function normalizeArray(val: unknown): string[] | undefined {
  if (!val) return undefined;
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === "string") return [val];
  return undefined;
}

function mapSupabaseRow(row: any): Scheme {
  const crit = row.criteria || {};
  return {
    id: Number(row.id),
    name: String(row.name),
    category: String(row.category),
    governmentLevel: row.government_level as "central" | "state",
    regions: Array.isArray(row.regions) ? row.regions : [],
    intendedBeneficiaries: Array.isArray(row.intended_beneficiaries) ? row.intended_beneficiaries : [],
    benefits: Array.isArray(row.benefits) ? row.benefits : [],
    criteria: {
      minAge: crit.minAge != null ? Number(crit.minAge) : undefined,
      maxAge: crit.maxAge != null ? Number(crit.maxAge) : undefined,
      states: normalizeArray(crit.states),
      residences: normalizeArray(crit.residences) as any,
      studentStatuses: normalizeArray(crit.studentStatuses) as any,
      employmentStatuses: normalizeArray(crit.employmentStatuses) as any,
      socialCategories: normalizeArray(crit.socialCategories) as any,
      gender: normalizeArray(crit.gender) as any,
    },
    requiredDocuments: Array.isArray(row.required_documents) ? row.required_documents : [],
    applicationSteps: Array.isArray(row.application_steps) ? row.application_steps : [],
    informationUrl: String(row.information_url),
    applicationUrl: String(row.application_url),
    lastVerifiedAt: row.last_verified_at ? new Date(row.last_verified_at) : null,
    active: Boolean(row.active),
    demoData: Boolean(row.demo_data),
    createdAt: new Date(row.created_at || Date.now()),
    updatedAt: new Date(row.updated_at || Date.now()),
  };
}

const CACHE_TTL_MS = 5 * 60 * 1000;
let cachedSchemes: Scheme[] | null = null;
let cacheExpiresAt = 0;
let inflightPromise: Promise<Scheme[]> | null = null;

function cleanEnvValue(raw: string | undefined, fallback: string): string {
  if (!raw) return fallback;
  const cleaned = raw.trim().replace(/^["']+|["']+$/g, "").trim();
  return cleaned || fallback;
}

export async function getAllSchemes(): Promise<Scheme[]> {
  const now = Date.now();
  if (cachedSchemes && now < cacheExpiresAt) {
    return cachedSchemes;
  }
  if (inflightPromise) {
    return inflightPromise;
  }

  inflightPromise = loadSchemesFromSource().then((rows) => {
    cachedSchemes = rows;
    cacheExpiresAt = Date.now() + CACHE_TTL_MS;
    return rows;
  });

  try {
    return await inflightPromise;
  } finally {
    inflightPromise = null;
  }
}

async function loadSchemesFromSource(): Promise<Scheme[]> {
  const dbUrl = process.env.DATABASE_URL || "";
  const hasPasswordPlaceholder = dbUrl.includes("[YOUR-PASSWORD]");

  if (!hasPasswordPlaceholder && dbUrl.length > 0) {
    try {
      const rows = await db
        .select()
        .from(schemesTable)
        .orderBy(asc(schemesTable.category), asc(schemesTable.name));

      if (rows && rows.length > 0) {
        return rows.map((r) => ({
          ...r,
          governmentLevel: r.governmentLevel as "central" | "state",
          lastVerifiedAt: r.lastVerifiedAt ? new Date(r.lastVerifiedAt) : null,
          criteria: {
            ...r.criteria,
            states: normalizeArray((r.criteria as any)?.states),
            residences: normalizeArray((r.criteria as any)?.residences) as any,
            studentStatuses: normalizeArray((r.criteria as any)?.studentStatuses) as any,
            employmentStatuses: normalizeArray((r.criteria as any)?.employmentStatuses) as any,
            socialCategories: normalizeArray((r.criteria as any)?.socialCategories) as any,
            gender: normalizeArray((r.criteria as any)?.gender) as any,
          },
        }));
      }
    } catch (err) {
      console.warn("Direct PostgreSQL query failed, attempting Supabase REST API fallback:", err);
    }
  }

  const defaultUrl = "https://jsmtqaenralamjnabuzg.supabase.co";
  const defaultKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzbXRxYWVucmFsYW1qbmFidXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUyMzE2MTIsImV4cCI6MjExMDgwNzYxMn0.X92InRtd-jDZFc4OfmHjtDPRQ9OwAQ1TswnJFxpyceM";

  const rawUrl = cleanEnvValue(process.env.SUPABASE_URL, defaultUrl).replace(/\/+$/, "");
  const supabaseUrl = rawUrl.startsWith("https://") ? rawUrl : defaultUrl;
  const supabaseKey = cleanEnvValue(process.env.SUPABASE_ANON_KEY, defaultKey);

  const res = await fetch(`${supabaseUrl}/rest/v1/schemes?select=*&order=id.asc`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Supabase API responded with status ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  return (data as any[]).map(mapSupabaseRow);
}
