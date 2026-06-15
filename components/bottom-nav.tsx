'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function BottomNav() {
  const path = usePathname()

  const tabs = [
    {
      href: '/tasks',
      label: 'Tasks',
      active: path.startsWith('/tasks'),
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke={active ? '#2563eb' : '#94a3b8'} strokeWidth="2" strokeLinecap="round">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="2"/>
          <line x1="9" y1="12" x2="15" y2="12"/>
          <line x1="9" y1="16" x2="13" y2="16"/>
        </svg>
      )
    },
    {
      href: '/history',
      label: 'History',
      active: path.startsWith('/history'),
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke={active ? '#2563eb' : '#94a3b8'} strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      )
    },
    {
      href: '/pay',
      label: 'Pay',
      active: path.startsWith('/pay'),
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke={active ? '#2563eb' : '#94a3b8'} strokeWidth="2" strokeLinecap="round">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
        </svg>
      )
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {tabs.map(tab => (
        <Link
          key={tab.href}
          href={tab.href}
          prefetch={true}
          className="flex-1 flex flex-col items-center gap-0.5 pt-2 pb-2 no-underline relative"
        >
          {tab.active && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#2563eb] rounded-full" />
          )}
          {tab.icon(tab.active)}
          <span className={[
            'text-[10px]',
            tab.active ? 'text-[#2563eb] font-bold' : 'text-slate-400 font-medium'
          ].join(' ')}>
            {tab.label}
          </span>
        </Link>
      ))}
    </nav>
  )
}
