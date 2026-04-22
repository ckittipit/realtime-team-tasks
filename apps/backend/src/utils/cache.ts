export function getUserTasksCacheKey(userId: string) {
	return `tasks:user:${userId}`
}
