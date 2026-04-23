export type User = {
	_id: string
	googleId: string
	email: string
	name: string
	avatar?: string
	createdAt: string
	updatedAt: string
}

export type Task = {
	_id: string
	title: string
	description?: string
	status: 'todo' | 'doing' | 'done'
	createdBy: string
	assignee?: string
	createdAt: string
	updatedAt: string
}

export type TaskRealtimeEvent =
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
