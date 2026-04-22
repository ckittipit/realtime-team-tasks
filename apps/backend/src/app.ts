import express from 'express'
import cors from 'cors'
import passport from 'passport'
import cookieParser from 'cookie-parser'
import healthRoute from './routes/health.route'
import authRoute from './routes/auth.route'
import taskRoute from './routes/task.route'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import { errorMiddleware } from './middleware/error.middleware'
import { notFoundMiddleware } from './middleware/not-found.middleware'

import { env } from 'process'

const app = express()

app.use(
	cors({
		origin: env.FRONTEND_URL,
		credentials: true,
	}),
)

app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize())

app.use(helmet())

const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 200,
	standardHeaders: true,
	legacyHeaders: false,
})

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 50,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		message: 'Too many auth requests, please try again later',
	},
})

// app.use(apiLimiter)
app.use('/', healthRoute)
app.use('/auth', authLimiter, authRoute)
app.use('/api', apiLimiter)
app.use('/api/tasks', taskRoute)

app.use(notFoundMiddleware)
app.use(errorMiddleware)

export default app
