import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import {
	profileInsertSchema,
	profileUpdateSchema,
} from "@/db/schemas/profiles";
import createApp from "@/lib/create-app";
import { errors } from "@/lib/errors";
import { HttpStatus } from "@/lib/http";
import { requireAuthenticated } from "@/middlewares/auth";
import {
	createProfile,
	getProfileByUserID,
	updateProfileByID,
} from "@/repository";

const profileRouter = createApp();

profileRouter.use(requireAuthenticated);

profileRouter.get("/", async (c) => {
	const user = c.get("user");

	if (!user) {
		throw errors.AuthRequiredErr();
	}

	const profile = await getProfileByUserID(user.id);

	return c.json(
		{
			success: true,
			message: "Profile fetched successfully",
			profile,
		},
		HttpStatus.Ok.code,
	);
});

profileRouter.get("/:id", async (c) => {
	const userID = c.req.param("id");

	const profile = await getProfileByUserID(userID);

	if (!profile) {
		throw errors.NotFoundErr();
	}

	return c.json(
		{
			success: true,
			message: "Profile fetched successfully",
			profile,
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

		const existingProfile = await getProfileByUserID(user.id);

		if (existingProfile) {
			throw new HTTPException(HttpStatus.BadRequest.code, {
				message: "Existing profile exist",
			});
		}

		const credentials = c.req.valid("json");
		credentials.userID = user.id;

		const newProfile = await createProfile(credentials);

		return c.json(
			{
				success: true,
				message: "Profile created successfully",
				profile: newProfile,
			},
			HttpStatus.Created.code,
		);
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
		const credentials = c.req.valid("json");
		const profileID = c.req.param("id");

		if (!user) {
			throw errors.InvalidAuthErr();
		}

		const updatedProfile = await updateProfileByID({
			profileID,
			userID: user?.id,
			data: credentials,
		});

		return c.json(
			{
				success: true,
				message: "Profile updated successfully",
				profile: updatedProfile,
			},
			HttpStatus.Ok.code,
		);
	},
);

export default profileRouter;
