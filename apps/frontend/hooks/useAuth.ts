'use client'

import { useEffect, useState } from 'react'
import { apiFetch, getApiUrl } from '../lib/api'
import { User } from '../types'

export function useAuth() {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	useEffect(() => {
		const fetchMe = async () => {
			try {
				const data = await apiFetch<{ user: User }>('/auth/me', {
					method: 'GET',
				})

				setUser(data.user)
			} catch (error) {
				setError(
					error instanceof Error
						? error.message
						: 'Failed to load session',
				)
			} finally {
				setLoading(false)
			}
		}

		fetchMe()
	}, [])

	const login = () => {
		window.location.href = `${getApiUrl()}/auth/google`
	}

	const logout = async () => {
		await apiFetch<{ message: string }>('/auth/logout', {
			method: 'POST',
		})

		setUser(null)
	}

	return {
		user,
		loading,
		error,
		setError,
		setUser,
		login,
		logout,
	}
}
