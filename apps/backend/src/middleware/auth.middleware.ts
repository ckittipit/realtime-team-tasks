import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import { User } from '../models/user.model'

export type AuthenticatedRequest = Request & {
	auth?: {
		userId: string
		email: string
	}
}

export async function requireAuth(
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const token = req.cookies?.accessToken

		if (!token) {
			res.status(401).json({
				message: 'Unauthorized: missing access token',
			})
			return
		}

		const payload = verifyAccessToken(token)

		const user = await User.findById(payload.userId)

		if (!user) {
			res.status(401).json({
				message: 'Unauthorized: user not found',
			})
			return
		}

		req.auth = {
			userId: String(user._id),
			email: user.email,
		}

		next()
	} catch (_error) {
		res.status(401).json({
			message: 'Unauthorized: invalid or expired token',
		})
	}
}
