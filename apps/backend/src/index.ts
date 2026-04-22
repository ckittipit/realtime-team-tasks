import http from 'http'
import app from './app'
import { env } from './config/env'
import { connectMongo } from './lib/mongodb'
import { connectRedis } from './lib/redis'
import { initSocketServer, subscribeTaskEvents } from './lib/socket'
import { logger } from './utils/logger'

async function startServer() {
	try {
		logger.info('Starting server...')

		await connectMongo()
		await connectRedis()

		const httpServer = http.createServer(app)

		initSocketServer(httpServer)
		await subscribeTaskEvents()

		httpServer.listen(Number(env.PORT), '0.0.0.0', () => {
			logger.info(`Server is running on port ${env.PORT}`)
		})
	} catch (error) {
		logger.error('Failed to start server', error)
		process.exit(1)
	}
}

startServer()
