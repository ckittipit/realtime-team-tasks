import dotenv from 'dotenv'

dotenv.config()

function getEnv(key: string, defaultValue?: string): string {
	const value = process.env[key] || defaultValue

	if (!value) throw new Error(`Missing environment variable ${key}`)

	return value
}

export const env = {
	PORT: getEnv('BACKEND_PORT', '4000'),
	MONGODB_URI: getEnv('MONGODB_URI'),
	REDIS_URL: getEnv('REDIS_URL'),
	GOOGLE_CLIENT_ID: getEnv('GOOGLE_CLIENT_ID'),
	GOOGLE_CLIENT_SECRET: getEnv('GOOGLE_CLIENT_SECRET'),
	GOOGLE_CALLBACK_URL: getEnv('GOOGLE_CALLBACK_URL'),
	JWT_SECRET: getEnv('JWT_SECRET'),
	FRONTEND_URL: getEnv('FRONTEND_URL', 'http://localhost:3000'),
	NODE_ENV: getEnv('NODE_ENV', 'development'),
}
