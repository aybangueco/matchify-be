import { zValidator } from "@hono/zod-validator";
import * as argon2 from "argon2";
import { eq } from "drizzle-orm";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import db from "@/config/db";
import env from "@/config/env";
import {
	type UserInsert,
	userInsertSchema,
	usersTable,
} from "@/db/schemas/users";
import createApp from "@/lib/create-app";
import { errors } from "@/lib/errors";
import { HttpStatus } from "@/lib/http";
import { generateJWTToken, verifyJWTToken } from "@/lib/jwt";
import type { UserPayload } from "@/lib/types";
import { requireAuthenticated } from "@/middlewares/authMiddleware";

const authRouter = createApp();

authRouter.get("/me", requireAuthenticated, async (c) => {
	const user = c.get("user");

	return c.json(user, HttpStatus.Ok.code);
});

authRouter.post("/refresh", async (c) => {
	const refreshToken = getCookie(c, "refreshToken");

	if (!refreshToken) {
		throw errors.AuthRequiredErr();
	}

	const payload = await verifyJWTToken<UserPayload>({
		token: refreshToken,
		secret: env.REFRESH_TOKEN_KEY,
		issuer: "matchify-api",
	});

	// Get date now so we can add it on iat
	const now = Math.floor(Date.now() / 1000);
	const accessTokenExpiry = now + 60 * 60; // Expires in 1 hour

	const accessToken = await generateJWTToken({
		payload: {
			sub: payload.sub,
			iss: "matchify-api",
			iat: now,
			exp: accessTokenExpiry,
		},
		secret: env.ACCESS_TOKEN_KEY,
	});

	return c.json({
		success: true,
		message: "Access token refreshed successfully",
		accessToken,
	});
});

authRouter.post(
	"/login",
	zValidator(
		"json",
		userInsertSchema.omit({
			email: true,
		}),
		(result) => {
			if (!result.success) {
				throw errors.ZodValidationErr(result.error);
			}
		},
	),
	async (c) => {
		const credentials: UserInsert = await c.req.json();

		const existingUser = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.username, credentials.username));

		if (!existingUser[0]) {
			throw errors.InvalidAuthErr();
		}

		const correctPassword = await argon2.verify(
			existingUser[0].password,
			credentials.password,
		);

		if (!correctPassword) {
			throw errors.InvalidAuthErr();
		}

		// Get date now so we can add it on iat
		const now = Math.floor(Date.now() / 1000);

		const accessTokenExpiry = now + 60 * 60; // Expires in 1 hour
		const accessToken = await generateJWTToken<UserPayload>({
			payload: {
				sub: existingUser[0].id,
				iss: "matchify-api",
				iat: now,
				exp: accessTokenExpiry,
			},
			secret: env.ACCESS_TOKEN_KEY,
		});

		const refreshTokenExpiry = now + 60 * 24 * 60 * 60; // Expires in 60 days
		const refreshToken = await generateJWTToken<UserPayload>({
			payload: {
				sub: existingUser[0].id,
				iss: "matchify-api",
				iat: now,
				exp: refreshTokenExpiry,
			},
			secret: env.REFRESH_TOKEN_KEY,
		});

		const isProd = env.ENV === "production";
		setCookie(c, "refreshToken", refreshToken, {
			path: "/",
			sameSite: isProd ? "Strict" : "Lax",
			secure: isProd,
			httpOnly: isProd,
			expires: new Date(refreshTokenExpiry * 1000),
		});

		return c.json({
			success: true,
			message: "Logged in successfully",
			accessToken,
		});
	},
);

authRouter.post(
	"/register",
	zValidator("json", userInsertSchema, (result) => {
		if (!result.success) {
			throw errors.ZodValidationErr(result.error);
		}
	}),
	async (c) => {
		const credentials: UserInsert = await c.req.json();

		const existingEmail = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.email, credentials.email));

		if (existingEmail[0]) {
			throw new HTTPException(HttpStatus.Conflict.code, {
				message: "Email is already taken",
			});
		}
		const existingUsername = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.username, credentials.username));

		if (existingUsername[0]) {
			throw new HTTPException(HttpStatus.Conflict.code, {
				message: "Username is already taken",
			});
		}

		const hashedPassword = await argon2.hash(credentials.password);

		const newUser = await db
			.insert(usersTable)
			.values({ ...credentials, password: hashedPassword })
			.returning();

		// Get date now so we can add it on iat
		const now = Math.floor(Date.now() / 1000);

		const accessTokenExpiry = now + 60 * 60; // Expires in 1 hour
		const accessToken = await generateJWTToken<UserPayload>({
			payload: {
				sub: newUser[0].id,
				iss: "matchify-api",
				iat: now,
				exp: accessTokenExpiry,
			},
			secret: env.ACCESS_TOKEN_KEY,
		});

		const refreshTokenExpiry = now + 60 * 24 * 60 * 60; // Expires in 60 days
		const refreshToken = await generateJWTToken<UserPayload>({
			payload: {
				sub: newUser[0].id,
				iss: "matchify-api",
				iat: now,
				exp: refreshTokenExpiry,
			},
			secret: env.REFRESH_TOKEN_KEY,
		});

		const isProd = env.ENV === "production";
		setCookie(c, "refreshToken", refreshToken, {
			path: "/",
			sameSite: isProd ? "Strict" : "Lax",
			secure: isProd,
			httpOnly: isProd,
			expires: new Date(refreshTokenExpiry * 1000),
		});

		return c.json(
			{ success: true, message: "Registered successfully", accessToken },
			HttpStatus.Ok.code,
		);
	},
);

// We only remove refresh token from cookies, as we will manually remove
// access token from the client side. The client can still use the access token
// until it expires, but without the refresh token, the client won't be able to
// refreh their access token upon expiry.
authRouter.post("/logout", requireAuthenticated, (c) => {
	deleteCookie(c, "refreshToken");

	return c.json(
		{ success: true, message: "Logged out successfully" },
		HttpStatus.Ok.code,
	);
});

export default authRouter;
