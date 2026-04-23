import { NextFunction, Request, Response } from 'express'

type AppError = Error & {
	status?: number
}

export function errorMiddleware(
	err: AppError,
	_req: Request,
	res: Response,
	_next: NextFunction,
) {
	console.error('Unhandled error:', err)

	const status = err.status || 500
	const message = err.message || 'Internal server error'

	return res.status(status).json({
		message,
	})
}
