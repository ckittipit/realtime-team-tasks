export function validateCreateTask(body: any) {
	if (!body.title || typeof body.title !== 'string')
		return 'Title is required and must be a string'
	if (body.status && !['todo', 'doing', 'done'].includes(body.status))
		return 'Invalid status'

	return null
}

export function validateUpdateTask(body: any) {
	if (body.title && typeof body.title !== 'string')
		return 'Title must be a string'
	if (body.status && !['todo', 'doing', 'done'].includes(body.status))
		return 'Invalid status'

	return null
}
