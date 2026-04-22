import mongoose from 'mongoose'
import { env } from '../config/env'

let isConnected = false

export async function connectMongo() {
	if (isConnected) return

	try {
		await mongoose.connect(env.MONGODB_URI)
		isConnected = true
		console.log('Connected to MongoDB')
	} catch (error) {
		console.error('MongoDB Connection Failed', error)
		process.exit(1)
	}
}

export function getMongoStatus() {
	return mongoose.connection.readyState === 1
	//ready State 1 = Connected, 0 = Disconnected
}
