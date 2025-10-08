import type { JWTPayload } from "hono/utils/jwt/types";
import type { User } from "@/db/schemas/users";

export type AppBindings = {
	Variables: {
		user: User | null;
	};
};

export interface UserPayload extends JWTPayload {
	sub: unknown;
}
