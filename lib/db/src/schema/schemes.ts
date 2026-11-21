import {
  boolean,
  date,
  index,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const schemesTable = pgTable(
  "schemes",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    category: text("category").notNull(),
    governmentLevel: text("government_level").notNull(),
    regions: jsonb("regions").$type<string[]>().notNull().default([]),
    intendedBeneficiaries: jsonb("intended_beneficiaries")
      .$type<string[]>()
      .notNull()
      .default([]),
    benefits: jsonb("benefits").$type<string[]>().notNull().default([]),
    criteria: jsonb("criteria")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    requiredDocuments: jsonb("required_documents")
      .$type<string[]>()
      .notNull()
      .default([]),
    applicationSteps: jsonb("application_steps")
      .$type<string[]>()
      .notNull()
      .default([]),
    informationUrl: text("information_url").notNull(),
    applicationUrl: text("application_url").notNull(),
    lastVerifiedAt: date("last_verified_at", { mode: "string" }),
    active: boolean("active").notNull().default(true),
    demoData: boolean("demo_data").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("schemes_slug_unique").on(table.slug),
    index("schemes_active_category_idx").on(table.active, table.category),
  ],
);

export const insertSchemeSchema = createInsertSchema(schemesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertScheme = z.infer<typeof insertSchemeSchema>;
export type Scheme = typeof schemesTable.$inferSelect;
