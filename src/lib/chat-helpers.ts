import redis from "@/config/redis";

export function sendJsonMessage<T>(data: T): string {
	return JSON.stringify(data);
}

/**
 * Setup chat queue based on the type that can be used for matchmaking logic.
 * @param type
 * @param userID
 *
 * @returns
 * An object containing:
 * - `chatQueue`: Array of queue keys that currently exist.
 * - `existingQueue`: The existing queue assigned to the user, if any.
 */
export async function setupChatQueue(type: string, userID: string) {
	const chatQueue = await redis.keys(`queue-${type}:*`);
	const existingQueue = await redis.get(`queue-${type}:${userID}`);

	return {
		chatQueue,
		existingQueue,
	};
}

/**
 * Add's user to the list of queue based on the type.
 * @param type
 * @param userID
 * @param matchingType
 * @returns
 */
export async function addUserToQueue(
	type: string,
	userID: string,
	matchingType: string[],
) {
	return await redis.set(
		`queue-${type}:${userID}`,
		JSON.stringify(matchingType),
	);
}

/**
 * Deletes user from the queue based on the type.
 * @param type
 * @param userID
 * @returns
 */
export async function deleteUserFromQueue(type: string, userID: string) {
	return await redis.del(`queue-${type}:${userID}`);
}

export async function createRoom(userID: string, matchedUserID: string) {
	const roomId = `room:${userID}-${matchedUserID}`;
	await redis.hmset(roomId, [
		"first-user",
		userID,
		"second-user",
		matchedUserID,
	]);

	console.log(`room created: ${roomId}`);

	return roomId;
}
