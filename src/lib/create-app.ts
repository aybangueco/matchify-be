import { Hono } from "hono";
import type { AppBindings } from "./types";

export default function createApp() {
	const app = new Hono<AppBindings>();

	return app;
}
