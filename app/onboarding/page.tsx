'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { useStore } from '@/store/useStore'

const INTEREST_STYLES = [
  'ミニマル',
  'ナチュラル',
  'スカンジナビア',
  'インダストリアル',
  'モダン',
  'ビンテージ',
  'ボヘミアン',
]

const RESIDENCE_TYPES = [
  '1K',
  '1DK',
  '1LDK',
  '2K',
  '2DK',
  '2LDK',
  'その他',
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user, setUser } = useStore()
  const [step, setStep] = useState(1)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [residenceType, setResidenceType] = useState('')
  const [customResidenceType, setCustomResidenceType] = useState('')

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    )
  }

  const handleNext = () => {
    if (step === 1) {
      if (selectedInterests.length === 0) {
        alert('少なくとも1つのスタイルを選択してください')
        return
      }
      setStep(2)
    } else if (step === 2) {
      // 거주 정보 저장
      if (user) {
        const finalResidenceType = residenceType === 'その他' 
          ? customResidenceType 
          : residenceType
        setUser({
          ...user,
          interests: selectedInterests,
          residenceType: finalResidenceType || undefined,
        })
      }
      router.push('/feed')
    }
  }

  const handleSkip = () => {
    if (user) {
      setUser({
        ...user,
        interests: selectedInterests,
      })
    }
    router.push('/feed')
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  return (
    <div className="min-h-screen bg-primary-gray">
      <Header />
      <main className="pt-16 pb-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8 mt-8">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold">
                  {step === 1 ? '興味のあるスタイルを選んでください' : '現在の住居タイプ'}
                </h1>
                <span className="text-sm text-gray-500">
                  {step} / 2
                </span>
              </div>
              <div className="w-full bg-primary-gray rounded-full h-2">
                <div
                  className="bg-primary-blue h-2 rounded-full transition-all"
                  style={{ width: `${(step / 2) * 100}%` }}
                />
              </div>
            </div>

            {step === 1 ? (
              <div className="space-y-6">
                <p className="text-gray-600">
                  あなたの好みに合ったコンテンツをお届けします
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {INTEREST_STYLES.map((style) => (
                    <button
                      key={style}
                      onClick={() => handleInterestToggle(style)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedInterests.includes(style)
                          ? 'border-primary-blue bg-blue-50 text-primary-blue'
                          : 'border-gray-200 hover:border-primary-blue hover:bg-gray-50'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleNext}
                    className="flex-1 bg-primary-blue text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
                  >
                    次へ
                  </button>
                  <button
                    onClick={handleSkip}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800"
                  >
                    スキップ
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-gray-600">
                  現在お住まいのタイプを教えてください（任意）
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {RESIDENCE_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setResidenceType(type)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        residenceType === type
                          ? 'border-primary-blue bg-blue-50 text-primary-blue'
                          : 'border-gray-200 hover:border-primary-blue hover:bg-gray-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                {residenceType === 'その他' && (
                  <div>
                    <label
                      htmlFor="customResidenceType"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      住居タイプを入力してください
                    </label>
                    <input
                      id="customResidenceType"
                      type="text"
                      value={customResidenceType}
                      onChange={(e) => setCustomResidenceType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                      placeholder="例: 3LDK、マンションなど"
                    />
                  </div>
                )}
                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800"
                  >
                    戻る
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 bg-primary-blue text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
                  >
                    完了
                  </button>
                  <button
                    onClick={handleSkip}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800"
                  >
                    スキップ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

