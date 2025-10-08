import { sign, verify } from "hono/jwt";
import type { JWTPayload } from "hono/utils/jwt/types";

export async function generateJWTToken<T extends JWTPayload>({
	payload,
	secret,
}: {
	payload: T;
	secret: string;
}) {
	return await sign(payload, secret);
}

export async function verifyJWTToken({
	token,
	secret,
}: {
	token: string;
	secret: string;
}) {
	return await verify(token, secret);
}
