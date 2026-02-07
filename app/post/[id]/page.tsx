'use client'

import { useEffect, useState, useMemo } from 'react'
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
  const { posts, user, following, toggleLike, addComment, updateComment, deleteComment, setFollowing, followUser, unfollowUser, isFollowing, deletePost, addNotification } = useStore()
  const [commentText, setCommentText] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editCommentText, setEditCommentText] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [showMentionDropdown, setShowMentionDropdown] = useState(false)
  const [mentionPosition, setMentionPosition] = useState(0)
  const [editMentionQuery, setEditMentionQuery] = useState('')
  const [showEditMentionDropdown, setShowEditMentionDropdown] = useState(false)
  const [editMentionPosition, setEditMentionPosition] = useState(0)

  const post = posts.find((p) => p.id === postId)

  // 모든 게시글에서 사용자 정보를 수집 (멘션 파싱용)
  const allUsers = useMemo(() => {
    const allUsersMap = new Map<string, { id: string; name: string; avatar?: string }>()
    posts.forEach((p) => {
      if (!allUsersMap.has(p.userId)) {
        allUsersMap.set(p.userId, { id: p.userId, name: p.userName, avatar: p.userAvatar })
      }
      p.comments.forEach((c) => {
        if (!allUsersMap.has(c.userId)) {
          allUsersMap.set(c.userId, { id: c.userId, name: c.userName, avatar: c.userAvatar })
        }
      })
    })
    return Array.from(allUsersMap.values())
  }, [posts])

  // 교류 빈도 계산 함수 (댓글 수 + 좋아요 수 기반)
  const calculateInteractionScore = useMemo(() => {
    return (userId: string): number => {
      if (!user || !posts) return 0
      
      let score = 0
      // 해당 사용자의 게시물에 내가 남긴 댓글 수
      posts.forEach((p) => {
        if (p.userId === userId) {
          const myComments = p.comments.filter((c) => c.userId === user.id)
          score += myComments.length * 2 // 댓글은 가중치 2
        }
      })
      
      // 해당 사용자의 게시물에 내가 좋아요를 누른 수
      posts.forEach((p) => {
        if (p.userId === userId && p.liked) {
          score += 1 // 좋아요는 가중치 1
        }
      })
      
      // 해당 사용자가 내 게시물에 남긴 댓글 수
      posts.forEach((p) => {
        if (p.userId === user.id) {
          const theirComments = p.comments.filter((c) => c.userId === userId)
          score += theirComments.length * 2
        }
      })
      
      return score
    }
  }, [user, posts])

  // 멘션 가능한 사용자 목록 추출 (팔로우 리스트만)
  const availableUsers = useMemo(() => {
    if (!post || !user) return []
    
    const usersMap = new Map<string, { id: string; name: string; avatar?: string; interactionScore: number }>()
    
    // 팔로우 리스트만 추가 (팔로우하지 않은 사람은 제외)
    following.forEach((followedUserId) => {
      if (followedUserId !== user.id && !usersMap.has(followedUserId)) {
        const followedUser = allUsers.find((u) => u.id === followedUserId)
        if (followedUser) {
          usersMap.set(followedUserId, {
            ...followedUser,
            interactionScore: calculateInteractionScore(followedUserId),
          })
        }
      }
    })
    
    // 교류 빈도가 높은 순으로 정렬 (교류 빈도가 같으면 이름 순)
    return Array.from(usersMap.values()).sort((a, b) => {
      if (b.interactionScore !== a.interactionScore) {
        return b.interactionScore - a.interactionScore
      }
      return a.name.localeCompare(b.name)
    })
  }, [post, user, following, allUsers, calculateInteractionScore])

  // 멘션 필터링된 사용자 목록
  const filteredMentionUsers = availableUsers.filter((u) =>
    u.name.toLowerCase().includes(mentionQuery.toLowerCase())
  )
  const filteredEditMentionUsers = availableUsers.filter((u) =>
    u.name.toLowerCase().includes(editMentionQuery.toLowerCase())
  )

  // 멘션된 사용자를 파싱하여 표시하는 함수
  type TextPart = { type: 'text'; content: string }
  type MentionPart = { type: 'mention'; content: string; userId?: string }
  type ParsedPart = TextPart | MentionPart

  const parseMentions = (text: string): ParsedPart[] => {
    // 한글, 영문, 숫자, 언더스코어를 포함한 닉네임 지원
    const mentionRegex = /@([가-힣a-zA-Z0-9_]+)/g
    const parts: ParsedPart[] = []
    let lastIndex = 0
    let match

    while ((match = mentionRegex.exec(text)) !== null) {
      // 멘션 전의 텍스트
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.slice(lastIndex, match.index) })
      }
      // 멘션된 사용자 찾기 (모든 게시글의 사용자 중에서 검색)
      const mentionedName = match[1]
      const mentionedUser = allUsers.find((u) => u.name === mentionedName)
      parts.push({
        type: 'mention',
        content: `@${mentionedName}`,
        userId: mentionedUser?.id,
      })
      lastIndex = mentionRegex.lastIndex
    }
    // 남은 텍스트
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) })
    }
    return parts.length > 0 ? parts : [{ type: 'text', content: text }]
  }

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

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCommentText(value)

    // @ 입력 감지
    const cursorPosition = e.target.selectionStart || 0
    const textBeforeCursor = value.slice(0, cursorPosition)
    
    // @ 패턴 찾기 (가장 가까운 것, 공백이나 줄바꿈 뒤에 @가 오는 경우)
    // 한글, 영문, 숫자, 언더스코어를 포함한 닉네임 지원
    const mentionPattern = /(?:^|\s)@([가-힣a-zA-Z0-9_]*)$/
    const match = textBeforeCursor.match(mentionPattern)

    if (match) {
      const query = match[1] || ''
      const mentionStart = textBeforeCursor.lastIndexOf('@')
      
      if (mentionStart !== -1) {
        setMentionQuery(query)
        setMentionPosition(mentionStart)
        setShowMentionDropdown(true)
      } else {
        setShowMentionDropdown(false)
      }
    } else {
      setShowMentionDropdown(false)
    }
  }

  const handleMentionSelect = (userName: string) => {
    const textBeforeMention = commentText.slice(0, mentionPosition)
    const textAfterMention = commentText.slice(mentionPosition + 1 + mentionQuery.length)
    const newText = `${textBeforeMention}@${userName} ${textAfterMention}`
    setCommentText(newText)
    setShowMentionDropdown(false)
    setMentionQuery('')
    
    // 입력 필드에 포커스 유지 및 커서 위치 조정
    setTimeout(() => {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement
      if (input) {
        const newCursorPosition = mentionPosition + 1 + userName.length + 1 // @닉네임 + 공백
        input.focus()
        input.setSelectionRange(newCursorPosition, newCursorPosition)
      }
    }, 0)
  }

  // 멘션된 사용자 ID 목록 추출 (멘션을 한 사람 제외)
  const extractMentionedUserIds = (text: string): string[] => {
    if (!user) return []
    
    const mentionRegex = /@([가-힣a-zA-Z0-9_]+)/g
    const mentionedUserIds: string[] = []
    let match

    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionedName = match[1]
      const mentionedUser = allUsers.find((u) => u.name === mentionedName)
      // 멘션을 한 사람(user)은 제외하고, 실제 존재하는 사용자만 추가
      if (mentionedUser && mentionedUser.id !== user.id) {
        mentionedUserIds.push(mentionedUser.id)
      }
    }

    // 중복 제거 및 멘션을 한 사람 제외
    return Array.from(new Set(mentionedUserIds)).filter((id) => id !== user.id)
  }

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !user || !post) return

    const newComment = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content: commentText.trim(),
      createdAt: new Date().toISOString(),
    }

    addComment(post.id, newComment)

    // 멘션된 사용자들에게만 알림 생성 (멘션을 한 사람 제외)
    const mentionedUserIds = extractMentionedUserIds(commentText)
    mentionedUserIds.forEach((mentionedUserId) => {
      // 멘션을 한 사람(user)이 아닌 경우에만 알림 전송
      if (mentionedUserId && mentionedUserId !== user.id) {
        const mentionedUser = allUsers.find((u) => u.id === mentionedUserId)
        if (mentionedUser && mentionedUser.id !== user.id) {
          addNotification({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            userId: mentionedUserId, // 멘션당한 사람에게만 알림
            type: 'mention',
            fromUserId: user.id, // 멘션을 한 사람
            fromUserName: user.name,
            fromUserAvatar: user.avatar,
            postId: post.id,
            commentId: newComment.id,
            content: commentText.trim(),
            read: false,
            createdAt: new Date().toISOString(),
          })
        }
      }
    })

    setCommentText('')
    setShowMentionDropdown(false)
    setMentionQuery('')
  }

  const handleEditComment = (commentId: string, currentContent: string) => {
    setEditingCommentId(commentId)
    setEditCommentText(currentContent)
    setShowEditMentionDropdown(false)
    setEditMentionQuery('')
  }

  const handleEditCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEditCommentText(value)

    // @ 입력 감지
    const cursorPosition = e.target.selectionStart || 0
    const textBeforeCursor = value.slice(0, cursorPosition)
    
    // @ 패턴 찾기 (가장 가까운 것, 공백이나 줄바꿈 뒤에 @가 오는 경우)
    // 한글, 영문, 숫자, 언더스코어를 포함한 닉네임 지원
    const mentionPattern = /(?:^|\s)@([가-힣a-zA-Z0-9_]*)$/
    const match = textBeforeCursor.match(mentionPattern)

    if (match) {
      const query = match[1] || ''
      const mentionStart = textBeforeCursor.lastIndexOf('@')
      
      if (mentionStart !== -1) {
        setEditMentionQuery(query)
        setEditMentionPosition(mentionStart)
        setShowEditMentionDropdown(true)
      } else {
        setShowEditMentionDropdown(false)
      }
    } else {
      setShowEditMentionDropdown(false)
    }
  }

  const handleEditMentionSelect = (userName: string) => {
    const textBeforeMention = editCommentText.slice(0, editMentionPosition)
    const textAfterMention = editCommentText.slice(editMentionPosition + 1 + editMentionQuery.length)
    const newText = `${textBeforeMention}@${userName} ${textAfterMention}`
    setEditCommentText(newText)
    setShowEditMentionDropdown(false)
    setEditMentionQuery('')
    
    // 입력 필드에 포커스 유지 및 커서 위치 조정
    setTimeout(() => {
      const inputs = document.querySelectorAll('input[type="text"]')
      const editInput = Array.from(inputs).find((input) => 
        (input as HTMLInputElement).value === newText
      ) as HTMLInputElement
      if (editInput) {
        const newCursorPosition = editMentionPosition + 1 + userName.length + 1 // @닉네임 + 공백
        editInput.focus()
        editInput.setSelectionRange(newCursorPosition, newCursorPosition)
      }
    }, 0)
  }

  const handleSaveEdit = (commentId: string) => {
    if (!editCommentText.trim() || !post) return
    updateComment(post.id, commentId, editCommentText.trim())

    // 수정된 댓글에 멘션된 사용자들에게만 알림 생성 (멘션을 한 사람 제외)
    if (!user) return
    
    const mentionedUserIds = extractMentionedUserIds(editCommentText)
    mentionedUserIds.forEach((mentionedUserId) => {
      // 멘션을 한 사람(user)이 아닌 경우에만 알림 전송
      if (mentionedUserId && mentionedUserId !== user.id) {
        const mentionedUser = allUsers.find((u) => u.id === mentionedUserId)
        if (mentionedUser && mentionedUser.id !== user.id) {
          addNotification({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            userId: mentionedUserId, // 멘션당한 사람에게만 알림
            type: 'mention',
            fromUserId: user.id, // 멘션을 한 사람
            fromUserName: user.name,
            fromUserAvatar: user.avatar,
            postId: post.id,
            commentId: commentId,
            content: editCommentText.trim(),
            read: false,
            createdAt: new Date().toISOString(),
          })
        }
      }
    })

    setEditingCommentId(null)
    setEditCommentText('')
    setShowEditMentionDropdown(false)
    setEditMentionQuery('')
  }

  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setEditCommentText('')
    setShowEditMentionDropdown(false)
    setEditMentionQuery('')
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
      // 멘션 드롭다운 외부 클릭 감지
      if (!target.closest('.mention-dropdown-container')) {
        setShowMentionDropdown(false)
      }
      if (!target.closest('.edit-mention-dropdown-container')) {
        setShowEditMentionDropdown(false)
      }
    }

    if (showMenu || showMentionDropdown || showEditMentionDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showMenu, showMentionDropdown, showEditMentionDropdown])

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
                          <div className="flex-1 flex gap-2 relative mention-dropdown-container">
                            <input
                              type="text"
                              value={commentText}
                              onChange={handleCommentChange}
                              onKeyDown={(e) => {
                                if (showMentionDropdown) {
                                  if (e.key === 'ArrowDown') {
                                    e.preventDefault()
                                  } else if (e.key === 'Enter' && filteredMentionUsers.length > 0) {
                                    e.preventDefault()
                                    handleMentionSelect(filteredMentionUsers[0].name)
                                    return
                                  } else if (e.key === 'Escape') {
                                    e.preventDefault()
                                    setShowMentionDropdown(false)
                                    return
                                  }
                                }
                                // Enter 키가 멘션 선택에 사용되지 않은 경우에만 폼 제출
                                if (e.key === 'Enter' && !showMentionDropdown) {
                                  // 폼 제출은 기본 동작 사용
                                }
                              }}
                              onBlur={() => {
                                // 드롭다운 클릭 시에는 닫히지 않도록 약간의 지연 추가
                                setTimeout(() => setShowMentionDropdown(false), 200)
                              }}
                              placeholder="コメントを入力... @ニックネームでメンション"
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                            />
                            {showMentionDropdown && availableUsers.length > 0 && (
                              <div className="absolute bottom-full left-0 mb-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                {filteredMentionUsers.length > 0 ? (
                                  <>
                                    {/* 처음 3명만 표시 */}
                                    <div className="max-h-36 overflow-y-auto">
                                      {filteredMentionUsers.slice(0, 3).map((u) => (
                                        <button
                                          key={u.id}
                                          type="button"
                                          onMouseDown={(e) => {
                                            e.preventDefault() // onBlur 이벤트 방지
                                            handleMentionSelect(u.name)
                                          }}
                                          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                                        >
                                          {u.avatar ? (
                                            <img
                                              src={u.avatar}
                                              alt={u.name}
                                              className="w-8 h-8 rounded-full object-cover"
                                            />
                                          ) : (
                                            <div className="w-8 h-8 rounded-full bg-primary-blue flex items-center justify-center text-white text-sm">
                                              {u.name.charAt(0)}
                                            </div>
                                          )}
                                          <span className="font-semibold">{u.name}</span>
                                        </button>
                                      ))}
                                      {/* 3명 이상인 경우 생략 표시 */}
                                      {filteredMentionUsers.length > 3 && (
                                        <div className="px-4 py-2 text-gray-400 text-sm text-center border-t border-gray-100">
                                          ...
                                        </div>
                                      )}
                                      {/* 나머지 사용자들 (스크롤로 확인 가능) */}
                                      {filteredMentionUsers.slice(3).map((u) => (
                                        <button
                                          key={u.id}
                                          type="button"
                                          onMouseDown={(e) => {
                                            e.preventDefault() // onBlur 이벤트 방지
                                            handleMentionSelect(u.name)
                                          }}
                                          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                                        >
                                          {u.avatar ? (
                                            <img
                                              src={u.avatar}
                                              alt={u.name}
                                              className="w-8 h-8 rounded-full object-cover"
                                            />
                                          ) : (
                                            <div className="w-8 h-8 rounded-full bg-primary-blue flex items-center justify-center text-white text-sm">
                                              {u.name.charAt(0)}
                                            </div>
                                          )}
                                          <span className="font-semibold">{u.name}</span>
                                        </button>
                                      ))}
                                    </div>
                                  </>
                                ) : (
                                  <div className="px-4 py-2 text-gray-500 text-sm">
                                    ユーザーが見つかりません
                                  </div>
                                )}
                              </div>
                            )}
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
                                  <div className="relative edit-mention-dropdown-container">
                                    <input
                                      type="text"
                                      value={editCommentText}
                                      onChange={handleEditCommentChange}
                                      onKeyDown={(e) => {
                                        if (showEditMentionDropdown) {
                                          if (e.key === 'ArrowDown') {
                                            e.preventDefault()
                                          } else if (e.key === 'Enter' && filteredEditMentionUsers.length > 0) {
                                            e.preventDefault()
                                            handleEditMentionSelect(filteredEditMentionUsers[0].name)
                                            return
                                          } else if (e.key === 'Escape') {
                                            e.preventDefault()
                                            setShowEditMentionDropdown(false)
                                            return
                                          }
                                        }
                                      }}
                                      onBlur={() => {
                                        setTimeout(() => setShowEditMentionDropdown(false), 200)
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent text-sm"
                                      autoFocus
                                    />
                                    {showEditMentionDropdown && availableUsers.length > 0 && (
                                      <div className="absolute bottom-full left-0 mb-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                        {filteredEditMentionUsers.length > 0 ? (
                                          <>
                                            {/* 처음 3명만 표시 */}
                                            <div className="max-h-36 overflow-y-auto">
                                              {filteredEditMentionUsers.slice(0, 3).map((u) => (
                                                <button
                                                  key={u.id}
                                                  type="button"
                                                  onMouseDown={(e) => {
                                                    e.preventDefault()
                                                    handleEditMentionSelect(u.name)
                                                  }}
                                                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                                                >
                                                  {u.avatar ? (
                                                    <img
                                                      src={u.avatar}
                                                      alt={u.name}
                                                      className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                  ) : (
                                                    <div className="w-8 h-8 rounded-full bg-primary-blue flex items-center justify-center text-white text-sm">
                                                      {u.name.charAt(0)}
                                                    </div>
                                                  )}
                                                  <span className="font-semibold">{u.name}</span>
                                                </button>
                                              ))}
                                              {/* 3명 이상인 경우 생략 표시 */}
                                              {filteredEditMentionUsers.length > 3 && (
                                                <div className="px-4 py-2 text-gray-400 text-sm text-center border-t border-gray-100">
                                                  ...
                                                </div>
                                              )}
                                              {/* 나머지 사용자들 (스크롤로 확인 가능) */}
                                              {filteredEditMentionUsers.slice(3).map((u) => (
                                                <button
                                                  key={u.id}
                                                  type="button"
                                                  onMouseDown={(e) => {
                                                    e.preventDefault()
                                                    handleEditMentionSelect(u.name)
                                                  }}
                                                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                                                >
                                                  {u.avatar ? (
                                                    <img
                                                      src={u.avatar}
                                                      alt={u.name}
                                                      className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                  ) : (
                                                    <div className="w-8 h-8 rounded-full bg-primary-blue flex items-center justify-center text-white text-sm">
                                                      {u.name.charAt(0)}
                                                    </div>
                                                  )}
                                                  <span className="font-semibold">{u.name}</span>
                                                </button>
                                              ))}
                                            </div>
                                          </>
                                        ) : (
                                          <div className="px-4 py-2 text-gray-500 text-sm">
                                            ユーザーが見つかりません
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-gray-700">
                                    {parseMentions(comment.content).map((part, idx) =>
                                      part.type === 'mention' ? (
                                        <Link
                                          key={idx}
                                          href={part.userId ? `/profile/${part.userId}` : '#'}
                                          className="text-primary-blue font-semibold hover:underline"
                                        >
                                          {part.content}
                                        </Link>
                                      ) : (
                                        <span key={idx}>{part.content}</span>
                                      )
                                    )}
                                  </div>
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