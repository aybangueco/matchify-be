import z, { flattenError } from "zod";

const envSchema = z.object({
	FE_URL: z.string().nonempty(),
	PORT: z.string().nonempty(),

	DATABASE_URL: z.string().nonempty(),

	ACCESS_TOKEN_KEY: z.string().nonempty(),
	REFRESH_TOKEN_KEY: z.string().nonempty(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	console.error(flattenError(parsed.error));
	process.exit(1);
}

const env = parsed.data;
export default env;
