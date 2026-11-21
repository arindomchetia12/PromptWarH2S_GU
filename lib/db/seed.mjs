import pg from "pg";

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL must be configured before seeding the demo catalogue.");
}

const demoSchemes = [
  {
    slug: "demo-student-support",
    name: "Demo record: Student support",
    category: "Education",
    governmentLevel: "central",
    regions: ["All India"],
    intendedBeneficiaries: ["Students (illustrative, not verified)"],
    benefits: ["Illustrative education assistance — sample value only."],
    criteria: { minAge: 18, maxAge: 24, studentStatuses: ["student"] },
    requiredDocuments: ["Sample list only — replace after official verification."],
    applicationSteps: ["Sample only: review verified scheme information before applying."],
    informationUrl: "https://www.myscheme.gov.in/",
    applicationUrl: "https://www.myscheme.gov.in/",
  },
  {
    slug: "demo-rural-housing",
    name: "Demo record: Rural housing support",
    category: "Housing",
    governmentLevel: "central",
    regions: ["All India"],
    intendedBeneficiaries: ["Rural residents (illustrative, not verified)"],
    benefits: ["Illustrative housing assistance — sample value only."],
    criteria: { residences: ["rural"] },
    requiredDocuments: ["Sample list only — replace after official verification."],
    applicationSteps: ["Sample only: review verified scheme information before applying."],
    informationUrl: "https://www.myscheme.gov.in/",
    applicationUrl: "https://www.myscheme.gov.in/",
  },
  {
    slug: "demo-farmer-support",
    name: "Demo record: Farmer support",
    category: "Agriculture",
    governmentLevel: "central",
    regions: ["All India"],
    intendedBeneficiaries: ["Farmers (illustrative, not verified)"],
    benefits: ["Illustrative farmer assistance — sample value only."],
    criteria: { employmentStatuses: ["farmer"] },
    requiredDocuments: ["Sample list only — replace after official verification."],
    applicationSteps: ["Sample only: review verified scheme information before applying."],
    informationUrl: "https://www.myscheme.gov.in/",
    applicationUrl: "https://www.myscheme.gov.in/",
  },
];

const pool = new Pool({ connectionString });

try {
  for (const scheme of demoSchemes) {
    await pool.query(
      `INSERT INTO schemes
        (slug, name, category, government_level, regions, intended_beneficiaries,
         benefits, criteria, required_documents, application_steps, information_url,
         application_url, last_verified_at, active, demo_data)
       VALUES
        ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb, $8::jsonb,
         $9::jsonb, $10::jsonb, $11, $12, NULL, TRUE, TRUE)
       ON CONFLICT (slug) DO NOTHING`,
      [
        scheme.slug,
        scheme.name,
        scheme.category,
        scheme.governmentLevel,
        JSON.stringify(scheme.regions),
        JSON.stringify(scheme.intendedBeneficiaries),
        JSON.stringify(scheme.benefits),
        JSON.stringify(scheme.criteria),
        JSON.stringify(scheme.requiredDocuments),
        JSON.stringify(scheme.applicationSteps),
        scheme.informationUrl,
        scheme.applicationUrl,
      ],
    );
  }

  process.stdout.write(`Seeded ${demoSchemes.length} illustrative demo records (existing records were left unchanged).\n`);
} finally {
  await pool.end();
}
