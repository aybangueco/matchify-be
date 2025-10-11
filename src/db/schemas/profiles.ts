import {
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import type z from "zod";
import { user } from "./auth";

export const PronounEnum = pgEnum("pronoun", ["He/His", "She/Her"]);

export const pronounSelectSchema = createSelectSchema(PronounEnum);

export const profilesTable = pgTable("profiles", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	userID: text("user_id")
		.unique()
		.references(() => user.id),
	avatarLink: text("avatar_link"),
	location: varchar("location", { length: 30 }),
	bio: varchar("bio", { length: 100 }),
	pronoun: PronounEnum("pronoun").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const profileSelectSchema = createSelectSchema(profilesTable);
export const profileInsertSchema = createInsertSchema(profilesTable);
export const profileUpdateSchema = createUpdateSchema(profilesTable);

export type Profile = z.infer<typeof profileSelectSchema>;
export type ProfileInsert = z.infer<typeof profileInsertSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
