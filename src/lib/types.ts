import type { JWTPayload } from "hono/utils/jwt/types";
import type { auth } from "./auth";

export type AppBindings = {
	Variables: {
		user: typeof auth.$Infer.Session.user | null;
		session: typeof auth.$Infer.Session.session | null;
	};
};

export interface UserPayload extends JWTPayload {
	sub: unknown;
}
