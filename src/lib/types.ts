import type { JWTPayload } from "hono/utils/jwt/types";
import type { Session, User } from "@/db/schemas";

export type AppBindings = {
	Variables: {
		user: User | null;
		session: Session | null;
	};
};

export interface UserPayload extends JWTPayload {
	sub: unknown;
}
