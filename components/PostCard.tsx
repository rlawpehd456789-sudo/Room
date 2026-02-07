'use client'

import Link from 'next/link'
import { Heart, MessageCircle, MoreHorizontal, Bookmark, UserPlus, UserMinus, EyeOff } from 'lucide-react'
import { Post } from '@/store/useStore'
import { useStore } from '@/store/useStore'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useState, useRef, useEffect } from 'react'

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const { toggleLike, user, followUser, unfollowUser, isFollowing } = useStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    if (user) {
      toggleLike(post.id)
    }
  }

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  // 스크롤 시 메뉴 닫기
  useEffect(() => {
    const handleScroll = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      window.addEventListener('scroll', handleScroll, { passive: true })
    }

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isMenuOpen])

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsMenuOpen(!isMenuOpen)
  }

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (user) {
      const savedKey = `my-room-saved-${user.id}`
      const saved = localStorage.getItem(savedKey)
      const savedPosts = saved ? JSON.parse(saved) : []
      
      if (!savedPosts.includes(post.id)) {
        savedPosts.push(post.id)
        localStorage.setItem(savedKey, JSON.stringify(savedPosts))
        alert('投稿を保存しました。')
      } else {
        alert('既に保存された投稿です。')
      }
    } else {
      alert('ログインが必要です。')
    }
    setIsMenuOpen(false)
  }

  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (user) {
      if (user.id === post.userId) {
        alert('自分の投稿です。')
        return
      }
      followUser(post.userId)
      setIsMenuOpen(false)
    } else {
      alert('ログインが必要です。')
      setIsMenuOpen(false)
    }
  }

  const handleUnfollow = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (user) {
      unfollowUser(post.userId)
      setIsMenuOpen(false)
    } else {
      alert('ログインが必要です。')
      setIsMenuOpen(false)
    }
  }

  const handleHide = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (user) {
      const hiddenKey = `my-room-hidden-${user.id}`
      const hidden = localStorage.getItem(hiddenKey)
      const hiddenPosts = hidden ? JSON.parse(hidden) : []
      
      if (!hiddenPosts.includes(post.id)) {
        hiddenPosts.push(post.id)
        localStorage.setItem(hiddenKey, JSON.stringify(hiddenPosts))
        alert('投稿を非表示に設定しました。')
        // 페이지 새로고침하여 숨김 처리된 게시글 제거
        window.location.reload()
      }
    } else {
      alert('ログインが必要です。')
    }
    setIsMenuOpen(false)
  }

  const following = user ? isFollowing(post.userId) : false

  return (
    <Link href={`/post/${post.id}`}>
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        {post.images.length > 0 && (
          <div className="relative w-full aspect-[3/4] bg-primary-gray">
            <img
              src={post.images[0]}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            {post.images.length > 1 && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                +{post.images.length - 1}
              </div>
            )}
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <Link
              href={`/profile/${post.userId}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              {post.userAvatar ? (
                <img
                  src={post.userAvatar}
                  alt={post.userName}
                  width={32}
                  height={32}
                  className="rounded-full w-8 h-8 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-blue flex items-center justify-center text-white text-sm">
                  {post.userName.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-semibold text-sm">{post.userName}</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                    locale: ja,
                  })}
                </p>
              </div>
            </Link>
            <div className="relative" ref={menuRef}>
              <button 
                ref={buttonRef}
                onClick={handleMenuToggle}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <MoreHorizontal size={20} />
              </button>
              {isMenuOpen && (
                <div 
                  className="absolute bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[180px] z-50 right-0 top-8"
                >
                  <button
                    onClick={handleSave}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                  >
                    <Bookmark size={16} />
                    保存
                  </button>
                  {user && user.id !== post.userId && (
                    <>
                      {following ? (
                        <button
                          onClick={handleUnfollow}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                        >
                          <UserMinus size={16} />
                          フォローを解除
                        </button>
                      ) : (
                        <button
                          onClick={handleFollow}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                        >
                          <UserPlus size={16} />
                          フォロー
                        </button>
                      )}
                    </>
                  )}
                  {user && user.id !== post.userId && (
                    <button
                      onClick={handleHide}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                    >
                      <EyeOff size={16} />
                      非表示にする
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <h3 className="font-bold text-lg mb-2 line-clamp-2">{post.title}</h3>
          {post.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {post.description}
            </p>
          )}

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.slice(0, 3).map((tag, index) => (
                <Link
                  key={index}
                  href={`/search?tag=${encodeURIComponent(tag)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs px-2 py-1 bg-primary-gray rounded text-gray-600 hover:bg-primary-blue hover:text-white transition-colors cursor-pointer"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 pt-2 border-t border-primary-gray">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 ${
                post.liked ? 'text-red-500' : 'text-gray-400'
              } hover:text-red-500 transition-colors`}
            >
              <Heart size={18} fill={post.liked ? 'currentColor' : 'none'} />
              <span className="text-sm">{post.likes}</span>
            </button>
            <div className="flex items-center gap-1 text-gray-400">
              <MessageCircle size={18} />
              <span className="text-sm">{post.comments.length}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

