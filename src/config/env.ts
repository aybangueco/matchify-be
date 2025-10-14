import z, { flattenError } from "zod";

const envSchema = z.object({
	APP_URL: z.string().nonempty(),
	FE_URL: z.string().nonempty(),
	PORT: z.string().nonempty(),
	ENV: z.enum(["production", "development"]).nonoptional(),

	DATABASE_URL: z.string().nonempty(),
	REDIS_URL: z.string().nonempty(),

	FM_API: z.string().nonempty(),

	BETTER_AUTH_SECRET: z.string().nonempty(),
	BETTER_AUTH_URL: z.string().nonempty(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	console.error(flattenError(parsed.error));
	process.exit(1);
}

const env = parsed.data;
export default env;
