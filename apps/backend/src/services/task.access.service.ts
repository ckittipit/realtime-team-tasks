import { Task } from '../models/task.model'

export async function getOwnedTaskOrThrow(taskId: string, userId: string) {
	const task = await Task.findById(taskId)

	if (!task) {
		const error = new Error('Task not found') as Error & { status?: number }
		error.status = 404
		throw error
	}

	if (String(task.createdBy) !== userId) {
		const error = new Error('Forbidden') as Error & { status?: number }
		error.status = 403
		throw error
	}

	return task
}
