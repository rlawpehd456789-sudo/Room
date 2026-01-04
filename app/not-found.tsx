import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-primary-gray flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-primary-dark mb-4">
          ページが見つかりません
        </h2>
        <p className="text-gray-600 mb-6">
          お探しのページは存在しないか、移動された可能性があります。
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-opacity-90 font-semibold transition-colors"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  )
}

