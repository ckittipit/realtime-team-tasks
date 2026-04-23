type AlertMessageProps = {
	type: 'error' | 'success'
	message: string
}

export default function AlertMessage({ type, message }: AlertMessageProps) {
	if (!message) return null

	const className =
		type === 'error'
			? 'mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300'
			: 'mb-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300'

	return <div className={className}>{message}</div>
}
