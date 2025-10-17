import type { WSContext } from "hono/ws";
import type { Session, User } from "@/db/schemas";

export type AppBindings = {
	Variables: {
		user: User | null;
		session: Session | null;
	};
};

export type ArtistMatchInfoImage = {
	"#text": string;
	size: "small" | "medium" | "large" | "extralarge";
};

export interface ArtistMatchInfo {
	name: string;
	listeners: string;
	mbid: string;
	url: string;
	streamable: string;
	image: ArtistMatchInfoImage[];
}

export interface WSSessionContext {
	info: {
		username: string;
	};
	room: string | null;
	ws: WSContext;
}

export type WebSocketMessage = {
	type: "MESSAGE";
	message: string;
	fromID: string;
};
