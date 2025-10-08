import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import type z from "zod";

export const usersTable = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	email: varchar("email").unique().notNull(),
	username: varchar("username", { length: 15 }).unique().notNull(),
	password: text("password").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const userSelectSchema = createSelectSchema(usersTable);
export const userInsertSchema = createInsertSchema(usersTable, {
	username: (schema) =>
		schema
			.min(4, { error: "Username too short" })
			.max(15, { error: "Username too long" }),
	password: (schema) =>
		schema
			.min(8, { error: "Password too short" })
			.max(25, { error: "Password too long" }),
});
export const userUpdateSchema = createUpdateSchema(usersTable, {
	username: (schema) =>
		schema
			.min(4, { error: "Username too short" })
			.max(15, { error: "Username too long" }),
	password: (schema) =>
		schema
			.min(8, { error: "Password too short" })
			.max(25, { error: "Password too long" }),
});

export type User = z.infer<typeof userSelectSchema>;
export type UserInsert = z.infer<typeof userInsertSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
