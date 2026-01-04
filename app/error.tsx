'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-primary-gray flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary-dark mb-4">
          エラーが発生しました
        </h2>
        <p className="text-gray-600 mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-opacity-90 font-semibold transition-colors"
        >
          もう一度試す
        </button>
      </div>
    </div>
  )
}

