import { Router, Response } from 'express'
import {
	requireAuth,
	AuthenticatedRequest,
} from '../middleware/auth.middleware'
import {
	createTask,
	getTasksByUser,
	getTaskById,
	updateTask,
	deleteTask,
} from '../services/task.service'
import {
	validateCreateTask,
	validateUpdateTask,
} from '../validators/task.validator'
import { publishTaskEvent } from '../lib/socket'
import { asyncHandler } from '../utils/async-handler'
import { ok, created, badRequest, notFound } from '../utils/response'
import { getOwnedTaskOrThrow } from '../services/task.access.service'

const router = Router()

router.post(
	'/',
	requireAuth,
	asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
		const result = validateCreateTask(req.body)

		if (!result.isValid) {
			return badRequest(res, result.message || 'Invalid task payload')
		}

		const task = await createTask({
			title: req.body.title,
			description: req.body.description,
			status: req.body.status,
			createdBy: req.auth!.userId,
		})

		await publishTaskEvent({
			type: 'task:created',
			payload: {
				taskId: String(task._id),
				userId: req.auth!.userId,
			},
		})

		return created(res, { task })
	}),
)

router.get(
	'/',
	requireAuth,
	asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
		const tasks = await getTasksByUser(req.auth!.userId)
		return ok(res, { tasks })
	}),
)

router.get(
	'/:id',
	requireAuth,
	asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
		const task = await getTaskById(String(req.params.id))

		if (!task) {
			return notFound(res, 'Task not found')
		}

		if (String(task.createdBy) !== req.auth!.userId) {
			const error = new Error('Forbidden') as Error & { status?: number }
			error.status = 403
			throw error
		}

		return ok(res, { task })
	}),
)

router.patch(
	'/:id',
	requireAuth,
	asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
		const result = validateUpdateTask(req.body)

		if (!result.isValid) {
			return badRequest(res, result.message || 'Invalid task payload')
		}

		await getOwnedTaskOrThrow(String(req.params.id), req.auth!.userId)

		const updated = await updateTask(String(req.params.id), req.body)

		if (!updated) {
			return notFound(res, 'Task not found')
		}

		await publishTaskEvent({
			type: 'task:updated',
			payload: {
				taskId: req.params.id,
				userId: req.auth!.userId,
			},
		})

		return ok(res, { task: updated })
	}),
)

router.delete(
	'/:id',
	requireAuth,
	asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
		await getOwnedTaskOrThrow(String(req.params.id), req.auth!.userId)

		const deletedTask = await deleteTask(String(req.params.id))

		if (!deletedTask) {
			return notFound(res, 'Task not found')
		}

		await publishTaskEvent({
			type: 'task:deleted',
			payload: {
				taskId: String(req.params.id),
				userId: req.auth!.userId,
			},
		})

		return ok(res, { message: 'Task deleted' })
	}),
)

export default router
