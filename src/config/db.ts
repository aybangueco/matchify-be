import { drizzle } from "drizzle-orm/node-postgres";
import env from "./env";

const db = drizzle({
	connection: {
		connectionString: env.DATABASE_URL,
		ssl: false,
	},
});

export default db;
