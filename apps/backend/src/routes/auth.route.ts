import { Router, Request, Response } from 'express'
import passport from 'passport'
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20'
import { env } from '../config/env'
import { findOrCreateGoogleUser } from '../services/auth.service'
import { signAccessToken } from '../utils/jwt'
import {
	requireAuth,
	AuthenticatedRequest,
} from '../middleware/auth.middleware'
import { User } from '../models/user.model'

const router = Router()

passport.use(
	new GoogleStrategy(
		{
			clientID: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
			callbackURL: env.GOOGLE_CALLBACK_URL,
		},
		async (_accessToken, _refreshToken, profile: Profile, done) => {
			try {
				const email = profile.emails?.[0]?.value
				const avatar = profile.photos?.[0]?.value

				if (!email)
					return done(
						new Error('Google account dose not provide email'),
						false,
					)

				const user = await findOrCreateGoogleUser({
					googleId: profile.id,
					email,
					name: profile.displayName || 'Unknown User',
					avatar,
				})

				return done(null, {
					userId: String(user._id),
					email: user.email,
				})
			} catch (error) {
				return done(error as Error, false)
			}
		},
	),
)

router.get(
	'/google',
	passport.authenticate('google', {
		scope: ['profile', 'email'],
		session: false,
	}),
)

router.get(
	'/google/callback',
	passport.authenticate('google', {
		session: false,
		failureRedirect: `${env.FRONTEND_URL}/login?error=google_auth_failed`,
	}),
	async (req: Request, res: Response) => {
		const authUser = req.user as unknown as {
			userId: string
			email: string
		}
		const token = signAccessToken({
			userId: authUser.userId,
			email: authUser.email,
		})

		res.cookie('accessToken', token, {
			httpOnly: true,
			secure: env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		})

		return res.redirect(`${env.FRONTEND_URL}`)
	},
)

router.get(
	'/me',
	requireAuth,
	async (req: AuthenticatedRequest, res: Response) => {
		const userId = req.auth?.userId
		const user = await User.findById(userId).select('-__v')

		return res.status(200).json({
			user,
		})
	},
)

router.post('/logout', (_req: Request, res: Response) => {
	res.clearCookie('accessToken', {
		httpOnly: true,
		secure: env.NODE_ENV === 'production',
		sameSite: 'lax',
	})

	return res.status(200).json({
		message: 'Logged out successfully',
	})
})

export default router
