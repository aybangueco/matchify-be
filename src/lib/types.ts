import type { JWTPayload } from "hono/utils/jwt/types";
import type { Session, User } from "@/db/schemas";

export type AppBindings = {
	Variables: {
		user: User | null;
		session: Session | null;
	};
};

export interface UserPayload extends JWTPayload {
	sub: unknown;
}

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
