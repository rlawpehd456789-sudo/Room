'use client'

import Link from 'next/link'
import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react'
import { Post } from '@/store/useStore'
import { useStore } from '@/store/useStore'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const { toggleLike, user } = useStore()

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    if (user) {
      toggleLike(post.id)
    }
  }

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
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal size={20} />
            </button>
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
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-primary-gray rounded text-gray-600"
                >
                  #{tag}
                </span>
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

