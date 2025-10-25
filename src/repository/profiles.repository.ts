import { and, eq } from "drizzle-orm";
import type { QueryResult } from "pg";
import db from "@/config/db";
import { 
	type Profile,
	type ProfileInsert,
	type ProfileUpdate,
	profilesTable,user, } from "@/db/schemas";

export async function getProfileByUserID(userID: string) {
	const userProfile = await db
		.select({
			id: profilesTable.id,
			userID: profilesTable.userID,
			bio: profilesTable.bio,
			location: profilesTable.location,
			pronoun: profilesTable.pronoun,
			username: user.username,
			name: user.name,
			createdAt: profilesTable.updatedAt,
			updatedAt: profilesTable.updatedAt,
		})
		.from(user)
		.where(eq(user.id, userID))
		.leftJoin(profilesTable, eq(profilesTable.userID, user.id));
	return userProfile[0];
}

export async function getProfileByUsername(username: string) {
	const userProfile = await db
		.select({
			id: profilesTable.id,
			userID: profilesTable.userID,
			bio: profilesTable.bio,
			location: profilesTable.location,
			pronoun: profilesTable.pronoun,
			username: user.username,
			name: user.name,
			createdAt: profilesTable.updatedAt,
			updatedAt: profilesTable.updatedAt,
		})
		.from(user)
		.where(eq(user.username, username))
		.leftJoin(profilesTable, eq(profilesTable.userID, user.id));
	return userProfile[0];
}

export async function createProfile(data: ProfileInsert): Promise<Profile> {
	const newProfile = await db.insert(profilesTable).values(data).returning();
	return newProfile[0];
}

export async function updateProfileByID({
	profileID,
	userID,
	data,
}: {
	profileID: string;
	userID: string;
	data: ProfileUpdate;
}): Promise<Profile> {
	const updatedProfile = await db
		.update(profilesTable)
		.set(data)
		.where(
			and(eq(profilesTable.id, profileID), eq(profilesTable.userID, userID)),
		)
		.returning();
	return updatedProfile[0];
}

export async function deleteProfile({
	profileID,
	userID,
}: {
	profileID: string;
	userID: string;
}): Promise<QueryResult<never>> {
	return await db
		.delete(profilesTable)
		.where(
			and(eq(profilesTable.id, profileID), eq(profilesTable.userID, userID)),
		);
}
