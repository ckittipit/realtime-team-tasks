'use client'

import { useState } from 'react'
import { apiFetch } from '../lib/api'
import { Task } from '../types'
import { clear } from 'console'
import { set } from 'mongoose'

export function useTasks() {
	const [tasks, setTasks] = useState<Task[]>([])
	const [taskTitle, setTaskTitle] = useState('')
	const [taskLoading, setTaskLoading] = useState(false)
	const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)
	const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)
	const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
	const [editingTitle, setEditingTitle] = useState('')
	const [savingTaskId, setSavingTaskId] = useState<string | null>(null)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	const clearMessage = () => {
		setError('')
		setSuccess('')
	}

	const fetchTasks = async () => {
		try {
			const data = await apiFetch<{ tasks: Task[] }>('/api/tasks', {
				method: 'GET',
			})

			setTasks(data.tasks || [])
		} catch (error) {
			setError(
				error instanceof Error ? error.message : 'Unable to load tasks',
			)
		}
	}

	const createTask = async () => {
		if (!taskTitle.trim()) {
			setError('Please enter a task title')
			return
		}

		try {
			clearMessage()
			setTaskLoading(true)

			await apiFetch<{ task: Task }>('/api/tasks', {
				method: 'POST',
				body: JSON.stringify({
					title: taskTitle,
				}),
			})

			setTaskTitle('')
			await fetchTasks()
			setSuccess('Task created successfully')
		} catch (error) {
			setError(
				error instanceof Error
					? error.message
					: 'Failed to create task',
			)
		} finally {
			setTaskLoading(false)
		}
	}

	const deleteTask = async (taskId: string) => {
		try {
			clearMessage()
			setDeletingTaskId(taskId)

			await apiFetch<{ message: string }>(`/api/tasks/${taskId}`, {
				method: 'DELETE',
			})

			await fetchTasks()
			setSuccess('Task deleted successfully')
		} catch (error) {
			setError(
				error instanceof Error
					? error.message
					: 'Failed to delete task',
			)
		} finally {
			setDeletingTaskId(null)
		}
	}

	const getNextStatus = (status: Task['status']): Task['status'] => {
		switch (status) {
			case 'todo':
				return 'doing'
			case 'doing':
				return 'done'
			case 'done':
				return 'todo'
		}
	}

	const updateTaskStatus = async (
		taskId: string,
		nextStatus: Task['status'],
	) => {
		try {
			clearMessage()
			setUpdatingTaskId(taskId)

			await apiFetch<{ task: Task }>(`/api/tasks/${taskId}`, {
				method: 'PATCH',
				body: JSON.stringify({
					status: nextStatus,
				}),
			})

			await fetchTasks()
			setSuccess('Task status updated successfully')
		} catch (error) {
			setError(
				error instanceof Error
					? error.message
					: 'Failed to update task',
			)
		} finally {
			setUpdatingTaskId(null)
		}
	}

	const startEdit = (task: Task) => {
		setEditingTaskId(task._id)
		setEditingTitle(task.title)
	}

	const cancelEdit = () => {
		setEditingTaskId(null)
		setEditingTitle('')
	}

	const saveTaskTitle = async (taskId: string) => {
		if (!editingTitle.trim()) {
			setError('Task title can not be empty!')
			return
		}

		try {
			clearMessage()
			setSavingTaskId(taskId)

			await apiFetch<{ task: Task }>(`/api/tasks/${taskId}`, {
				method: 'PATCH',
				body: JSON.stringify({
					title: editingTitle,
				}),
			})

			await fetchTasks()
			setEditingTaskId(null)
			setEditingTitle('')
			setSuccess('Task title updated successfully')
		} catch (error) {
			setError(
				error instanceof Error
					? error.message
					: 'Failed to update task title',
			)
		} finally {
			setSavingTaskId(null)
		}
	}

	const resetTasksState = () => {
		setTasks([])
		setTaskTitle('')
		setEditingTaskId(null)
		setEditingTitle('')
		clearMessage()
	}

	return {
		tasks,
		taskTitle,
		setTaskTitle,
		taskLoading,
		deletingTaskId,
		updatingTaskId,
		editingTaskId,
		editingTitle,
		setEditingTitle,
		savingTaskId,
		error,
		success,
		setSuccess,
		setError,
		fetchTasks,
		createTask,
		deleteTask,
		getNextStatus,
		updateTaskStatus,
		startEdit,
		cancelEdit,
		saveTaskTitle,
		resetTasksState,
	}
}
