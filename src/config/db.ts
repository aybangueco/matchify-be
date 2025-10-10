import { drizzle } from "drizzle-orm/node-postgres";
import * as schemas from "@/db/schemas";
import env from "./env";

const db = drizzle({
	connection: {
		connectionString: env.DATABASE_URL,
		ssl: false,
	},
	schema: schemas,
});

export default db;
