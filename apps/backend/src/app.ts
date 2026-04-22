import express from 'express'
import cors from 'cors'
import passport from 'passport'
import cookieParser from 'cookie-parser'
import healthRoute from './routes/health.route'
import authRoute from './routes/auth.route'
import taskRoute from './routes/task.route'

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

app.use('/', healthRoute)
app.use('/auth', authRoute)
app.use('/api/tasks', taskRoute)

export default app
