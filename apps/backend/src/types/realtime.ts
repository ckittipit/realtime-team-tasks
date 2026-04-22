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
