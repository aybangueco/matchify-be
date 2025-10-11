import { and, eq } from "drizzle-orm";
import type { QueryResult } from "pg";
import db from "@/config/db";
import {
	type Profile,
	type ProfileInsert,
	type ProfileUpdate,
	profilesTable,
} from "@/db/schemas/profiles";

export async function getProfileByUserID(
	userID: string,
): Promise<Profile | null> {
	const userProfile = await db
		.select()
		.from(profilesTable)
		.where(eq(profilesTable.userID, userID));
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
