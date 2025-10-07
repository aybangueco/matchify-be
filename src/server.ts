import app from "./app";
import env from "./config/env";

console.log(`Starting server at PORT ${env.PORT}`);

Bun.serve({
	fetch: app.fetch,
	port: env.PORT,
});
