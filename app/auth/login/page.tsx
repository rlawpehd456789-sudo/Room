'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { useStore } from '@/store/useStore'

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 간단한 검증 (MVP)
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください')
      return
    }

    // 간단한 로그인 처리 (실제로는 API 호출)
    const user = {
      id: Date.now().toString(),
      email,
      name: email.split('@')[0],
    }

    setUser(user)
    router.push('/feed')
  }

  return (
    <div className="min-h-screen bg-primary-gray">
      <Header />
      <main className="pt-20 pb-8">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8 mt-8">
            <h1 className="text-3xl font-bold text-center mb-8">ログイン</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  メールアドレス
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  パスワード
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary-blue text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
              >
                ログイン
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                アカウントをお持ちでない方は{' '}
                <Link href="/auth/register" className="text-primary-blue hover:underline">
                  新規登録
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


