'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useStore } from '@/store/useStore'
import Header from '@/components/Header'

function OAuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useStore()

  useEffect(() => {
    const provider = searchParams.get('provider')
    const id = searchParams.get('id')
    const email = searchParams.get('email')
    const name = searchParams.get('name')
    const avatar = searchParams.get('avatar')

    if (provider && id) {
      const user = {
        id: `${provider}-${id}`,
        email: email || '',
        name: name || email?.split('@')[0] || 'User',
        avatar: avatar || undefined,
      }

      setUser(user)
      router.push('/feed')
    } else {
      router.push('/auth/register?error=oauth_failed')
    }
  }, [searchParams, setUser, router])

  return (
    <div className="min-h-screen bg-primary-gray">
      <Header />
      <main className="pt-20 pb-8">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8 mt-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto mb-4"></div>
              <p className="text-gray-600">認証中...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-primary-gray">
          <Header />
          <main className="pt-20 pb-8">
            <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-lg shadow-sm p-8 mt-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto mb-4"></div>
                  <p className="text-gray-600">認証中...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  )
}

