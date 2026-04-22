import { Server as HttpServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { env } from '../config/env'
import { redisPub, redisSub } from './redis'
import { TaskRealtimeEvent } from '../types/realtime'

let io: SocketIOServer | null = null

const TASK_EVENTS_CHANNEL = 'tasks-events'

export function initSocketServer(httpServer: HttpServer) {
	io = new SocketIOServer(httpServer, {
		cors: {
			origin: env.FRONTEND_URL,
			credentials: true,
		},
	})

	io.on('connection', (socket) => {
		console.log(`⚡ Socket connected: ${socket.id}`)

		socket.on('disconnect', () => {
			console.log(`🔌 Socket disconnected: ${socket.id}`)
		})
	})

	return io
}

export async function subscribeTaskEvents() {
	await redisSub.subscribe(TASK_EVENTS_CHANNEL, (message) => {
		try {
			const event = JSON.parse(message) as TaskRealtimeEvent

			if (io) io.emit('task:event', event)
		} catch (error) {
			console.error('Failed to parse task event', error)
		}
	})

	console.log(`✅ Subscribed Redis channel: ${TASK_EVENTS_CHANNEL}`)
}

export function getTaskEventsChannel() {
	return TASK_EVENTS_CHANNEL
}

export async function publishTaskEvent(event: TaskRealtimeEvent) {
	await redisPub.publish(TASK_EVENTS_CHANNEL, JSON.stringify(event))
}
