type ValidationResult = {
	isValid: boolean
	message?: string
}

export function validateCreateTask(body: any): ValidationResult {
	if (!body.title || typeof body.title !== 'string')
		return {
			isValid: false,
			message: 'Title is required and must be a string',
		}

	if (body.status && !['todo', 'doing', 'done'].includes(body.status))
		return {
			isValid: false,
			message: 'Invalid status',
		}

	return {
		isValid: true,
	}
}

export function validateUpdateTask(body: any): ValidationResult {
	if (body.title !== undefined && typeof body.title !== 'string')
		return {
			isValid: false,
			message: 'Title must be a string',
		}

	if (body.status && !['todo', 'doing', 'done'].includes(body.status))
		return {
			isValid: false,
			message: 'Invalid status',
		}

	return {
		isValid: true,
	}
}
