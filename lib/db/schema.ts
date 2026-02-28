import {
  pgTable,
  serial,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  cuisineType: varchar("cuisine_type", { length: 100 }),
  theme: text("theme"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const menus = pgTable("menus", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id")
    .references(() => restaurants.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  version: integer("version").default(1).notNull(),
  pdfUrl: text("pdf_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  menuId: integer("menu_id")
    .references(() => menus.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  popularityScore: decimal("popularity_score", { precision: 10, scale: 2 }),
  category: varchar("category", { length: 100 }),
  sortOrder: integer("sort_order").default(0).notNull(),
  imageUrl: text("image_url"),
  isRecommended: boolean("is_recommended").default(false).notNull(),
  fontSizeTier: varchar("font_size_tier", { length: 20 }).default("normal"), // high | normal | low
  costEstimate: decimal("cost_estimate", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const menuImports = pgTable("menu_imports", {
  id: serial("id").primaryKey(),
  menuId: integer("menu_id")
    .references(() => menus.id, { onDelete: "cascade" })
    .notNull(),
  sourceType: varchar("source_type", { length: 20 }).notNull(), // sql_file | ocr_image | manual
  rawSqlPath: text("raw_sql_path"),
  imageUrl: text("image_url"),
  parsedAt: timestamp("parsed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Restaurant = typeof restaurants.$inferSelect;
export type NewRestaurant = typeof restaurants.$inferInsert;
export type Menu = typeof menus.$inferSelect;
export type NewMenu = typeof menus.$inferInsert;
export type MenuItem = typeof menuItems.$inferSelect;
export type NewMenuItem = typeof menuItems.$inferInsert;
export type MenuImport = typeof menuImports.$inferSelect;
export type NewMenuImport = typeof menuImports.$inferInsert;
