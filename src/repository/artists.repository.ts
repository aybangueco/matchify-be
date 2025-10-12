import { and, eq } from "drizzle-orm";
import db from "@/config/db";
import { type Artist, type ArtistInsert, artistsTable } from "@/db/schemas";

export async function getArtistByName(
	artistName: string,
	userID: string,
): Promise<Artist> {
	const artist = await db
		.select()
		.from(artistsTable)
		.where(
			and(
				eq(artistsTable.artistName, artistName),
				eq(artistsTable.createdBy, userID),
			),
		);
	return artist[0];
}

export async function getArtistsByUserID(userID: string): Promise<Artist[]> {
	const artists = await db
		.select()
		.from(artistsTable)
		.where(eq(artistsTable.createdBy, userID));
	return artists;
}

export async function createArtist(data: ArtistInsert): Promise<Artist> {
	const newArtist = await db.insert(artistsTable).values(data).returning();
	return newArtist[0];
}

export async function deleteArtist(artistID: string, userID: string) {
	return await db
		.delete(artistsTable)
		.where(
			and(eq(artistsTable.id, artistID), eq(artistsTable.createdBy, userID)),
		);
}
