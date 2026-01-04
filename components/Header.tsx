'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Plus, User, LogOut } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Component } from '@/components/ui/animated-menu'

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, setUser } = useStore()

  const handleLogout = () => {
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('my-room-user')
    }
  }

  // 왼쪽 메뉴 항목들
  const leftMenuItems: Array<{
    name: string
    type: "description"
    onClick?: () => void
  }> = [
    {
      name: "MYFEED",
      type: "description" as const,
    },
    {
      name: "FOLLOWER",
      type: "description" as const,
    },
  ]

  // 오른쪽 메뉴 항목들
  const rightMenuItems: Array<{
    name: string
    type: "description"
    onClick?: () => void
  }> = [
    {
      name: "SIGNUP",
      type: "description" as const,
      onClick: () => router.push('/auth/login'),
    },
    {
      name: "LOGIN",
      type: "description" as const,
      onClick: () => router.push('/auth/login'),
    },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-primary-gray z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4 md:gap-6">
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-blue">ROOMING</h1>
            </Link>
            
            {/* 왼쪽 메뉴 (MYFEED, FOLLOWER) */}
            <ul className="hidden md:flex items-center gap-3 lg:gap-4">
              {leftMenuItems.map((item, index) => (
                <li
                  className="relative flex cursor-pointer items-center overflow-visible"
                  key={index}
                  onClick={item.onClick}
                >
                  <Component
                    className="text-sm lg:text-base font-extrabold uppercase leading-[0.8] tracking-[0.15em] transition-colors text-primary-blue"
                  >
                    {item.name}
                  </Component>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-6">
            {/* 오른쪽 메뉴 (SIGNUP, LOGIN) */}
            <ul className="hidden md:flex items-center gap-3 lg:gap-4">
              {rightMenuItems.map((item, index) => (
                <li
                  className="relative flex cursor-pointer items-center overflow-visible"
                  key={index}
                  onClick={item.onClick}
                >
                  <Component
                    className="text-sm lg:text-base font-extrabold uppercase leading-[0.8] tracking-[0.15em] transition-colors text-primary-blue"
                  >
                    {item.name}
                  </Component>
                </li>
              ))}
            </ul>

            <nav className="flex items-center gap-6">
              {user ? (
                <>
                  <Link
                    href="/post/create"
                    className="flex items-center gap-2 text-primary-dark hover:text-primary-blue"
                  >
                    <Plus size={20} />
                    <span className="hidden sm:inline">投稿</span>
                  </Link>
                  <Link
                    href={`/profile/${user.id}`}
                    className={`flex items-center gap-2 ${
                      pathname?.startsWith('/profile')
                        ? 'text-primary-blue'
                        : 'text-primary-dark hover:text-primary-blue'
                    }`}
                  >
                    <User size={20} />
                    <span className="hidden sm:inline">プロフィール</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-primary-dark hover:text-primary-blue"
                  >
                    <LogOut size={20} />
                    <span className="hidden sm:inline">ログアウト</span>
                  </button>
                </>
              ) : null}
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}


