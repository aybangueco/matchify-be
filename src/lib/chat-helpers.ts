export function sendJsonMessage<T>(data: T): string {
	return JSON.stringify(data);
}
