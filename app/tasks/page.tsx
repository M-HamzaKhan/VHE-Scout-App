import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BottomNav } from '@/components/bottom-nav'
import { LogoutButton } from '@/components/logout-button'

export const maxDuration = 60

function getPriorityColor(isRush: boolean, deadline: string | null) {
  if (isRush) return { border: '#dc2626', badge: '#fee2e2', text: '#dc2626' }
  if (!deadline) return { border: '#2563eb', badge: '#dbeafe', text: '#1d4ed8' }
  const hoursLeft = (new Date(deadline).getTime() - Date.now()) / 3600000
  if (hoursLeft < 24) return { border: '#dc2626', badge: '#fee2e2', text: '#dc2626' }
  if (hoursLeft < 72) return { border: '#d97706', badge: '#fef3c7', text: '#92400e' }
  return { border: '#2563eb', badge: '#dbeafe', text: '#1d4ed8' }
}

function getDeadlineLabel(deadline: string | null, isRush: boolean) {
  if (!deadline) return 'No deadline'
  const hoursLeft = (new Date(deadline).getTime() - Date.now()) / 3600000
  if (isRush) return `Rush · ${Math.max(0, Math.round(hoursLeft))}h left`
  if (hoursLeft < 1) return 'Due now'
  if (hoursLeft < 24) return `Due in ${Math.round(hoursLeft)}h`
  const daysLeft = Math.round(hoursLeft / 24)
  if (daysLeft === 1) return 'Due tomorrow'
  return `Due in ${daysLeft} days`
}

export default async function TasksPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub
  if (!userId) redirect('/auth/login')

  const { data: scout } = await supabase
    .from('scouts')
    .select('id, name, current_tier, market, status')
    .eq('user_id', userId)
    .single()

  if (!scout) {
    return (
      <div className="min-h-svh bg-[#eef1f8] flex flex-col">
        <header className="bg-[#2563eb] border-b border-[#1d4ed8] px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-xl tracking-tight">My Tasks</h1>
            <p className="text-blue-200 text-xs mt-0.5 font-medium">VHE Scout</p>
          </div>
          <LogoutButton />
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-sm text-slate-500 text-center">
            Your scout profile is not set up yet. Contact your Ops Manager.
          </p>
        </div>
        <BottomNav />
      </div>
    )
  }

  if (scout && scout.status === 'Inactive') {
    return (
      <div className="min-h-svh bg-[#eef1f8] flex flex-col">
        <header className="bg-[#2563eb] border-b border-[#1d4ed8] px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-xl tracking-tight">VHE Scout</h1>
          </div>
          <LogoutButton />
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="text-3xl mb-3">⚠️</div>
            <p className="text-sm font-medium text-slate-700 mb-2">Account deactivated</p>
            <p className="text-xs text-slate-500">
              Your account has been deactivated. Contact your Ops Manager for assistance.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      id, status, is_rush, base_pay, final_pay, deadline, dispatch_time,
      leads (property_address, city, market),
      task_types (name, category)
    `)
    .eq('scout_id', scout.id)
    .in('status', ['Dispatched', 'Accepted'])
    .order('deadline', { ascending: true, nullsFirst: false })

  const urgentCount = tasks?.filter(t => t.is_rush).length || 0
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <div className="min-h-svh bg-[#eef1f8] flex flex-col pb-[70px]">

      <header className="flex items-center justify-between px-5 py-4 bg-[#2563eb] border-b border-[#1d4ed8]">
        <div>
          <h1 className="text-white font-bold text-xl tracking-tight">My Tasks</h1>
          <p className="text-blue-200 text-xs mt-0.5 font-medium">{today} · {scout.market} Market</p>
        </div>
        <div className="flex items-center gap-2">
          {urgentCount > 0 && (
            <span className="text-xs font-bold text-red-600 bg-red-100 border border-red-200 px-2.5 py-1 rounded-full">
              {urgentCount} rush
            </span>
          )}
          <LogoutButton />
        </div>
      </header>

      <div className="flex-1 py-3 px-3 flex flex-col gap-1.5">
        {!tasks || tasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center gap-2">
            <div className="text-4xl">✓</div>
            <p className="text-sm font-bold text-[#0f172a]">All caught up</p>
            <p className="text-xs text-slate-500">No active tasks right now. Check back soon.</p>
          </div>
        ) : (
          tasks.map((task: any) => {
            const colors = getPriorityColor(task.is_rush, task.deadline)
            const deadlineLabel = getDeadlineLabel(task.deadline, task.is_rush)
            const lead = task.leads as any
            const taskType = task.task_types as any
            const pay = Number(task.final_pay).toFixed(2)

            return (
              <Link key={task.id} href={`/tasks/${task.id}`} className="no-underline">
                <div
                  className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-4 border-l-4 flex flex-col gap-2"
                  style={{ borderLeftColor: colors.border }}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                      style={{ background: colors.badge, color: colors.text, borderColor: colors.border + '44' }}
                    >
                      {deadlineLabel}
                    </span>
                    <span className="text-green-600 font-bold text-base">${pay}</span>
                  </div>
                  <p className="text-[15px] font-bold text-gray-900 tracking-wide leading-snug">
                    {lead?.property_address || 'Unknown address'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {taskType?.name || 'Task'} · {task.status === 'Accepted' ? '✓ Accepted' : 'Tap to view'}
                  </p>
                </div>
              </Link>
            )
          })
        )}
      </div>

      <BottomNav />
    </div>
  )
}
