'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, User, LogOut } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Component } from '@/components/ui/animated-menu'

export default function Header() {
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
      onClick: user ? () => router.push(`/profile/${user.id}`) : undefined,
    },
    {
      name: "FOLLOWER",
      type: "description" as const,
    },
  ]

  // 오른쪽 메뉴 항목들 (로그인 상태에 따라 변경)
  const rightMenuItems: Array<{
    name: string
    type: "description"
    onClick?: () => void
    icon?: React.ReactNode
  }> = user
    ? [
        {
          name: "POST",
          type: "description" as const,
          onClick: () => router.push('/post/create'),
          icon: <Plus size={20} className="text-primary-blue" />,
        },
        {
          name: "PROFILE",
          type: "description" as const,
          onClick: () => router.push(`/profile/${user.id}`),
          icon: <User size={20} className="text-primary-blue" />,
        },
        {
          name: "LOGOUT",
          type: "description" as const,
          onClick: handleLogout,
          icon: <LogOut size={20} className="text-primary-blue" />,
        },
      ]
    : [
        {
          name: "SIGNUP",
          type: "description" as const,
          onClick: () => router.push('/auth/register'),
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
            {/* 오른쪽 메뉴 (SIGNUP, LOGIN / POST, PROFILE, LOGOUT) */}
            <ul className="hidden md:flex items-center gap-3 lg:gap-4">
              {rightMenuItems.map((item, index) => (
                <li
                  className="relative flex cursor-pointer items-center overflow-visible gap-2"
                  key={index}
                  onClick={item.onClick}
                >
                  {item.icon && item.icon}
                  <Component
                    className="text-sm lg:text-base font-extrabold uppercase leading-[0.8] tracking-[0.15em] transition-colors text-primary-blue"
                  >
                    {item.name}
                  </Component>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </header>
  )
}


