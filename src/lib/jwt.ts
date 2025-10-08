import { sign, verify } from "hono/jwt";
import type { JWTPayload } from "hono/utils/jwt/types";

export async function generateJWTToken<T extends JWTPayload>({
	payload,
	secret,
}: {
	payload: T;
	secret: string;
}) {
	return await sign(payload, secret, "HS256");
}

export async function verifyJWTToken<T extends JWTPayload>({
	token,
	secret,
	issuer,
}: {
	token: string;
	secret: string;
	issuer: string;
}): Promise<T> {
	return (await verify(token, secret, { alg: "HS256", iss: issuer })) as T;
}
