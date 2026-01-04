'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, User, LogOut } from 'lucide-react'
import { useStore } from '@/store/useStore'

export default function Header() {
  const pathname = usePathname()
  const { user, setUser } = useStore()

  const handleLogout = () => {
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('my-room-user')
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-primary-gray z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-primary-blue">マイルーム</h1>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className={`flex items-center gap-2 ${
                pathname === '/' || pathname === '/feed'
                  ? 'text-primary-blue'
                  : 'text-primary-dark hover:text-primary-blue'
              }`}
            >
              <Home size={20} />
              <span className="hidden sm:inline">ホーム</span>
            </Link>

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
            ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-opacity-90"
              >
                ログイン
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}


