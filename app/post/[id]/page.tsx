'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Heart, MessageCircle, ArrowLeft, ArrowRight, Tag, Edit, Trash2, Check, X, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/Header'
import { useStore } from '@/store/useStore'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  const { posts, user, toggleLike, addComment, updateComment, deleteComment, setFollowing, followUser, unfollowUser, isFollowing, deletePost } = useStore()
  const [commentText, setCommentText] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editCommentText, setEditCommentText] = useState('')
  const [showMenu, setShowMenu] = useState(false)

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

  const handleEditComment = (commentId: string, currentContent: string) => {
    setEditingCommentId(commentId)
    setEditCommentText(currentContent)
  }

  const handleSaveEdit = (commentId: string) => {
    if (!editCommentText.trim()) return
    updateComment(post.id, commentId, editCommentText.trim())
    setEditingCommentId(null)
    setEditCommentText('')
  }

  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setEditCommentText('')
  }

  const handleDeleteComment = (commentId: string) => {
    if (confirm('このコメントを削除しますか？')) {
      deleteComment(post.id, commentId)
    }
  }

  const handleEditPost = () => {
    setShowMenu(false)
    router.push(`/post/${post.id}/edit`)
  }

  const handleDeletePost = () => {
    setShowMenu(false)
    if (confirm('この投稿を削除しますか？')) {
      deletePost(post.id)
      router.push('/feed')
    }
  }

  // メニュー外をクリックしたときにメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.post-menu-container')) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showMenu])

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
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/profile/${post.userId}`}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1"
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
                            locale: ja,
                          })}
                        </p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2">
                      {user && user.id === post.userId && (
                        <div className="relative post-menu-container">
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              setShowMenu(!showMenu)
                            }}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <MoreHorizontal size={20} className="text-gray-600" />
                          </button>
                          {showMenu && (
                            <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[120px]">
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleEditPost()
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Edit size={16} />
                                編集
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleDeletePost()
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Trash2 size={16} />
                                削除
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      {user && user.id !== post.userId && (
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            if (isFollowing(post.userId)) {
                              unfollowUser(post.userId)
                            } else {
                              followUser(post.userId)
                            }
                          }}
                          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                            isFollowing(post.userId)
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              : 'bg-primary-blue text-white hover:bg-opacity-90'
                          }`}
                        >
                          {isFollowing(post.userId) ? 'フォロー中' : 'フォロー'}
                        </button>
                      )}
                    </div>
                  </div>
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
                        <Link
                          key={index}
                          href={`/search?tag=${encodeURIComponent(tag)}`}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-primary-blue text-white rounded-full text-sm hover:bg-opacity-90 transition-colors cursor-pointer"
                        >
                          <Tag size={14} />
                          {tag}
                        </Link>
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
                              className="px-3 py-2 bg-primary-blue text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                            >
                              <ArrowRight size={28} />
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
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                      <p className="text-xs text-gray-500">
                                        {formatDistanceToNow(new Date(comment.createdAt), {
                                          addSuffix: true,
                                          locale: ja,
                                        })}
                                      </p>
                                      {comment.edited && (
                                        <span className="text-xs text-gray-400">
                                          (編集済み)
                                        </span>
                                      )}
                                    </div>
                                    {user && user.id === comment.userId && (
                                      <div className="flex items-center gap-1">
                                        {editingCommentId === comment.id ? (
                                          <>
                                            <button
                                              onClick={() => handleSaveEdit(comment.id)}
                                              className="p-1 text-green-600 hover:text-green-700 transition-colors"
                                              title="保存"
                                            >
                                              <Check size={16} />
                                            </button>
                                            <button
                                              onClick={handleCancelEdit}
                                              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                                              title="キャンセル"
                                            >
                                              <X size={16} />
                                            </button>
                                          </>
                                        ) : (
                                          <>
                                            <button
                                              onClick={() => handleEditComment(comment.id, comment.content)}
                                              className="p-1 text-gray-500 hover:text-primary-blue transition-colors"
                                              title="編集"
                                            >
                                              <Edit size={16} />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteComment(comment.id)}
                                              className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                                              title="削除"
                                            >
                                              <Trash2 size={16} />
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {editingCommentId === comment.id ? (
                                  <input
                                    type="text"
                                    value={editCommentText}
                                    onChange={(e) => setEditCommentText(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent text-sm"
                                    autoFocus
                                  />
                                ) : (
                                  <p className="text-gray-700">{comment.content}</p>
                                )}
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