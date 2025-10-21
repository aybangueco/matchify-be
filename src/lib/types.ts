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

export type WebSocketConnected = {
	type: "CONNECTED";
	connectedTo: {
		username: string;
	};
};

export type WebSocketDisconnected = {
	type: "DISCONNECTED";
	message: string;
};

export type WebSocketMessage = {
	type: "MESSAGE";
	message: string;
	from: string;
};

export type WebSocketState = {
	type: "STATE";
	typing: boolean;
	from: string;
};

export type WebSocketEventData =
	| WebSocketConnected
	| WebSocketDisconnected
	| WebSocketMessage
	| WebSocketState;
