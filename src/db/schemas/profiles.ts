import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import type z from "zod";
import { usersTable } from "./users";

export const profilesTable = pgTable("profiles", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	userID: uuid("user_id")
		.unique()
		.references(() => usersTable.id, { onDelete: "cascade" })
		.notNull(),
	displayName: varchar("display_name", { length: 25 }).notNull(),
	avatarLink: varchar("avatar_link"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const profileSelectSchema = createSelectSchema(profilesTable);
export const profileInsertSchema = createInsertSchema(profilesTable, {
	displayName: (schema) =>
		schema
			.min(5, { error: "Display name too short" })
			.max(25, { error: "Display name too long" }),
});
export const profileUpdateSchema = createUpdateSchema(profilesTable, {
	displayName: (schema) =>
		schema
			.min(5, { error: "Display name too short" })
			.max(25, { error: "Display name too long" }),
});

export type Profile = z.infer<typeof profileSelectSchema>;
export type ProfileInsert = z.infer<typeof profileInsertSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
