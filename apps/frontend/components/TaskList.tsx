import { Task } from '../types'
import TaskItem from './TaskItem'

type TaskListProps = {
	tasks: Task[]
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

export default function TaskList(props: TaskListProps) {
	const { tasks } = props

	return (
		<section className='mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg'>
			<div className='flex items-center justify-between'>
				<h2 className='text-xl font-semibold'>My Tasks</h2>
				<span className='rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300'>
					{tasks.length} tasks
				</span>
			</div>

			<div className='mt-4'>
				{tasks.length === 0 ? (
					<div className='rounded-xl border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-400'>
						No tasks yet. Create your first task above.
					</div>
				) : (
					<div className='space-y-3'>
						{tasks.map((task) => (
							<TaskItem
								key={task._id}
								task={task}
								{...props}
							/>
						))}
					</div>
				)}
			</div>
		</section>
	)
}
