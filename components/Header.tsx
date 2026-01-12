'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, User, LogOut, Search, Bell } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Component } from '@/components/ui/animated-menu'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

export default function Header() {
  const router = useRouter()
  const { user, setUser, notifications = [], markNotificationAsRead, markAllNotificationsAsRead, getUnreadNotificationCount } = useStore()
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('my-room-user')
    }
  }

  // 알림 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showNotifications])

  // 알림 클릭 시 해당 게시물로 이동
  const handleNotificationClick = (notification: { id: string; read: boolean; postId?: string }) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id)
    }
    setShowNotifications(false)
    if (notification.postId) {
      router.push(`/post/${notification.postId}`)
    }
  }

  const unreadCount = notifications.length > 0 ? getUnreadNotificationCount() : 0
  const sortedNotifications = Array.isArray(notifications) 
    ? [...notifications].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    : []

  // 왼쪽 메뉴 항목들
  const leftMenuItems: Array<{
    name: string
    type: "description"
    onClick?: () => void
  }> = [
    {
      name: "MYFEED",
      type: "description" as const,
      onClick: user ? () => router.push(`/profile/${user.id}`) : () => router.push('/auth/login'),
    },
    {
      name: "FOLLOWER",
      type: "description" as const,
      onClick: user ? () => router.push('/feed') : () => router.push('/auth/login'),
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
          name: "SEARCH",
          type: "description" as const,
          onClick: () => router.push('/search'),
          icon: <Search size={24} className="text-primary-blue" />,
        },
        {
          name: "POST",
          type: "description" as const,
          onClick: () => router.push('/post/create'),
          icon: <Plus size={24} className="text-primary-blue" />,
        },
        {
          name: "PROFILE",
          type: "description" as const,
          onClick: () => router.push(`/profile/${user.id}`),
          icon: <User size={24} className="text-primary-blue" />,
        },
        {
          name: "LOGOUT",
          type: "description" as const,
          onClick: handleLogout,
          icon: <LogOut size={24} className="text-primary-blue" />,
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
            {/* 알림 아이콘 (로그인한 사용자만) */}
            {user && (
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-primary-blue hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Bell size={24} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="font-bold text-lg">알림</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => {
                            markAllNotificationsAsRead()
                          }}
                          className="text-sm text-primary-blue hover:underline"
                        >
                          모두 읽음
                        </button>
                      )}
                    </div>
                    <div className="overflow-y-auto max-h-[400px]">
                      {sortedNotifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          알림이 없습니다
                        </div>
                      ) : (
                        sortedNotifications.map((notification) => (
                          <button
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {notification.fromUserAvatar ? (
                                <img
                                  src={notification.fromUserAvatar}
                                  alt={notification.fromUserName}
                                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-primary-blue flex items-center justify-center text-white text-sm flex-shrink-0">
                                  {notification.fromUserName.charAt(0)}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold text-sm">
                                    {notification.fromUserName}
                                  </p>
                                  {!notification.read && (
                                    <span className="w-2 h-2 bg-primary-blue rounded-full"></span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                  {notification.type === 'mention' && '님이 멘션했습니다'}
                                  {notification.type === 'like' && '님이 좋아요를 눌렀습니다'}
                                  {notification.type === 'comment' && '님이 댓글을 남겼습니다'}
                                  {notification.type === 'follow' && '님이 팔로우했습니다'}
                                </p>
                                {notification.content && (
                                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                    {notification.content.length > 50
                                      ? notification.content.substring(0, 50) + '...'
                                      : notification.content}
                                  </p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatDistanceToNow(new Date(notification.createdAt), {
                                    addSuffix: true,
                                    locale: ja,
                                  })}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* 오른쪽 메뉴 (SIGNUP, LOGIN / POST, PROFILE, LOGOUT) */}
            <ul className="hidden md:flex items-center gap-3 lg:gap-4">
              {rightMenuItems.map((item, index) => (
                <li
                  className="relative flex cursor-pointer items-center overflow-visible gap-2"
                  key={index}
                  onClick={item.onClick}
                >
                  {item.icon ? (
                    item.icon
                  ) : (
                    <Component
                      className="text-sm lg:text-base font-extrabold uppercase leading-[0.8] tracking-[0.15em] transition-colors text-primary-blue"
                    >
                      {item.name}
                    </Component>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </header>
  )
}


