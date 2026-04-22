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

const router = Router()

// CREATE
router.post(
	'/',
	requireAuth,
	async (req: AuthenticatedRequest, res: Response) => {
		const error = validateCreateTask(req.body)
		if (error) return res.status(400).json({ message: error })

		const task = await createTask({
			...req.body,
			createdBy: req.auth!.userId,
		})

		await publishTaskEvent({
			type: 'task:created',
			payload: {
				taskId: String(task._id),
				userId: req.auth!.userId,
			},
		})

		return res.status(201).json({ task })
	},
)

// READ ALL
router.get(
	'/',
	requireAuth,
	async (req: AuthenticatedRequest, res: Response) => {
		const tasks = await getTasksByUser(req.auth!.userId)
		return res.json({ tasks })
	},
)

// READ ONE
router.get(
	'/:id',
	requireAuth,
	async (req: AuthenticatedRequest, res: Response) => {
		const task = await getTaskById(String(req.params.id))

		if (!task) return res.status(404).json({ message: 'Task not found' })

		// authorization
		if (String(task.createdBy) !== req.auth!.userId)
			return res.status(403).json({ message: 'Forbidden' })

		return res.json({ task })
	},
)

// UPDATE
router.patch(
	'/:id',
	requireAuth,
	async (req: AuthenticatedRequest, res: Response) => {
		const error = validateUpdateTask(req.body)
		if (error) return res.status(400).json({ message: error })

		const task = await getTaskById(String(req.params.id))

		if (!task) return res.status(404).json({ message: 'Task not found' })

		// authorization
		if (String(task.createdBy) !== req.auth!.userId)
			return res.status(403).json({ message: 'Forbidden' })

		const updated = await updateTask(String(req.params.id), req.body)

		await publishTaskEvent({
			type: 'task:updated',
			payload: {
				taskId: String(req.params.id),
				userId: req.auth!.userId,
			},
		})

		return res.json({ task: updated })
	},
)

// DELETE
router.delete(
	'/:id',
	requireAuth,
	async (req: AuthenticatedRequest, res: Response) => {
		const task = await getTaskById(String(req.params.id))

		if (!task) return res.status(404).json({ message: 'Task not found' })

		// authorization
		if (String(task.createdBy) !== req.auth!.userId)
			return res.status(403).json({ message: 'Forbidden' })

		await deleteTask(String(req.params.id))

		await publishTaskEvent({
			type: 'task:deleted',
			payload: {
				taskId: String(req.params.id),
				userId: req.auth!.userId,
			},
		})

		return res.json({ message: 'Task deleted' })
	},
)

export default router
