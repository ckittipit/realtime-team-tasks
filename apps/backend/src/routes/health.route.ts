import { Router } from 'express'
import { getMongoStatus } from '../lib/mongodb'
import { getRedisStatus } from '../lib/redis'

const router = Router()

router.get('/health', (_req, res) => {
	const mongo = getMongoStatus()
	const redis = getRedisStatus()

	const status = mongo && redis ? 'ok' : 'degraded'

	res.status(status === 'ok' ? 200 : 503).json({
		status,
		services: {
			mongo,
			redis,
		},
		timestamp: new Date().toDateString(),
	})
})

export default router
