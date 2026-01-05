'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Heart, MessageCircle, ArrowLeft, Tag } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/Header'
import { useStore } from '@/store/useStore'
import { formatDistanceToNow } from 'date-fns'

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  const { posts, user, toggleLike, addComment, setFollowing } = useStore()
  const [commentText, setCommentText] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const post = posts.find((p) => p.id === postId)

  useEffect(() => {
    // ローカルストレージからユーザー情報を読み込む
    if (typeof window !== 'undefined') {
      if (!user) {
        const savedUser = localStorage.getItem('my-room-user')
        if (savedUser) {
          useStore.getState().setUser(JSON.parse(savedUser))
        }
      }
      // フォローリストを読み込む
      if (user) {
        const savedFollowing = localStorage.getItem(`my-room-following-${user.id}`)
        if (savedFollowing) {
          setFollowing(JSON.parse(savedFollowing))
        }
      }
    }
  }, [user, setFollowing])

  if (!post) {
    return (
      <div className="min-h-screen bg-primary-gray">
        <Header />
        <main className="pt-20 pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm p-12 text-center mt-8">
              <p className="text-gray-500 mb-4">投稿が見つかりません</p>
              <button
                onClick={() => router.push('/feed')}
                className="px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-opacity-90"
              >
                フィードに戻る
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const handleLike = () => {
    if (user) {
      toggleLike(post.id)
    }
  }

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !user) return

    const newComment = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content: commentText.trim(),
      createdAt: new Date().toISOString(),
    }

    addComment(post.id, newComment)
    setCommentText('')
  }

  return (
    <div className="min-h-screen bg-primary-gray">
      <Header />
      <main className="pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 mt-8"
          >
            <ArrowLeft size={20} />
            <span>戻る</span>
          </button>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* 画像セクション */}
              <div className="relative bg-primary-gray aspect-square lg:aspect-auto lg:h-[600px]">
                {post.images.length > 0 ? (
                  <>
                    <img
                      src={post.images[currentImageIndex]}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    {post.images.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setCurrentImageIndex(
                              (prev) => (prev - 1 + post.images.length) % post.images.length
                            )
                          }
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-opacity"
                        >
                          <ArrowLeft size={20} />
                        </button>
                        <button
                          onClick={() =>
                            setCurrentImageIndex((prev) => (prev + 1) % post.images.length)
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-opacity"
                        >
                          <ArrowLeft size={20} className="rotate-180" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {post.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentImageIndex
                                  ? 'bg-white'
                                  : 'bg-white bg-opacity-50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    画像なし
                  </div>
                )}
              </div>

              {/* コンテンツセクション */}
              <div className="flex flex-col">
                {/* ユーザー情報 */}
                <div className="p-6 border-b border-primary-gray">
                  <Link
                    href={`/profile/${post.userId}`}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    {post.userAvatar ? (
                      <img
                        src={post.userAvatar}
                        alt={post.userName}
                        width={48}
                        height={48}
                        className="rounded-full w-12 h-12 object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary-blue flex items-center justify-center text-white text-xl">
                        {post.userName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{post.userName}</p>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </Link>
                </div>

                {/* 投稿内容 */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <h1 className="text-2xl font-bold mb-3">{post.title}</h1>
                  {post.description && (
                    <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                      {post.description}
                    </p>
                  )}

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-primary-blue text-white rounded-full text-sm"
                        >
                          <Tag size={14} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* アクション */}
                  <div className="flex items-center gap-6 py-4 border-y border-primary-gray mb-6">
                    <button
                      onClick={handleLike}
                      className={`flex items-center gap-2 ${
                        post.liked ? 'text-red-500' : 'text-gray-600'
                      } hover:text-red-500 transition-colors`}
                    >
                      <Heart
                        size={24}
                        fill={post.liked ? 'currentColor' : 'none'}
                        className="transition-colors"
                      />
                      <span className="font-semibold">{post.likes}</span>
                    </button>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MessageCircle size={24} />
                      <span className="font-semibold">{post.comments.length}</span>
                    </div>
                  </div>

                  {/* コメントセクション */}
                  <div>
                    <h2 className="font-bold text-lg mb-4">
                      コメント ({post.comments.length})
                    </h2>

                    {/* コメント入力 */}
                    {user && (
                      <form onSubmit={handleCommentSubmit} className="mb-6">
                        <div className="flex gap-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              width={40}
                              height={40}
                              className="rounded-full w-10 h-10 object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary-blue flex items-center justify-center text-white flex-shrink-0">
                              {user.name.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="コメントを入力..."
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                            />
                            <button
                              type="submit"
                              disabled={!commentText.trim()}
                              className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              送信
                            </button>
                          </div>
                        </div>
                      </form>
                    )}

                    {/* コメント一覧 */}
                    <div className="space-y-4">
                      {post.comments.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                          まだコメントがありません
                        </p>
                      ) : (
                        post.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            {comment.userAvatar ? (
                              <img
                                src={comment.userAvatar}
                                alt={comment.userName}
                                width={40}
                                height={40}
                                className="rounded-full w-10 h-10 object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary-blue flex items-center justify-center text-white flex-shrink-0">
                                {comment.userName.charAt(0)}
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="bg-primary-gray rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="font-semibold text-sm">{comment.userName}</p>
                                  <p className="text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(comment.createdAt), {
                                      addSuffix: true,
                                    })}
                                  </p>
                                </div>
                                <p className="text-gray-700">{comment.content}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}