import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import type z from "zod";
import { user } from "./auth";

export const artistsTable = pgTable("artists", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	artistName: varchar("artist_name").notNull(),
	imageURL: varchar("image_url").notNull(),
	createdBy: text("created_by")
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const artistSelectSchema = createSelectSchema(artistsTable);
export const artistInsertSchema = createInsertSchema(artistsTable);
export const artistUpdateSchema = createUpdateSchema(artistsTable);

export type Artist = z.infer<typeof artistSelectSchema>;
export type ArtistInsert = z.infer<typeof artistInsertSchema>;
export type ArtistUpdate = z.infer<typeof artistUpdateSchema>;
