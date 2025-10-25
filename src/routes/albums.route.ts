import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import env from "@/config/env";
import { albumInsertSchema } from "@/db/schemas";
import createApp from "@/lib/create-app";
import { errors } from "@/lib/errors";
import { HttpStatus } from "@/lib/http";
import type { AlbumMatchInfo } from "@/lib/types";
import { requireAuthenticated } from "@/middlewares";
import {
	createAlbum,
	deleteAlbumByID,
	getAlbumByName,
	getAlbumsByUserID,
} from "@/repository/albums.repository";

const albumsRouter = createApp();

albumsRouter.use(requireAuthenticated);

albumsRouter.get("/search", async (c) => {
	const { album_name } = c.req.query();

	if (!album_name) {
		return c.json({}, HttpStatus.Ok.code);
	}

	const url = `http://ws.audioscrobbler.com/2.0/?method=album.search&album=${album_name}&api_key=${env.FM_API}&format=json`;

	const response = await fetch(url);

	if (!response.ok) {
		throw new HTTPException(HttpStatus.InternalServerError.code, {
			message: "Internal Server Error",
		});
	}

	const data = await response.json();

	const albumMatches: AlbumMatchInfo[] = data.results.albummatches.album;

	return c.json(
		{
			success: true,
			message: "Album searched successfully",
			albums: albumMatches ?? [],
		},
		HttpStatus.Ok.code,
	);
});

albumsRouter.get("/", async (c) => {
	const user = c.get("user");

	if (!user) {
		throw errors.AuthRequiredErr();
	}

	const albums = await getAlbumsByUserID(user.id);

	return c.json(
		{
			success: true,
			message: "Albums fetched successfully",
			albums,
		},
		HttpStatus.Ok.code,
	);
});

albumsRouter.post(
	"/",
	zValidator("json", albumInsertSchema, (result) => {
		if (!result.success) {
			throw errors.ZodValidationErr(result.error);
		}
	}),
	async (c) => {
		const user = c.get("user");
		const credentials = c.req.valid("json");

		if (!user) {
			throw errors.AuthRequiredErr();
		}

		const albums = await getAlbumsByUserID(user.id);

		if (albums.length === 5) {
			throw new HTTPException(HttpStatus.BadRequest.code, {
				message: "Cannot add more than 5 albums",
			});
		}

		const existingAlbum = await getAlbumByName(credentials.albumName, user.id);

		if (existingAlbum) {
			throw new HTTPException(HttpStatus.BadRequest.code, {
				message: "Cannot add existing album",
			});
		}

		const newAlbum = await createAlbum(credentials);

		return c.json(
			{
				success: true,
				message: "Album created successfully",
				album: newAlbum,
			},
			HttpStatus.Created.code,
		);
	},
);

albumsRouter.delete("/:id", async (c) => {
	const user = c.get("user");
	const albumID = c.req.param("id");

	if (!user) {
		throw errors.AuthRequiredErr();
	}

	await deleteAlbumByID(albumID, user.id);

	return c.json({ success: true, message: "Album deleted successfully" });
});

export default albumsRouter;
