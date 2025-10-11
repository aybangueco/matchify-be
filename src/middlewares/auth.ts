import { createMiddleware } from "hono/factory";
import type { Session, User } from "@/db/schemas";
import { auth } from "@/lib/auth";
import { errors } from "@/lib/errors";
import type { AppBindings } from "@/lib/types";

export const authenticate = createMiddleware<AppBindings>(async (c, next) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });

	if (!session) {
		c.set("user", null);
		c.set("session", null);
		return next();
	}

	c.set("user", session.user as User);
	c.set("session", session.session as Session);
	return next();
});

export const requireAuthenticated = createMiddleware<AppBindings>(
	async (c, next) => {
		const session = c.get("session");

		if (!session) {
			throw errors.AuthRequiredErr();
		}

		return next();
	},
);
