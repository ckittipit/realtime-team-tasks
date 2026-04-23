import { Task } from '../types'

type TaskItemProps = {
	task: Task
	editingTaskId: string | null
	editingTitle: string
	savingTaskId: string | null
	updatingTaskId: string | null
	deletingTaskId: string | null
	onChangeEditingTitle: (value: string) => void
	onStartEdit: (task: Task) => void
	onCancelEdit: () => void
	onSaveTitle: (taskId: string) => void
	onNextStatus: (taskId: string, nextStatus: Task['status']) => void
	onDeleteTask: (taskId: string) => void
	getNextStatus: (status: Task['status']) => Task['status']
	getStatusBadgeClass: (status: Task['status']) => string
}

export default function TaskItem({
	task,
	editingTaskId,
	editingTitle,
	savingTaskId,
	updatingTaskId,
	deletingTaskId,
	onChangeEditingTitle,
	onStartEdit,
	onCancelEdit,
	onSaveTitle,
	onNextStatus,
	onDeleteTask,
	getNextStatus,
	getStatusBadgeClass,
}: TaskItemProps) {
	return (
		<div className='rounded-xl border border-slate-700 bg-slate-800 p-4'>
			<div className='flex flex-col gap-4 lg:flex-row lg:item-start lg:justify-between'>
				<div className='flex-1'>
					{editingTaskId === task._id ? (
						<div className='space-y-2'>
							<input
								type='text'
								value={editingTitle}
								onChange={(e) =>
									onChangeEditingTitle(e.target.value)
								}
								className='w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white outline-none'
							/>
							<div className='flex items-center gap-2'>
								<span
									className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClass(task.status)}`}
								>
									{task.status.toUpperCase()}
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
									{task.status.toUpperCase()}
								</span>
							</div>
						</div>
					)}
				</div>
				<div className='flex flex-wrap gap-2'>
					{editingTaskId === task._id ? (
						<>
							<button
								onClick={() => onSaveTitle(task._id)}
								disabled={savingTaskId === task._id}
								className='rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-black disabled:opacity-50'
							>
								{savingTaskId === task._id
									? 'Saving...'
									: 'Save'}
							</button>
							<button
								onClick={onCancelEdit}
								disabled={savingTaskId === task._id}
								className='rounded-lg bg-slate-500 px-3 py-2 text-sm font-medium tetx-white disabled:opacity-50'
							>
								Cancel
							</button>
						</>
					) : (
						<>
							<button
								onClick={() => onStartEdit(task)}
								className='rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white transition hover:opacity-90'
							>
								Edit
							</button>
							<button
								onClick={() =>
									onNextStatus(
										task._id,
										getNextStatus(task.status),
									)
								}
								disabled={updatingTaskId === task._id}
								className='rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-50'
							>
								{updatingTaskId === task._id
									? 'Updating...'
									: 'Next Status'}
							</button>
							<button
								onClick={() => onDeleteTask(task._id)}
								disabled={deletingTaskId === task._id}
								className='rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50'
							>
								{deletingTaskId === task._id
									? 'Deleting...'
									: 'Delete'}
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	)
}
