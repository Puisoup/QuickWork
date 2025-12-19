'use client'

import { useState, useRef, useEffect } from 'react'
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
    title
}: {
    requestId: string
    currentUserId: string
    otherUserId: string
    initialMessages: Message[]
    title?: string
}) {
    // For PoC we just use initialMessages. 
    // Ideally we would poll or use swr/react-query to refresh.
    // To keep it dead simple: we just use the revalidated server data passed in as props.
    // The user has to refresh usage manually or we rely on the form action revalidatePath.

    const scrollRef = useRef<HTMLDivElement>(null)

    // Filter messages to only show the conversation between these two users
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
        <div className="flex flex-col h-64 border rounded-lg bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-700">
            {title && (
                <div className="p-2 border-b border-gray-200 dark:border-zinc-700 font-bold text-xs bg-gray-100 dark:bg-zinc-800 rounded-t-lg">
                    {title}
                </div>
            )}
            <div className="flex-1 overflow-y-auto p-4 space-y-2" ref={scrollRef}>
                {displayMessages.length === 0 && (
                    <p className="text-gray-400 text-xs text-center italic mt-10">Noch keine Nachrichten.</p>
                )}
                {displayMessages.map((msg) => {
                    const isMe = msg.senderId === currentUserId
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg p-2 text-sm ${isMe ? 'bg-blue-600 text-white' : 'bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700'}`}>
                                <p>{msg.content}</p>
                                <div className={`text-[10px] mt-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
            <form action={async (formData) => {
                await sendMessage(formData);
                // In a client component using server action with revalidatePath, 
                // Next.js should handle the refresh automatically.
            }} className="p-2 border-t border-gray-200 dark:border-zinc-700 flex gap-2">
                <input type="hidden" name="requestId" value={requestId} />
                <input type="hidden" name="receiverId" value={otherUserId} />
                <input
                    name="content"
                    required
                    placeholder="Nachricht schreiben..."
                    autoComplete="off"
                    className="flex-1 text-sm border border-gray-300 dark:border-zinc-600 rounded-md px-3 py-1 dark:bg-zinc-800"
                />
                <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-bold">
                    ➤
                </button>
            </form>
        </div>
    )
}
