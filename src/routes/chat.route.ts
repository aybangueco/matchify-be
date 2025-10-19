import type { Context } from "hono";
import { upgradeWebSocket } from "hono/bun";
import redis from "@/config/redis";
import createApp from "@/lib/create-app";
import type {
	AppBindings,
	WebSocketMessage,
	WSSessionContext,
} from "@/lib/types";
import { requireAuthenticated } from "@/middlewares/auth";
import { getArtistsByUserID } from "@/repository";

const chatRouter = createApp();

const sessionConnections = new Map<string, WSSessionContext>();

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

				const artistsQueue = await redis.keys("queue-artist:*");
				const existingQueue = await redis.get(`queue-artist:${user.id}`);

				const topArtists = await getArtistsByUserID(user.id);

				// Set user to have active session connection
				if (!sessionConnections.has(user.id)) {
					sessionConnections.set(user.id, {
						info: { username: user.username ?? "N/A" },
						room: null,
						ws,
					});
				}

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

							// Update websocket room sessions of users
							const user1 = sessionConnections.get(user.id);
							const user2 = sessionConnections.get(splittedCandidateKey[1]);

							if (user1 && user2) {
								// Create room storing both users
								await redis.hmset(roomId, [
									"first-user",
									user.id,
									"second-user",
									splittedCandidateKey[1],
								]);

								// Update websocket reference of existing users sessions
								sessionConnections.set(user.id, {
									info: user1.info,
									room: roomId,
									ws,
								});
								sessionConnections.set(splittedCandidateKey[1], {
									info: user2.info,
									room: roomId,
									ws: user2.ws,
								});

								const artists =
									common.length === 1
										? common[0].artistName
										: common.length === 2
											? `${common[0].artistName} & ${common[1].artistName}`
											: `${common
													.slice(0, -1)
													.map((e) => e.artistName)
													.join(
														", ",
													)} and ${common[common.length - 1].artistName}`;

								// Broadcast to users the current status of their matchmaking
								user1.ws.send(
									JSON.stringify({
										type: "CONNECTED",
										connectedTo: user2.info,
									}),
								);
								user1.ws.send(
									JSON.stringify({
										type: "MESSAGE",
										message: `You matched with ${user2.info.username} and you both listen to ${artists}`,
										from: "SYSTEM",
									}),
								);

								user2.ws.send(
									JSON.stringify({
										type: "CONNECTED",
										connectedTo: user1.info,
									}),
								);

								user2.ws.send(
									JSON.stringify({
										type: "MESSAGE",
										message: `You matched with ${user1.info.username} and you both listen to ${artists}`,
										from: "SYSTEM",
									}),
								);
							}

							break;
						}
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
			async onMessage(event, ws) {
				const user = c.get("user");

				if (!user) {
					ws.send(
						JSON.stringify({
							type: "DISCONNECTED",
							message: "Disconnected from server",
						}),
					);
					return ws.close();
				}

				const userWSSession = sessionConnections.get(user.id);

				if (!userWSSession || !userWSSession.room) {
					ws.send(
						JSON.stringify({
							type: "DISCONNECTED",
							message: "Disconnected from server",
						}),
					);
					return ws.close();
				}

				const usersRoom = await redis.hvals(userWSSession.room);

				const otherID = user.id !== usersRoom[0] ? usersRoom[0] : usersRoom[1];
				const otherWSSession = sessionConnections.get(otherID);

				if (!otherWSSession || !otherWSSession.room) {
					ws.send(
						JSON.stringify({
							type: "DISCONNECTED",
							message: "Disconnected from server",
						}),
					);
					return ws.close();
				}

				const message = event.data;
				const parsedMessage: WebSocketMessage = JSON.parse(message as string);

				if (parsedMessage.from === user.id) {
					otherWSSession.ws.send(
						JSON.stringify({
							type: "MESSAGE",
							message: parsedMessage.message,
							from: user.id,
						}),
					);
				} else {
					userWSSession.ws.send(
						JSON.stringify({
							type: "MESSAGE",
							message: parsedMessage.message,
							from: otherID,
						}),
					);
				}
			},
			async onClose(_event, ws) {
				const user = c.get("user");

				if (!user) {
					ws.send(
						JSON.stringify({
							type: "DISCONNECTED",
							message: "Disconnected from server",
						}),
					);
					return ws.close();
				}

				// Queue cleanup
				const existingQueue = await redis.get(`queue-artist:${user.id}`);
				if (existingQueue) {
					console.log("User deleted from queue");
					await redis.del(`queue-artist:${user.id}`);
				}

				// Room cleanup when other user disconnects
				const userWSSession = sessionConnections.get(user.id);
				if (userWSSession && userWSSession.room !== null) {
					const usersRoom = await redis.hvals(userWSSession.room);

					const otherID =
						usersRoom[0] !== user.id ? usersRoom[0] : usersRoom[1];
					const otherWSSession = sessionConnections.get(otherID);

					// Delete room
					redis.del(userWSSession.room);

					otherWSSession?.ws.send(
						JSON.stringify({
							type: "DISCONNECTED",
							message: "Disconnected from server",
						}),
					);

					otherWSSession?.ws.send(
						JSON.stringify({
							type: "MESSAGE",
							message: `${user.username} disconnected`,
							from: "SYSTEM",
						}),
					);

					// Delete socket session of other user
					sessionConnections.delete(otherID);
				}

				// Final cleanup
				sessionConnections.delete(user.id);
				console.log("Connection closed");
			},
		};
	}),
);

export default chatRouter;
