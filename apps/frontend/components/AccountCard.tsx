import { User } from '../types'

type AccountCardProps = {
	user: User
	onLogout: () => void
}

export default function AccountCard({ user, onLogout }: AccountCardProps) {
	return (
		<section className='rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg'>
			<h2 className='text-xl font-semibold'>Account</h2>
			<div className='mt-4 space-y-2 text-sm text-slate-200'>
				<p>
					<strong>Name:</strong> {user.name}
				</p>
				<p>
					<strong>Email:</strong> {user.email}
				</p>
				<p>
					<strong>Google ID: </strong>
					{user.googleId}
				</p>
			</div>
			<button
				onClick={onLogout}
				className='mt-5 rounded-xl bg-red-500 px-4 py-2 font-medium text-white transition hover:opacity-90'
			>
				Logout
			</button>
		</section>
	)
}
