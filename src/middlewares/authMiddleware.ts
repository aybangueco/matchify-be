import { eq } from "drizzle-orm";
import { createMiddleware } from "hono/factory";
import { JwtTokenExpired } from "hono/utils/jwt/types";
import db from "@/config/db";
import env from "@/config/env";
import { usersTable } from "@/db/schemas/users";
import { errors } from "@/lib/errors";
import { verifyJWTToken } from "@/lib/jwt";
import type { AppBindings, UserPayload } from "@/lib/types";

export const authenticate = createMiddleware<AppBindings>(async (c, next) => {
	const authorization = c.req.header("Authorization");

	if (!authorization || !authorization.startsWith("Bearer ")) {
		c.set("user", null);
		return await next();
	}

	const token = authorization.replace("Bearer ", "");

	try {
		const payload = await verifyJWTToken<UserPayload>({
			token,
			secret: env.ACCESS_TOKEN_KEY,
			issuer: "matchify-api",
		});

		const user = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.id, payload.sub as string));

		if (!user[0]) {
			c.set("user", null);
		}

		c.set("user", user[0]);
	} catch (err) {
		if (err instanceof JwtTokenExpired) {
			c.set("user", null);
		}
	} finally {
		await next();
	}
});

export const requireAuthenticated = createMiddleware<AppBindings>(
	async (c, next) => {
		const user = c.get("user");

		if (!user) {
			throw errors.AuthRequiredErr();
		}

		await next();
	},
);
