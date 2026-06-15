import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { TaskActions } from '@/components/task-actions'

function getDeadlineLabel(deadline: string | null, isRush: boolean) {
  if (!deadline) return 'No deadline'
  const hoursLeft = (new Date(deadline).getTime() - Date.now()) / 3600000
  if (isRush) return `Rush dispatch · ${Math.max(0, Math.round(hoursLeft))}h remaining`
  if (hoursLeft < 1) return 'Due now'
  if (hoursLeft < 24) return `Due in ${Math.round(hoursLeft)} hours`
  const daysLeft = Math.round(hoursLeft / 24)
  return `Due in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`
}

export default async function TaskDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub
  if (!userId) redirect('/auth/login')

  const { data: scout } = await supabase
    .from('scouts')
    .select('id, name, current_tier')
    .eq('user_id', userId)
    .single()
  if (!scout) redirect('/tasks')

  const { data: task } = await supabase
    .from('tasks')
    .select(`
      id, status, is_rush, base_pay, multiplier_applied,
      rush_bonus, final_pay, deadline, report_text,
      leads (property_address, city, market, owner_name),
      task_types (name, category, description, base_pay)
    `)
    .eq('id', parseInt(id))
    .eq('scout_id', scout.id)
    .single()
  if (!task) notFound()

  const lead = task.leads as any
  const taskType = task.task_types as any
  const deadlineLabel = getDeadlineLabel(task.deadline, task.is_rush)

  return (
    <div className="min-h-svh bg-[#eef1f8] flex flex-col">

      <header className="flex items-center justify-between px-5 py-4 bg-[#2563eb] border-b border-[#1d4ed8]">
        <div className="flex items-center gap-3">
          <Link href="/tasks" className="text-blue-200 text-xl no-underline leading-none">←</Link>
          <div>
            <h1 className="text-white font-bold text-xl tracking-tight">Task Detail</h1>
            <p className="text-blue-200 text-xs mt-0.5 font-medium">{taskType?.name || 'Task'}</p>
          </div>
        </div>
        {task.is_rush && (
          <span className="text-xs font-bold text-red-600 bg-red-100 border border-red-200 px-2.5 py-1 rounded-full">
            Rush
          </span>
        )}
      </header>

      <div className="flex-1 px-4 py-4 flex flex-col gap-3 pb-8">

        {/* Property */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Property</p>
          <p className="text-[15px] font-bold text-gray-900 tracking-wide">
            {lead?.property_address || 'Unknown address'}
          </p>
          {lead?.city && <p className="text-sm text-gray-500 mt-1">{lead.city}</p>}
          {lead?.owner_name && <p className="text-xs text-slate-400 mt-1.5">Owner: {lead.owner_name}</p>}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Task instructions</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            {taskType?.description || `Complete the ${taskType?.name || 'assigned task'} for this property and submit your report with photos and notes.`}
          </p>
        </div>

        {/* Pay breakdown */}
        <div className="flex gap-3">
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-4 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Base pay</p>
            <p className="text-2xl font-bold text-[#2563eb] tracking-tight">${Number(task.base_pay).toFixed(2)}</p>
          </div>
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-4 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Your tier</p>
            <p className="text-2xl font-bold text-amber-600 tracking-tight">{task.multiplier_applied}×</p>
            <p className="text-xs text-gray-500 mt-1">{scout.current_tier}</p>
          </div>
        </div>

        {/* Rush bonus */}
        {task.is_rush && task.rush_bonus > 0 && (
          <div className="bg-amber-50 rounded-xl border border-amber-200 px-4 py-3">
            <p className="text-sm text-amber-800 font-semibold">
              Rush dispatch · +${Number(task.rush_bonus).toFixed(2)} bonus applied automatically
            </p>
          </div>
        )}

        {/* Deadline + total */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">{deadlineLabel}</p>
          <p className="text-base font-bold text-gray-900">Total: ${Number(task.final_pay).toFixed(2)}</p>
        </div>

        <TaskActions taskId={task.id} currentStatus={task.status} />
      </div>
    </div>
  )
}
