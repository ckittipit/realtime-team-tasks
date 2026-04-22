'use client'

import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

type User = {
	_id: string
	googleId: string
	email: string
	name: string
	avatar?: string
	createdAt: string
	updatedAt: string
}

type Task = {
	_id: string
	title: string
	description?: string
	status: 'todo' | 'doing' | 'done'
	createdBy: string
	assignee?: string
	createdAt: string
	updatedAt: string
}

type TaskRealtimeEvent =
	| {
			type: 'task:created'
			payload: {
				taskId: string
				userId: string
			}
	  }
	| {
			type: 'task:updated'
			payload: {
				taskId: string
				userId: string
			}
	  }
	| {
			type: 'task:deleted'
			payload: {
				taskId: string
				userId: string
			}
	  }

export default function HomePage() {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	const [tasks, setTasks] = useState<Task[]>([])
	const [taskTitle, setTaskTitle] = useState('')
	const [taskLoading, setTaskLoading] = useState(false)

	const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)
	const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)

	const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
	const [editingTitle, setEditingTitle] = useState('')
	const [savingTaskId, setSavingTaskId] = useState<string | null>(null)

	const [pageError, setPageError] = useState('')
	const [pageSuccess, setPageSuccess] = useState('')

	const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

	useEffect(() => {
		const fetchMe = async () => {
			try {
				const response = await fetch(`${apiUrl}/auth/me`, {
					method: 'GET',
					credentials: 'include',
				})

				if (!response.ok) {
					setLoading(false)
					return
				}

				const data = await response.json()
				setUser(data.user)
				await fetchTasks()
			} catch (error) {
				console.error('Failed to fetch session', error)
				setPageError('Failed to fetch session')
			} finally {
				setLoading(false)
			}
		}

		fetchMe()
	}, [apiUrl])

	useEffect(() => {
		if (!user) return

		const socket: Socket = io(apiUrl, {
			withCredentials: true,
			transports: ['websocket'],
		})

		socket.on('connect', () => {
			console.log('Socket connected: ', socket.id)
		})

		socket.on('task:event', async (event: TaskRealtimeEvent) => {
			console.log('Received realtime event: ', event)

			if (event.payload.userId === user._id) await fetchTasks()
		})

		socket.on('disconnect', () => {
			console.log('Socket disconnected')
		})

		return () => {
			socket.disconnect()
		}
	}, [apiUrl, user])

	const handleLogin = () => {
		window.location.href = `${apiUrl}/auth/google`
	}

	const handleLogout = async () => {
		try {
			clearMessage()

			await fetch(`${apiUrl}/auth/logout`, {
				method: 'POST',
				credentials: 'include',
			})

			setUser(null)
			setTasks([])
			setTaskTitle('')
			setEditingTaskId(null)
			setEditingTitle('')
			setPageSuccess('Logged out successfully')
		} catch (error) {
			console.error('Failed to logout', error)
			setPageError('Failed to logout')
		}
	}

	const fetchTasks = async () => {
		try {
			const response = await fetch(`${apiUrl}/api/tasks`, {
				method: 'GET',
				credentials: 'include',
			})

			if (!response.ok) return

			const data = await response.json()
			setTasks(data.tasks || [])
		} catch (error) {
			console.error('Failed to fetch tasks', error)
			setPageError('Unable to load tasks')
		}
	}

	const handleCreateTask = async () => {
		if (!taskTitle.trim()) {
			setPageError('Please enter a task title')
			return
		}

		try {
			clearMessage()
			setTaskLoading(true)

			const response = await fetch(`${apiUrl}/api/tasks`, {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					title: taskTitle,
				}),
			})

			if (!response.ok) throw new Error('Failed to create task')

			setTaskTitle('')
			await fetchTasks()
			setPageSuccess('Task created succesfully')
		} catch (error) {
			console.error('Failed to create task', error)
			setPageError('Failed to create task')
		} finally {
			setTaskLoading(false)
		}
	}

	const handleDeleteTask = async (taskId: string) => {
		try {
			clearMessage()
			setDeletingTaskId(taskId)

			const response = await fetch(`${apiUrl}/api/tasks/${taskId}`, {
				method: 'DELETE',
				credentials: 'include',
			})

			if (!response.ok) throw new Error('Failed to delete task')

			await fetchTasks()
			setPageSuccess('Task deleted successfully')
		} catch (error) {
			console.error('Failed to delete task')
			setPageError('Failed to delete task')
		} finally {
			setDeletingTaskId(null)
		}
	}

	const handleUpdateTaskStatus = async (
		taskId: string,
		nextStatus: 'todo' | 'doing' | 'done',
	) => {
		try {
			clearMessage()
			setUpdatingTaskId(taskId)

			const response = await fetch(`${apiUrl}/api/tasks/${taskId}`, {
				method: 'PATCH',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					status: nextStatus,
				}),
			})

			if (!response.ok) throw new Error('Failed to update task status')

			await fetchTasks()
			setPageSuccess('Task status updated')
		} catch (error) {
			console.error('Failed to update task status', error)
			setPageError('Failed to update task status')
		} finally {
			setUpdatingTaskId(null)
		}
	}

	const getNextStatus = (status: Task['status']): Task['status'] => {
		if (status === 'todo') return 'doing'
		if (status === 'doing') return 'done'

		return 'todo'
	}

	const handleStartEdit = (task: Task) => {
		setEditingTaskId(task._id)
		setEditingTitle(task.title)
	}

	const handleCancelEdit = () => {
		setEditingTaskId(null)
		setEditingTitle('')
	}

	const handleSaveTaskTitle = async (taskId: string) => {
		if (!editingTitle.trim()) {
			setPageError('Task title can not be empty')
			return
		}

		try {
			clearMessage()
			setSavingTaskId(taskId)

			const response = await fetch(`${apiUrl}/api/tasks/${taskId}`, {
				method: 'PATCH',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					title: editingTitle,
				}),
			})

			if (!response.ok) throw new Error('Failed to update task title')

			await fetchTasks()
			setEditingTaskId(null)
			setEditingTitle('')
			setPageSuccess('Task title updated')
		} catch (error) {
			console.error('Failed to update task title')
			setPageError('Failed to update task title')
		} finally {
			setSavingTaskId(null)
		}
	}

	const clearMessage = () => {
		setPageError('')
		setPageSuccess('')
	}

	const getStatusBadgeClass = (status: Task['status']) => {
		if (status === 'todo') return 'bg-slate-600 text-white'
		if (status === 'doing') return 'bg-amber-400 text-black'

		return 'bg-emerald-500 text-black'
	}

	return (
		<main className='min-h-screen bg-slate-950 px-6 py-12 text-white'>
			<div className='mx-auto max-w-3xl'>
				<h1 className='text-3xl font-bold'>Realtime Team Tasks</h1>
				{/* <p className='mt-2 text-sm text-slate-300'>
					Step 3: Google OAuth + JWT Authentication
				</p> */}
				<p className='mt-2 text-sm text-slate-300'>
					Step 5: Better Task Manegement UX
				</p>

				<section className='mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6'>
					{pageError && (
						<div className='mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300'>
							{pageError}
						</div>
					)}
					{pageSuccess && (
						<div className='mb-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300'>
							{pageSuccess}
						</div>
					)}
					{loading ? (
						<p>กำลังตรวจสอบ session...</p>
					) : user ? (
						<div className='grid gap-6 md:grid-cols-2'>
							<section className='rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg'>
								<h2 className='text-xl font-semibold'>
									Account
								</h2>
								<div className='space-y-2 text-sm text-slate-200'>
									<p>
										<strong>name:</strong> {user.name}
									</p>
									<p>
										<strong>email:</strong> {user.email}
									</p>
									<p>
										<strong>googleId:</strong>{' '}
										{user.googleId}
									</p>
								</div>

								<button
									onClick={handleLogout}
									className='mt-5 rounded-xl bg-red-500 px-4 py-2 font-medium text-white transition hover:opacity-90'
								>
									Logout
								</button>
							</section>
							<section className='rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg'>
								<h2 className='text-xl font-semibold'>
									Create Task
								</h2>

								<div className='mt-4 space-y-3'>
									<input
										type='text'
										value={taskTitle}
										onChange={(e) =>
											setTaskTitle(e.target.value)
										}
										placeholder='Enter task title'
										className='w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-400'
									/>

									<button
										onClick={handleCreateTask}
										disabled={taskLoading}
										className='rounded-xl bg-blue-500 px-4 py-2 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
									>
										{taskLoading
											? 'Creating...'
											: 'Create Task'}
									</button>
								</div>
							</section>
						</div>
					) : (
						<div className='space-y-4'>
							<p>ตอนนี้ยังไม่ได้ login</p>
							<button
								onClick={handleLogin}
								className='rounded-xl bg-white px-4 py-2 font-medium text-black'
							>
								Continue with Google
							</button>
						</div>
					)}
					{user && (
						<section className='mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg'>
							<div className='flex items-center justify-between'>
								<h2 className='text-xl font-semibold'>
									My Tasks
								</h2>
								<span className='rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300'>
									{tasks.length} tasks
								</span>
							</div>

							<div className='mt-4'>
								{tasks.length === 0 ? (
									<div className='rounded-xl border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-400'>
										No tasks yet. Create your first task
										above.
									</div>
								) : (
									<div className='space-y-3'>
										{tasks.map((task) => (
											<div
												key={task._id}
												className='rounded-xl border border-slate-700 bg-slate-800 p-4'
											>
												<div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
													<div className='flex-1'>
														{editingTaskId ===
														task._id ? (
															<div className='space-y-2'>
																<input
																	type='text'
																	value={
																		editingTitle
																	}
																	onChange={(
																		e,
																	) =>
																		setEditingTitle(
																			e
																				.target
																				.value,
																		)
																	}
																	className='w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white outline-none'
																/>
																<div className='flex items-center gap-2'>
																	<span
																		className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClass(task.status)}`}
																	>
																		{
																			task.status
																		}
																	</span>
																</div>
															</div>
														) : (
															<div>
																<p className='font-medium text-white'>
																	{task.title}
																</p>
																<div className='mt-2 flex items-center gap-2'>
																	<span
																		className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClass(task.status)}`}
																	>
																		{
																			task.status
																		}
																	</span>
																</div>
															</div>
														)}
													</div>

													<div className='flex flex-wrap gap-2'>
														{editingTaskId ===
														task._id ? (
															<>
																<button
																	onClick={() =>
																		handleSaveTaskTitle(
																			task._id,
																		)
																	}
																	disabled={
																		savingTaskId ===
																		task._id
																	}
																	className='rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-black disabled:opacity-50'
																>
																	{savingTaskId ===
																	task._id
																		? 'Saving...'
																		: 'Save'}
																</button>

																<button
																	onClick={
																		handleCancelEdit
																	}
																	disabled={
																		savingTaskId ===
																		task._id
																	}
																	className='rounded-lg bg-slate-500 px-3 py-2 text-sm font-medium text-white disabled:opacity-50'
																>
																	Cancel
																</button>
															</>
														) : (
															<>
																<button
																	onClick={() =>
																		handleStartEdit(
																			task,
																		)
																	}
																	className='rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white transition hover:opacity-90'
																>
																	Edit
																</button>

																<button
																	onClick={() =>
																		handleUpdateTaskStatus(
																			task._id,
																			getNextStatus(
																				task.status,
																			),
																		)
																	}
																	disabled={
																		updatingTaskId ===
																		task._id
																	}
																	className='rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-50'
																>
																	{updatingTaskId ===
																	task._id
																		? 'Updating...'
																		: 'Next Status'}
																</button>

																<button
																	onClick={() =>
																		handleDeleteTask(
																			task._id,
																		)
																	}
																	disabled={
																		deletingTaskId ===
																		task._id
																	}
																	className='rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50'
																>
																	{deletingTaskId ===
																	task._id
																		? 'Deleting...'
																		: 'Delete'}
																</button>
															</>
														)}
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</section>
					)}
				</section>
			</div>
		</main>
	)
}
