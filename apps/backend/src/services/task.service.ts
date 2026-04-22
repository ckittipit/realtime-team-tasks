import { Task } from '../models/task.model'
import { getCache, setCache, deleteCache } from '../lib/redis'
import { getUserTasksCacheKey } from '../utils/cache'
import mongoose from 'mongoose'

export async function createTask(data: {
	title: string
	description?: string
	status?: string
	createdBy: string
}) {
	const createdTask = await Task.create({
		...data,
		createdBy: new mongoose.Types.ObjectId(data.createdBy),
	})

	const cacheKey = getUserTasksCacheKey(data.createdBy)
	await deleteCache(cacheKey)

	return createdTask
}

export async function getTasksByUser(userId: string) {
	const cacheKey = getUserTasksCacheKey(userId)
	const cachedTasks = await getCache<any[]>(cacheKey)

	if (cachedTasks) {
		console.log('Cache hit: ', cacheKey)
		return cachedTasks
	}

	console.log(`Cache miss: ${cacheKey}`)

	const tasks = await Task.find({ createdBy: userId })
		.sort({ createdAt: -1 })
		.lean()

	await setCache(cacheKey, tasks, 60)

	return tasks
}

export async function getTaskById(id: string) {
	return Task.findById(id)
}

export async function updateTask(id: string, data: any) {
	const existingTask = await Task.findById(id)

	if (!existingTask) return null

	const updatedTask = await Task.findByIdAndUpdate(id, data, {
		returnDocument: 'after',
	})

	const cacheKey = getUserTasksCacheKey(String(existingTask.createdBy))
	await deleteCache(cacheKey)

	return updatedTask
	// return Task.findByIdAndUpdate(id, data, { returnDocument: 'after' })
}

export async function deleteTask(id: string) {
	const existingTask = await Task.findById(id)

	if (!existingTask) return null

	await Task.findByIdAndDelete(id)

	const cacheKey = getUserTasksCacheKey(String(existingTask.createdBy))
	await deleteCache(cacheKey)

	return existingTask
	// return Task.findByIdAndDelete(id)
}
