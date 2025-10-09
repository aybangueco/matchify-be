import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import db from "@/config/db";
import {
	type ProfileInsert,
	type ProfileUpdate,
	profileInsertSchema,
	profilesTable,
	profileUpdateSchema,
} from "@/db/schemas/profiles";
import createApp from "@/lib/create-app";
import { errors } from "@/lib/errors";
import { HttpStatus } from "@/lib/http";
import { requireAuthenticated } from "@/middlewares";

const profileRouter = createApp();

profileRouter.use(requireAuthenticated);

profileRouter.get("/", async (c) => {
	const user = c.get("user");

	if (!user) {
		throw errors.AuthRequiredErr();
	}

	const existingProfile = await db
		.select()
		.from(profilesTable)
		.where(eq(profilesTable.userID, user.id));

	return c.json(
		{
			success: true,
			message: "Profile fetched successfully",
			profile: existingProfile[0],
		},
		HttpStatus.Ok.code,
	);
});

profileRouter.get("/:id", async (c) => {
	const userID = c.req.param("id");

	const existingProfile = await db
		.select()
		.from(profilesTable)
		.where(eq(profilesTable.userID, userID));

	if (!existingProfile[0]) {
		throw errors.NotFoundErr();
	}

	return c.json(
		{
			success: true,
			message: "Profile fetched successfully",
			profile: existingProfile[0],
		},
		HttpStatus.Ok.code,
	);
});

profileRouter.post(
	"/",
	zValidator("json", profileInsertSchema, (result) => {
		if (!result.success) {
			throw errors.ZodValidationErr(result.error);
		}
	}),
	async (c) => {
		const user = c.get("user");

		if (!user) {
			throw errors.AuthRequiredErr();
		}

		const credentials: ProfileInsert = await c.req.json();

		const newProfile = await db
			.insert(profilesTable)
			.values(credentials)
			.returning();

		return c.json({
			success: true,
			message: "Profile created successfully",
			profile: newProfile[0],
		});
	},
);

profileRouter.patch(
	"/:id",
	zValidator("json", profileUpdateSchema, (result) => {
		if (!result.success) {
			throw errors.ZodValidationErr(result.error);
		}
	}),
	async (c) => {
		const user = c.get("user");
		const profileID = c.req.param("id");

		if (!user) {
			throw errors.AuthRequiredErr();
		}

		const credentials: ProfileUpdate = await c.req.json();

		const existingProfile = await db
			.select()
			.from(profilesTable)
			.where(
				and(eq(profilesTable.id, profileID), eq(profilesTable.userID, user.id)),
			);

		if (!existingProfile[0]) {
			throw errors.NotFoundErr();
		}

		const updatedProfile = await db
			.update(profilesTable)
			.set(credentials)
			.where(
				and(eq(profilesTable.id, profileID), eq(profilesTable.userID, user.id)),
			)
			.returning();

		return c.json({
			success: true,
			message: "Profile updated successfully",
			profile: updatedProfile[0],
		});
	},
);

export default profileRouter;
