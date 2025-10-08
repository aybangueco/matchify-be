import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import env from "./config/env";
import createApp from "./lib/create-app";
import { handleAPIErrors, handleNotFoundRoutes } from "./lib/errors";
import { authRouter } from "./routes";

const app = createApp();

const isProd = env.ENV === "production";

app.use(
	"*",
	cors({
		origin: env.FE_URL,
		allowHeaders: ["X-Custom-Header", "Upgrade-Insecure-Requests"],
		allowMethods: ["POST", "GET", "OPTIONS"],
		exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
		maxAge: 600,
		credentials: isProd,
	}),
);
app.use(csrf({ origin: env.FE_URL }));
app.use(logger());
app.use(prettyJSON());

app.route("/auth", authRouter);

app.notFound(handleNotFoundRoutes);
app.onError(handleAPIErrors);

export default app;
