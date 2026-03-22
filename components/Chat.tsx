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
  className = '',
}: {
  requestId: string
  currentUserId: string
  otherUserId: string
  initialMessages: Message[]
  title?: string
  otherUserProfileId?: string
  className?: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const displayMessages = initialMessages.filter(
    (m) =>
      (m.senderId === currentUserId && m.receiverId === otherUserId) ||
      (m.senderId === otherUserId && m.receiverId === currentUserId),
  )

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [displayMessages])

  return (
    <div
      className={`flex h-72 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900 ${className}`.trim()}
    >
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/80">
          <span className="truncate text-base font-semibold text-zinc-900 dark:text-white">{title}</span>
          {otherUserProfileId && (
            <Link
              href={`/profile/${otherUserProfileId}`}
              className="shrink-0 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-amber-700 shadow-sm ring-1 ring-zinc-200 transition hover:bg-amber-50 dark:bg-zinc-900 dark:text-amber-300 dark:ring-zinc-600 dark:hover:bg-zinc-800"
            >
              Profil
            </Link>
          )}
        </div>
      )}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4" ref={scrollRef}>
        {displayMessages.length === 0 && (
          <p className="mt-12 text-center text-base text-zinc-400 dark:text-zinc-500">Noch keine Nachrichten.</p>
        )}
        {displayMessages.map((msg) => {
          const isMe = msg.senderId === currentUserId
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-base leading-relaxed ${
                  isMe
                    ? 'bg-blue-600 text-white'
                    : 'border border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100'
                }`}
              >
                <p>{msg.content}</p>
                <div className={`mt-1.5 text-xs ${isMe ? 'text-blue-100' : 'text-zinc-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <form
        action={async (formData) => {
          await sendMessage(formData)
        }}
        className="flex gap-2 border-t border-zinc-200 p-3 dark:border-zinc-700"
      >
        <input type="hidden" name="requestId" value={requestId} />
        <input type="hidden" name="receiverId" value={otherUserId} />
        <input
          name="content"
          required
          placeholder="Nachricht schreiben …"
          autoComplete="off"
          className="min-h-[44px] flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-blue-600 px-5 py-2.5 text-base font-semibold text-white transition hover:bg-blue-700"
        >
          Senden
        </button>
      </form>
    </div>
  )
}
