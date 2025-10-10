import type { JWTPayload } from "hono/utils/jwt/types";

export type AppBindings = {
	Variables: {};
};

export interface UserPayload extends JWTPayload {
	sub: unknown;
}
