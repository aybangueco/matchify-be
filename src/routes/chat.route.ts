import type { Context } from "hono";
import { upgradeWebSocket } from "hono/bun";
import type { WSContext } from "hono/ws";
import redis from "@/config/redis";
import createApp from "@/lib/create-app";
import type { AppBindings } from "@/lib/types";
import { requireAuthenticated } from "@/middlewares/auth";
import { getArtistsByUserID } from "@/repository";

const chatRouter = createApp();

const sessionConnections = new Map<string, WSContext>();

chatRouter.use(requireAuthenticated);

chatRouter.get(
	"/artist",
	upgradeWebSocket((c: Context<AppBindings>) => {
		return {
			async onOpen(_event, ws) {
				const user = c.get("user");
				if (!user) {
					return ws.close();
				}

				// Storing user's websocket sessionConnections
				// if no existing user have sessionConnections we can skip it
				const existingConnection = sessionConnections.get(user.id);

				if (!existingConnection) {
					sessionConnections.set(user.id, ws);
				}

				const artistsQueue = await redis.keys("queue-artist:*");
				const existingQueue = await redis.get(`queue-artist:${user.id}`);

				const topArtists = await getArtistsByUserID(user.id);

				// Matching logic
				for (const key of artistsQueue) {
					const candidate = await redis.get(key);

					// This means if there is candidate and if candidate is not equal to the user itself
					// we will compare the current user to the candidate
					if (candidate && key !== `queue-artist:${user.id}`) {
						const candidateArtists: string[] = JSON.parse(candidate);

						const common = topArtists.filter((a) =>
							candidateArtists.includes(a.artistName),
						);

						if (common.length > 0) {
							console.log("Match found");
							const splittedCandidateKey = key.split(":");
							const roomId = `room:${user.id}-${splittedCandidateKey[1]}`;

							console.log(`room created: ${roomId}`);

							// Delete matched users from queue
							await redis.del(`queue-artist:${user.id}`);
							await redis.del(key);

							// Store users in redis room referencing both of their id
							await redis.hmset(roomId, [
								"first-user",
								user.id,
								"second-user",
								splittedCandidateKey[1],
							]);

							// Broadcast to both users when they have matched
							const user1 = sessionConnections.get(user.id);
							const user2 = sessionConnections.get(splittedCandidateKey[1]);

							if (user1)
								user1.send(
									JSON.stringify({ type: "CONNECTED", message: "Match found" }),
								);

							if (user2)
								user2.send(
									JSON.stringify({ type: "CONNECTED", message: "Match found" }),
								);
						}

						break;
					}
				}

				// If no matched found we add the user to the queue instead
				if (!existingQueue) {
					console.log("User added to queue");
					await redis.set(
						`queue-artist:${user.id}`,
						JSON.stringify(topArtists.map((t) => t.artistName)),
					);
				}
			},
			async onMessage(event, ws) {},
			async onClose() {
				const user = c.get("user");

				if (!user) return;

				console.log("User deleted from queue");
				await redis.del(`queue-artist:${user.id}`);

				const rooms = await redis.keys("room:*");

				for (const room of rooms) {
					const match = room.match(/^room:(.+)-(.+)$/);
					if (!match) continue;

					const [, userA, userB] = match;

					if (user.id === userA || user.id === userB) {
						const otherUserId = user.id === userA ? userB : userA;

						console.log(`Cleaning up room: ${room}`);
						await redis.del(room);

						// Disconnect the other user if still connected
						const otherUserWS = sessionConnections.get(otherUserId);
						if (otherUserWS) {
							otherUserWS.send(
								JSON.stringify({
									type: "DISCONNECTED",
									message: "The other user has left the chat.",
								}),
							);
							otherUserWS.close();
							sessionConnections.delete(otherUserId);
						}

						// Clean up current user session
						sessionConnections.delete(user.id);
						break; // no need to continue searching rooms
					}
				}

				console.log("Connection closed");
			},
		};
	}),
);

export default chatRouter;
