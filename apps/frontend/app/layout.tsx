import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Real time team tasks',
    description: 'Fullstack project with Next.js, Node.js, MongoDB, Redis and WebSocket'
}

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) { 
    return (
        <html lang="en">
            <body>{ children}</body>
        </html>
    )
}