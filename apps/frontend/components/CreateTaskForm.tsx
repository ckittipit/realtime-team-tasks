type CreateTaskFormProps = {
	taskTitle: string
	taskLoading: boolean
	onChangeTitle: (value: string) => void
	onCreateTask: () => void
}

export default function CreateTaskForm({
	taskTitle,
	taskLoading,
	onChangeTitle,
	onCreateTask,
}: CreateTaskFormProps) {
	return (
		<section className='rounded-2xl border border-slate-800 bg-late-900 p-6 shadow-lg'>
			<h2 className='text-xl font-semibold'>Create Task</h2>

			<div className='mt-4 space-y-3'>
				<input
					type='text'
					value={taskTitle}
					onChange={(e) => onChangeTitle(e.target.value)}
					placeholder='Enter task title'
					className='w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-400'
				/>
				<button
					onClick={onCreateTask}
					disabled={taskLoading}
					className='rounded-xl bg-blue-500 px-4 py-2 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
				>
					{taskLoading ? 'Creating...' : 'Create Task'}
				</button>
			</div>
		</section>
	)
}
