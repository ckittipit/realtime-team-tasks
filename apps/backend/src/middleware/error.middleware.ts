import { NextFunction, Request, Response } from 'express'
export function errorMiddleware(
	err: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction,
) {
	console.error('Unhandled error:', err)

	const message = err instanceof Error ? err.message : 'Internal server error'

	return res.status(500).json({
		message,
	})
}
