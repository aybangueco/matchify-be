import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import db from "@/config/db";
import env from "@/config/env";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	emailAndPassword: {
		enabled: true,
	},
	plugins: [
		username({
			minUsernameLength: 4,
			maxUsernameLength: 15,
		}),
	],
	trustedOrigins: [env.FE_URL],
});
