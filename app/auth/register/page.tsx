'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { useStore, User } from '@/store/useStore'

// localStorage에서 사용자 목록 가져오기
const getUsersFromStorage = (): User[] => {
  if (typeof window === 'undefined') return []
  const usersJson = localStorage.getItem('my-room-users')
  return usersJson ? JSON.parse(usersJson) : []
}

// 닉네임 중복 확인
const checkNicknameDuplicate = (nickname: string): boolean => {
  const users = getUsersFromStorage()
  return users.some((user) => user.name === nickname)
}

// 이메일 중복 확인
const checkEmailDuplicate = (email: string): boolean => {
  const users = getUsersFromStorage()
  return users.some((user) => user.email.toLowerCase() === email.toLowerCase())
}

// 사용자 목록에 추가
const addUserToStorage = (user: User): void => {
  if (typeof window === 'undefined') return
  const users = getUsersFromStorage()
  users.push(user)
  localStorage.setItem('my-room-users', JSON.stringify(users))
}

export default function RegisterPage() {
  const router = useRouter()
  const { setUser } = useStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [emailChecked, setEmailChecked] = useState(false)
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null)
  const [nicknameChecked, setNicknameChecked] = useState(false)
  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(null)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [isCheckingNickname, setIsCheckingNickname] = useState(false)
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null)

  // 이메일 중복 확인
  const handleCheckEmail = async () => {
    if (!email) {
      setError('メールアドレスを入力してください')
      return
    }

    setIsCheckingEmail(true)
    setError('')

    try {
      // 서버 API 호출
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'メールアドレスの確認中にエラーが発生しました')
        setEmailAvailable(false)
        setEmailChecked(true)
        setIsCheckingEmail(false)
        return
      }

      // 클라이언트 사이드 중복 확인
      const isDuplicate = checkEmailDuplicate(email)
      const available = !isDuplicate

      setEmailAvailable(available)
      setEmailChecked(true)

      if (!available) {
        setError('このメールアドレスは既に使用されています')
      }
    } catch (err) {
      setError('メールアドレスの確認中にエラーが発生しました')
      setEmailAvailable(false)
      setEmailChecked(true)
    } finally {
      setIsCheckingEmail(false)
    }
  }

  // 닉네임 중복 확인
  const handleCheckNickname = async () => {
    if (!name) {
      setError('ユーザーネームを入力してください')
      return
    }

    setIsCheckingNickname(true)
    setError('')

    try {
      // 서버 API 호출
      const response = await fetch('/api/auth/check-nickname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: name }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'ユーザーネームの確認中にエラーが発生しました')
        setNicknameAvailable(false)
        setNicknameChecked(true)
        setIsCheckingNickname(false)
        return
      }

      // 클라이언트 사이드 중복 확인
      const isDuplicate = checkNicknameDuplicate(name)
      const available = !isDuplicate

      setNicknameAvailable(available)
      setNicknameChecked(true)

      if (!available) {
        setError('このユーザーネームは既に使用されています')
      }
    } catch (err) {
      setError('ユーザーネームの確認中にエラーが発生しました')
      setNicknameAvailable(false)
      setNicknameChecked(true)
    } finally {
      setIsCheckingNickname(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !email || !password || !passwordConfirm) {
      setError('すべての項目を入力してください')
      return
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      return
    }

    // 패스워드 일치 확인
    if (password !== passwordConfirm) {
      setError('パスワードが一致しません')
      return
    }

    // 중복 확인 체크
    if (!emailChecked || !emailAvailable) {
      setError('メールアドレスの重複確認を行ってください')
      return
    }

    if (!nicknameChecked || !nicknameAvailable) {
      setError('ユーザーネームの重複確認を行ってください')
      return
    }

    const user = {
      id: Date.now().toString(),
      email,
      name,
    }

    // 사용자 목록에 추가
    addUserToStorage(user)
    setUser(user)
    router.push('/onboarding')
  }

  // 이메일이 변경되면 중복확인 상태 초기화
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setEmailChecked(false)
    setEmailAvailable(null)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    setNicknameChecked(false)
    setNicknameAvailable(null)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    // 패스워드가 변경되면 일치 여부 재확인
    if (passwordConfirm) {
      setPasswordMatch(e.target.value === passwordConfirm)
    } else {
      setPasswordMatch(null)
    }
  }

  const handlePasswordConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const confirmValue = e.target.value
    setPasswordConfirm(confirmValue)
    // 패스워드 확인이 변경되면 일치 여부 확인
    if (password) {
      setPasswordMatch(password === confirmValue)
    } else {
      setPasswordMatch(null)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google'
  }

  const handleLineLogin = () => {
    window.location.href = '/api/auth/line'
  }

  return (
    <div className="min-h-screen bg-primary-gray flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-4">
        <div className="max-w-md w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-center mb-4">新規登録</h1>

            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ユーザーネーム
                </label>
                <div className="flex gap-2">
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    className={`flex-1 px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent ${
                      nicknameChecked
                        ? nicknameAvailable
                          ? 'border-[#2A52BE]'
                          : 'border-red-300'
                        : 'border-gray-300'
                    }`}
                    placeholder="山田太郎"
                  />
                  <button
                    type="button"
                    onClick={handleCheckNickname}
                    disabled={!name || isCheckingNickname}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  >
                    {isCheckingNickname ? '確認中...' : '重複確認'}
                  </button>
                </div>
                {nicknameChecked && (
                  <p
                    className={`mt-0.5 text-xs ${
                      nicknameAvailable ? 'text-[#2A52BE]' : 'text-red-600'
                    }`}
                  >
                    {nicknameAvailable
                      ? 'このユーザーネームは使用可能です'
                      : 'このユーザーネームは既に使用されています'}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  メールアドレス
                </label>
                <div className="flex gap-2">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    className={`flex-1 px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent ${
                      emailChecked
                        ? emailAvailable
                          ? 'border-[#2A52BE]'
                          : 'border-red-300'
                        : 'border-gray-300'
                    }`}
                    placeholder="example@email.com"
                  />
                  <button
                    type="button"
                    onClick={handleCheckEmail}
                    disabled={!email || isCheckingEmail}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  >
                    {isCheckingEmail ? '確認中...' : '重複確認'}
                  </button>
                </div>
                {emailChecked && (
                  <p
                    className={`mt-0.5 text-xs ${
                      emailAvailable ? 'text-[#2A52BE]' : 'text-red-600'
                    }`}
                  >
                    {emailAvailable
                      ? 'このメールアドレスは使用可能です'
                      : 'このメールアドレスは既に使用されています'}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  パスワード
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent ${
                    passwordMatch !== null && passwordConfirm
                      ? passwordMatch
                        ? 'border-[#2A52BE]'
                        : 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                <p className="mt-0.5 text-xs text-gray-500">
                  6文字以上で入力してください
                </p>
              </div>

              <div>
                <label
                  htmlFor="passwordConfirm"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  パスワード（確認）
                </label>
                <input
                  id="passwordConfirm"
                  type="password"
                  value={passwordConfirm}
                  onChange={handlePasswordConfirmChange}
                  className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent ${
                    passwordMatch !== null && passwordConfirm
                      ? passwordMatch
                        ? 'border-[#2A52BE]'
                        : 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                {passwordMatch !== null && passwordConfirm && (
                  <p
                    className={`mt-0.5 text-xs ${
                      passwordMatch ? 'text-[#2A52BE]' : 'text-red-600'
                    }`}
                  >
                    {passwordMatch
                      ? 'パスワードが一致しています'
                      : 'パスワードが一致しません'}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-primary-blue text-white py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-colors text-sm"
              >
                登録する
              </button>
            </form>

            <div className="relative mt-4 mb-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500">または</span>
              </div>
            </div>

            {/* 소셜 로그인 버튼 */}
            <div className="space-y-2 mb-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full h-10 flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Googleで登録
              </button>

              <button
                type="button"
                onClick={handleLineLogin}
                className="w-full h-10 flex items-center justify-center gap-2 bg-[#06C755] text-white rounded-lg font-semibold hover:bg-[#05B548] transition-colors text-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.345 0 .63.285.63.63 0 .349-.285.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.028 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
                LINEで登録
              </button>
            </div>

            <div className="mt-3 text-center">
              <p className="text-xs text-gray-600">
                すでにアカウントをお持ちの方は{' '}
                <Link href="/auth/login" className="text-primary-blue hover:underline">
                  ログイン
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


