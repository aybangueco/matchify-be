import { and, eq } from "drizzle-orm";
import db from "@/config/db";
import { type Album, type AlbumInsert, albumsTable } from "@/db/schemas";

export async function getAlbumsByUserID(userID: string): Promise<Album[]> {
	const albums = await db
		.select()
		.from(albumsTable)
		.where(eq(albumsTable.createdBy, userID));
	return albums;
}

export async function getAlbumByName(
	albumName: string,
	userID: string,
): Promise<Album | null> {
	const album = await db
		.select()
		.from(albumsTable)
		.where(
			and(
				eq(albumsTable.albumName, albumName),
				eq(albumsTable.createdBy, userID),
			),
		);
	return album[0];
}

export async function createAlbum(data: AlbumInsert): Promise<Album> {
	const newAlbum = await db.insert(albumsTable).values(data).returning();
	return newAlbum[0];
}

export async function deleteAlbumByID(albumID: string, userID: string) {
	return await db
		.delete(albumsTable)
		.where(and(eq(albumsTable.id, albumID), eq(albumsTable.createdBy, userID)));
}
