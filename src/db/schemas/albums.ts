import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import type z from "zod";
import { user } from "./auth";

export const albumsTable = pgTable("albums", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	albumName: varchar("album_name").notNull(),
	createdBy: text("created_by").references(() => user.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const albumSelectSchema = createSelectSchema(albumsTable);
export const albumInsertSchema = createInsertSchema(albumsTable);
export const albumUpdateSchema = createUpdateSchema(albumsTable);

export type Album = z.infer<typeof albumSelectSchema>;
export type AlbumInsert = z.infer<typeof albumInsertSchema>;
export type AlbumUpdate = z.infer<typeof albumUpdateSchema>;
