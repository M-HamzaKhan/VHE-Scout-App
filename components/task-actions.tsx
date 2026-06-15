'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function TaskActions({ taskId, currentStatus }: {
  taskId: number
  currentStatus: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<'accept' | 'decline' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAction(action: 'accept' | 'decline') {
    setLoading(action)
    setError(null)
    const supabase = createClient()
    const newStatus = action === 'accept' ? 'Accepted' : 'Declined'
    const updateData: Record<string, unknown> = {
      status: newStatus,
      updated_at: new Date().toISOString()
    }
    if (action === 'accept') updateData.accepted_time = new Date().toISOString()

    const { error } = await supabase.from('tasks').update(updateData).eq('id', taskId)
    if (error) {
      setError('Failed to update task. Please try again.')
      setLoading(null)
      return
    }
    router.push('/tasks')
    router.refresh()
  }

  if (currentStatus === 'Accepted') {
    return (
      <div className="flex flex-col gap-2">
        <a
          href={`/tasks/${taskId}/submit`}
          className="block w-full py-3.5 rounded-xl bg-green-600 text-white text-sm font-semibold text-center no-underline"
        >
          Submit report
        </a>
        {error && <p className="text-xs text-red-600 text-center">{error}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3">
        <button
          onClick={() => handleAction('decline')}
          disabled={loading !== null}
          className="flex-1 py-3.5 rounded-xl text-white text-sm font-semibold disabled:cursor-not-allowed transition-opacity"
          style={{
            background: loading === 'decline' ? '#fca5a5' : '#dc2626',
            opacity: loading !== null && loading !== 'decline' ? 0.5 : 1
          }}
        >
          {loading === 'decline' ? 'Declining...' : 'Decline'}
        </button>
        <button
          onClick={() => handleAction('accept')}
          disabled={loading !== null}
          className="flex-1 py-3.5 rounded-xl text-white text-sm font-semibold disabled:cursor-not-allowed transition-opacity"
          style={{
            background: loading === 'accept' ? '#4ade80' : '#16a34a',
            opacity: loading !== null && loading !== 'accept' ? 0.5 : 1
          }}
        >
          {loading === 'accept' ? 'Accepting...' : 'Accept task'}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 text-center">{error}</p>}
    </div>
  )
}
