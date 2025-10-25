import { zValidator } from "@hono/zod-validator";
import { fetch } from "bun";
import { HTTPException } from "hono/http-exception";
import env from "@/config/env";
import { artistInsertSchema } from "@/db/schemas";
import createApp from "@/lib/create-app";
import { errors } from "@/lib/errors";
import { HttpStatus } from "@/lib/http";
import type { ArtistMatchInfo } from "@/lib/types";
import { requireAuthenticated } from "@/middlewares/auth";
import {
	createArtist,
	deleteArtist,
	getArtistByName,
	getArtistsByUserID,
} from "@/repository";

const artistRouter = createApp();

artistRouter.use(requireAuthenticated);

artistRouter.get("/search", async (c) => {
	const { artist_name } = c.req.query();

	if (!artist_name) {
		return c.json({}, HttpStatus.Ok.code);
	}

	const url = `https://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${artist_name}&api_key=${env.FM_API}&format=json`;

	const response = await fetch(url);

	if (!response.ok) {
		throw new HTTPException(HttpStatus.InternalServerError.code, {
			message: "Internal Server Error",
		});
	}

	const data = await response.json();

	const artistMatches: ArtistMatchInfo[] = data.results.artistmatches.artist;

	return c.json(
		{
			success: true,
			message: "Artists searched successfully",
			artists: artistMatches ?? [],
		},
		HttpStatus.Ok.code,
	);
});

artistRouter.get("/:id", async (c) => {
	const user = c.get("user");
	const id = c.req.param("id");

	if (!user) {
		throw errors.AuthRequiredErr();
	}

	const artists = await getArtistsByUserID(id);

	if (!artists) {
		throw errors.NotFoundErr();
	}

	return c.json(
		{
			success: true,
			message: "Artists fetched successfully",
			artists,
		},
		HttpStatus.Ok.code,
	);
});

artistRouter.post(
	"/",
	zValidator("json", artistInsertSchema, (result) => {
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

		const artists = await getArtistsByUserID(user.id);

		if (artists.length === 5) {
			throw new HTTPException(HttpStatus.BadRequest.code, {
				message: "Cannot add more than 5 artist",
			});
		}

		const existingArtist = await getArtistByName(
			credentials.artistName,
			user.id,
		);

		if (existingArtist) {
			throw new HTTPException(HttpStatus.BadRequest.code, {
				message: "Cannot add existing artist",
			});
		}

		const newArtist = await createArtist(credentials);

		return c.json({
			success: true,
			message: "Artist created successfully",
			artist: newArtist,
		});
	},
);

artistRouter.delete("/:id", async (c) => {
	const user = c.get("user");
	const artistID = c.req.param("id");

	if (!user) {
		throw errors.AuthRequiredErr();
	}

	await deleteArtist(artistID, user.id);

	return c.json({
		success: true,
		message: "Artist deleted successfully",
	});
});

export default artistRouter;
