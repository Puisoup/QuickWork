'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import { sendMessage } from '../app/dashboard/chat-actions'

type Message = {
    id: string
    content: string
    createdAt: Date
    senderId: string
    receiverId: string
}

export default function Chat({
    requestId,
    currentUserId,
    otherUserId,
    initialMessages,
    title,
    otherUserProfileId,
}: {
    requestId: string
    currentUserId: string
    otherUserId: string
    initialMessages: Message[]
    title?: string
    /** Öffentliches Profil des Chat-Partners (Kunde / Experte / Firma) */
    otherUserProfileId?: string
}) {
    const scrollRef = useRef<HTMLDivElement>(null)

    const displayMessages = initialMessages.filter(m =>
        (m.senderId === currentUserId && m.receiverId === otherUserId) ||
        (m.senderId === otherUserId && m.receiverId === currentUserId)
    )

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [displayMessages])

    return (
        <div className="flex h-64 flex-col rounded-lg border border-gray-200 bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900">
            {title && (
                <div className="flex items-center justify-between gap-2 rounded-t-lg border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{title}</span>
                    {otherUserProfileId && (
                        <Link
                            href={`/profile/${otherUserProfileId}`}
                            className="shrink-0 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                        >
                            Profil
                        </Link>
                    )}
                </div>
            )}
            <div className="flex-1 space-y-2 overflow-y-auto p-4" ref={scrollRef}>
                {displayMessages.length === 0 && (
                    <p className="mt-10 text-center text-xs italic text-gray-400">Noch keine Nachrichten.</p>
                )}
                {displayMessages.map((msg) => {
                    const isMe = msg.senderId === currentUserId
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg p-2 text-sm ${isMe ? 'bg-blue-600 text-white' : 'border border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800'}`}>
                                <p>{msg.content}</p>
                                <div className={`mt-1 text-[10px] ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
            <form action={async (formData) => {
                await sendMessage(formData)
            }} className="flex gap-2 border-t border-gray-200 p-2 dark:border-zinc-700">
                <input type="hidden" name="requestId" value={requestId} />
                <input type="hidden" name="receiverId" value={otherUserId} />
                <input
                    name="content"
                    required
                    placeholder="Nachricht schreiben…"
                    autoComplete="off"
                    className="flex-1 rounded-md border border-gray-300 px-3 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                />
                <button type="submit" className="rounded-md bg-blue-600 px-3 py-1 text-sm font-bold text-white">
                    ➤
                </button>
            </form>
        </div>
    )
}
