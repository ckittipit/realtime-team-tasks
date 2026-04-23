'use client'

import { useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import AccountCard from '../components/AccountCard'
import AlertMessage from '../components/AlertMessage'
import CreateTaskForm from '../components/CreateTaskForm'
import TaskList from '../components/TaskList'
import { getApiUrl } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { useTasks } from '../hooks/useTaks'
import { TaskRealtimeEvent } from '../types'
import { use } from 'passport'

export default function HomePage() {
	const {
		user,
		loading,
		error: authError,
		setError: setAuthError,
		login,
		logout,
	} = useAuth()

	const {
		tasks,
		taskTitle,
		taskLoading,
		deletingTaskId,
		updatingTaskId,
		editingTaskId,
		editingTitle,
		savingTaskId,
		error: taskError,
		success,
		setTaskTitle,
		setEditingTitle,
		setError: setTaskError,
		setSuccess,
		fetchTasks,
		createTask,
		deleteTask,
		updateTaskStatus,
		getNextStatus,
		startEdit,
		cancelEdit,
		saveTaskTitle,
		resetTasksState,
	} = useTasks()

	const pageError = taskError || authError

	const getStatusBadgeClass = (status: 'todo' | 'doing' | 'done') => {
		switch (status) {
			case 'todo':
				return 'bg-slate-600 text-white'
			case 'doing':
				return 'bg-amber-400 text-black'
			case 'done':
				return 'bg-emerald-500 text-black'
		}
	}

	useEffect(() => {
		if (user) {
			fetchTasks()
		}
	}, [user])

	useEffect(() => {
		if (!user) return

		const socket: Socket = io(getApiUrl(), {
			withCredentials: true,
			transports: ['websocket'],
		})

		socket.on('connect', () => {
			console.log('Socket connected: ', socket.id)
		})

		socket.on('task:event', async (event: TaskRealtimeEvent) => {
			if (event.payload.userId === user._id) await fetchTasks()
		})

		socket.on('disconnect', () => {
			console.log('Socket disconnected')
		})

		return () => {
			socket.disconnect()
		}
	}, [user])

	const handleLogout = async () => {
		try {
			setTaskError('')
			setAuthError('')
			setSuccess('')

			await logout()
			resetTasksState()
			setSuccess('Logged out successfully')
		} catch (error) {
			setTaskError(
				error instanceof Error ? error.message : 'Failed to logout',
			)
		}
	}

	return (
		<main className='min-h-screen bg-slate-950 px-6 py-12 text-white'>
			<div className='mx-auto max-w-5xl'>
				<div className='mb-8'>
					<h1 className='text-4xl font-bold tracking-tight'>
						Realtime Team Tasks
					</h1>
					<p className='mt-2 text-sm text-slate-300'>
						Step10: Refactored frontend architecture
					</p>
				</div>

				<AlertMessage
					type='error'
					message={pageError}
				/>
				<AlertMessage
					type='success'
					message={success}
				/>

				{loading ? (
					<section className='rounded-2xl border border-slate-800 bg-slate-900 p-6'>
						<p>Checking session...</p>
					</section>
				) : user ? (
					<>
						<div className='grid gap-6 md:grid-cols-2'>
							<AccountCard
								user={user}
								onLogout={handleLogout}
							/>
							<CreateTaskForm
								taskTitle={taskTitle}
								taskLoading={taskLoading}
								onChangeTitle={setTaskTitle}
								onCreateTask={createTask}
							/>
						</div>

						<TaskList
							tasks={tasks}
							editingTaskId={editingTaskId}
							editingTitle={editingTitle}
							savingTaskId={savingTaskId}
							updatingTaskId={updatingTaskId}
							deletingTaskId={deletingTaskId}
							onChangeEditingTitle={setEditingTitle}
							onStartEdit={startEdit}
							onCancelEdit={cancelEdit}
							onSaveTitle={saveTaskTitle}
							onNextStatus={updateTaskStatus}
							onDeleteTask={deleteTask}
							getNextStatus={getNextStatus}
							getStatusBadgeClass={getStatusBadgeClass}
						/>
					</>
				) : (
					<section className='rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg'>
						<p className='mb-4 text-slate-300'>Not logged in</p>
						<button
							onClick={login}
							className='rounded-xl bg-white px-4 py-2 font-medium text-black transition hover:opacity-90'
						>
							Continue with Google
						</button>
					</section>
				)}
			</div>
		</main>
	)
}
