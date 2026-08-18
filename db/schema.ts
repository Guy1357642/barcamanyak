import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const appState = sqliteTable("app_state", {
  key: text("key").notNull(),
  scope: text("scope").notNull(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [primaryKey({ columns: [table.key, table.scope] })]);

export const apiCache = sqliteTable("api_cache", {
  key: text("key").primaryKey(),
  payload: text("payload").notNull(),
  expiresAt: integer("expires_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const quotaUsage = sqliteTable("quota_usage", {
  day: text("day").primaryKey(),
  requests: integer("requests").notNull().default(0),
  updatedAt: integer("updated_at").notNull(),
});
