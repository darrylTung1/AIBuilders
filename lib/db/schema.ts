import {
  sqliteTable,
  integer,
  text,
  numeric,
} from "drizzle-orm/sqlite-core";

export const menus = sqliteTable("menus", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  version: integer("version").default(1).notNull(),
  pdfUrl: text("pdf_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(new Date()).notNull(),
});

export const menuItems = sqliteTable("menu_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  menuId: integer("menu_id")
    .references(() => menus.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: text("price").notNull(),
  popularityScore: text("popularity_score"),
  category: text("category"),
  sortOrder: integer("sort_order").default(0).notNull(),
  imageUrl: text("image_url"),
  isRecommended: integer("is_recommended", { mode: "boolean" }).default(false).notNull(),
  fontSizeTier: text("font_size_tier").default("normal"),
  costEstimate: text("cost_estimate"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(new Date()).notNull(),
});

export const menuImports = sqliteTable("menu_imports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  menuId: integer("menu_id")
    .references(() => menus.id, { onDelete: "cascade" })
    .notNull(),
  sourceType: text("source_type").notNull(),
  rawSqlPath: text("raw_sql_path"),
  imageUrl: text("image_url"),
  parsedAt: integer("parsed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(new Date()).notNull(),
});

export type Menu = typeof menus.$inferSelect;
export type NewMenu = typeof menus.$inferInsert;
export type MenuItem = typeof menuItems.$inferSelect;
export type NewMenuItem = typeof menuItems.$inferInsert;
export type MenuImport = typeof menuImports.$inferSelect;
export type NewMenuImport = typeof menuImports.$inferInsert;
