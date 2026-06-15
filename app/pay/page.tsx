import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BottomNav } from '@/components/bottom-nav'
import { LogoutButton } from '@/components/logout-button'

function getTierProgress(monthlyCount: number, tierName: string) {
  const tiers = [
    { name: 'Scout', min: 0, max: 4, next: 'Pro Scout', multiplier: '1.00×' },
    { name: 'Pro Scout', min: 5, max: 9, next: 'Elite Scout', multiplier: '1.10×' },
    { name: 'Elite Scout', min: 10, max: 14, next: 'Market Lead', multiplier: '1.20×' },
    { name: 'Market Lead', min: 15, max: 19, next: 'Senior Lead', multiplier: '1.35×' },
    { name: 'Senior Lead', min: 20, max: null, next: null, multiplier: '1.50×' },
  ]
  const current = tiers.find(t => t.name === tierName) || tiers[0]
  const tasksInTier = monthlyCount - current.min
  const tierSize = current.max ? current.max - current.min + 1 : 5
  const progress = Math.min(100, Math.round((tasksInTier / tierSize) * 100))
  const tasksToNext = current.max ? current.max - monthlyCount + 1 : 0
  return { current, progress, tasksToNext }
}

export default async function PayPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub
  if (!userId) redirect('/auth/login')

  const { data: scout } = await supabase
    .from('scouts')
    .select('id, name, current_tier, monthly_task_count, market')
    .eq('user_id', userId)
    .single()
  if (!scout) redirect('/tasks')

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [{ data: completedTasks }, { data: pendingTasks }, { data: bonuses }] = await Promise.all([
    supabase.from('tasks').select('final_pay, status, completed_time')
      .eq('scout_id', scout.id).eq('status', 'Completed')
      .gte('completed_time', startOfMonth.toISOString()),
    supabase.from('tasks').select('final_pay')
      .eq('scout_id', scout.id).in('status', ['Dispatched', 'Accepted']),
    supabase.from('sprint_bonuses').select('bonus_type, amount, status, earned_date')
      .eq('scout_id', scout.id).order('earned_date', { ascending: false }),
  ])

  const monthlyEarnings = completedTasks?.reduce((sum, t) => sum + Number(t.final_pay), 0) || 0
  const pendingPay = pendingTasks?.reduce((sum, t) => sum + Number(t.final_pay), 0) || 0
  const { current: tierInfo, progress, tasksToNext } = getTierProgress(
    scout.monthly_task_count, scout.current_tier
  )
  const month = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-svh bg-[#eef1f8] flex flex-col pb-[70px]">

      <header className="flex items-center justify-between px-5 py-4 bg-[#2563eb] border-b border-[#1d4ed8]">
        <div>
          <h1 className="text-white font-bold text-xl tracking-tight">My Pay</h1>
          <p className="text-blue-200 text-xs mt-0.5 font-medium">{month}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full">
            {scout.current_tier} · {tierInfo.multiplier}
          </span>
          <LogoutButton />
        </div>
      </header>

      <div className="flex-1 px-4 py-4 flex flex-col gap-3">

        <div className="flex gap-3">
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-4 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">This month</p>
            <p className="text-3xl font-bold text-green-600 tracking-tight">${monthlyEarnings.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">{completedTasks?.length || 0} tasks done</p>
          </div>
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-4 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Pending</p>
            <p className="text-3xl font-bold text-[#2563eb] tracking-tight">${pendingPay.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">{pendingTasks?.length || 0} active tasks</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-bold text-gray-900">Tier progress</p>
            <p className="text-xs text-gray-500">{scout.monthly_task_count} tasks this month</p>
          </div>
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 bg-amber-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {tierInfo.next && tasksToNext > 0 && (
            <p className="text-xs text-amber-600 font-semibold mt-2">
              {tasksToNext} more task{tasksToNext > 1 ? 's' : ''} → {tierInfo.next} ({
                tierInfo.next === 'Pro Scout' ? '1.10×' :
                tierInfo.next === 'Elite Scout' ? '1.20×' :
                tierInfo.next === 'Market Lead' ? '1.35×' : '1.50×'
              })
            </p>
          )}
          {!tierInfo.next && (
            <p className="text-xs text-green-600 font-semibold mt-2">Maximum tier reached 🏆</p>
          )}
        </div>

        {bonuses && bonuses.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-4">
            <p className="text-sm font-bold text-gray-900 mb-3">Sprint bonuses</p>
            <div className="flex flex-col">
              {bonuses.map((bonus, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-2.5"
                  style={{ borderBottom: i < bonuses.length - 1 ? '1px solid #f1f5f9' : 'none' }}
                >
                  <p className="text-sm font-semibold text-gray-900">{bonus.bonus_type}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-green-600">${Number(bonus.amount).toFixed(2)}</p>
                    <span className={[
                      'text-xs font-bold px-2 py-0.5 rounded-full border',
                      bonus.status === 'Paid'
                        ? 'text-green-700 bg-green-50 border-green-200'
                        : 'text-amber-700 bg-amber-50 border-amber-200'
                    ].join(' ')}>
                      {bonus.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-4 text-center">
            <p className="text-sm font-bold text-gray-900 mb-1">Sprint bonuses</p>
            <p className="text-xs text-slate-400">Complete sprint tasks to earn bonuses</p>
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  )
}
