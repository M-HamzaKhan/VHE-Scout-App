import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BottomNav } from '@/components/bottom-nav'
import { LogoutButton } from '@/components/logout-button'

export const maxDuration = 60

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub
  if (!userId) redirect('/auth/login')

  const { data: scout } = await supabase
    .from('scouts')
    .select('id')
    .eq('user_id', userId)
    .single()
  if (!scout) redirect('/tasks')

  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      id, status, final_pay, completed_time, updated_at,
      leads (property_address),
      task_types (name)
    `)
    .eq('scout_id', scout.id)
    .in('status', ['Completed', 'Declined', 'Approved', 'Rejected'])
    .order('updated_at', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-svh bg-[#eef1f8] flex flex-col pb-[70px]">

      <header className="flex items-center justify-between px-5 py-4 bg-[#2563eb] border-b border-[#1d4ed8]">
        <div>
          <h1 className="text-white font-bold text-xl tracking-tight">History</h1>
          <p className="text-blue-200 text-xs mt-0.5 font-medium">All completed and declined tasks</p>
        </div>
        <LogoutButton />
      </header>

      <div className="flex-1 py-3 px-3 flex flex-col gap-1.5">
        {!tasks || tasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center gap-2">
            <div className="text-4xl">📋</div>
            <p className="text-sm font-semibold text-[#0f172a]">No history yet</p>
            <p className="text-xs text-slate-500">Completed and declined tasks will appear here.</p>
          </div>
        ) : (
          tasks.map((task: any) => {
            const lead = task.leads as any
            const taskType = task.task_types as any
            const isCompleted = task.status === 'Completed' || task.status === 'Approved'
            const date = new Date(task.updated_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric'
            })
            const pay = Number(task.final_pay).toFixed(2)

            return (
              <div
                key={task.id}
                className={[
                  'bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-4',
                  isCompleted ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-slate-300'
                ].join(' ')}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[15px] font-bold text-gray-900 tracking-wide">
                      {lead?.property_address || 'Unknown address'}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {taskType?.name || 'Task'} · {date}
                    </p>
                    <span className={[
                      'mt-2 inline-block text-xs font-bold px-2 py-0.5 rounded-full border',
                      isCompleted
                        ? 'text-green-600 bg-green-50 border-green-200'
                        : 'text-slate-500 bg-slate-50 border-slate-200'
                    ].join(' ')}>
                      {task.status}
                    </span>
                  </div>
                  {isCompleted && (
                    <p className="text-green-600 font-bold text-lg">${pay}</p>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      <BottomNav />
    </div>
  )
}
