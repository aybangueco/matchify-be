import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import type z from "zod";
import { profilesTable } from "./profiles";
import { usersTable } from "./users";

export const artistsTable = pgTable("artists", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	artistName: varchar("artist_name").notNull(),
	imageURL: varchar("image_url").notNull(),
	profile: uuid("profile")
		.references(() => profilesTable.id, { onDelete: "cascade" })
		.notNull(),
	createdBy: uuid("created_by")
		.references(() => usersTable.id, { onDelete: "cascade" })
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
