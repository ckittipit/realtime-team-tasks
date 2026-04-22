import { createClient } from 'redis'
import { env } from '../config/env'

export const redisClient = createClient({
	url: env.REDIS_URL,
})

export const redisPub = createClient({
	url: env.REDIS_URL,
})

export const redisSub = createClient({
	url: env.REDIS_URL,
})

export async function connectRedis() {
	try {
		redisClient.on('error', (err: any) => {
			console.error('❌ Redis client error', err)
		})

		redisPub.on('error', (err) => {
			console.error('❌ Redis publisher error', err)
		})

		redisSub.on('error', (err) => {
			console.error('❌ Redis subscriber error', err)
		})

		if (!redisClient.isOpen) await redisClient.connect() //common task || cache

		if (!redisPub.isOpen) await redisPub.connect() //publish event

		if (!redisSub.isOpen) await redisSub.connect() //subscribe event

		console.log('✅ Redis connected')
	} catch (error) {
		console.error('❌ Redis Connection Failed', error)
		process.exit(1)
	}
}

export function getRedisStatus() {
	return redisClient.isOpen && redisPub.isOpen && redisSub.isOpen
}

export async function getCache<T>(key: string): Promise<T | null> {
	const value = await redisClient.get(key)

	if (!value) return null

	return JSON.parse(value) as T
}

export async function setCache(key: string, value: unknown, ttlSeconds = 60) {
	await redisClient.set(key, JSON.stringify(value), {
		EX: ttlSeconds,
	})
}

export async function deleteCache(key: string) {
	await redisClient.del(key)
}
