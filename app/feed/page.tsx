'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import PostCard from '@/components/PostCard'
import { useStore } from '@/store/useStore'

export default function FeedPage() {
  const { posts, user, following, setFollowing } = useStore()
  const [feedType, setFeedType] = useState<'all' | 'following'>('following')

  useEffect(() => {
    // 초기 데이터 로드 (로컬 스토리지에서)
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('my-room-user')
      if (savedUser && !user) {
        useStore.getState().setUser(JSON.parse(savedUser))
      }

      // 팔로우 목록 로드
      if (user) {
        const savedFollowing = localStorage.getItem(`my-room-following-${user.id}`)
        if (savedFollowing) {
          setFollowing(JSON.parse(savedFollowing))
        }
      }

      // 샘플 데이터 (개발용)
      if (posts.length === 0) {
        const samplePosts = [
          {
            id: '1',
            userId: 'user1',
            userName: '田中太郎',
            images: [
              'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
            ],
            title: 'シンプルなワンルーム',
            description: 'ミニマルなインテリアで快適な空間を作りました。',
            tags: ['ミニマル', 'ワンルーム', 'DIY'],
            likes: 42,
            liked: false,
            comments: [],
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: '2',
            userId: 'user2',
            userName: '佐藤花子',
            images: [
              'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
            ],
            title: 'ナチュラルな1K',
            description: '観葉植物をたくさん置いて、自然を感じられる空間に。',
            tags: ['ナチュラル', 'グリーン', '1K'],
            likes: 89,
            liked: false,
            comments: [],
            createdAt: new Date(Date.now() - 7200000).toISOString(),
          },
          {
            id: '3',
            userId: 'user3',
            userName: '鈴木一郎',
            images: [
              'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800',
            ],
            title: 'モダンな1DK',
            description: '白を基調としたモダンなインテリアです。',
            tags: ['モダン', 'ホワイト', '1DK'],
            likes: 156,
            liked: false,
            comments: [],
            createdAt: new Date(Date.now() - 10800000).toISOString(),
          },
        ]
        samplePosts.forEach((post) => useStore.getState().addPost(post as any))
      }
    }
  }, [user, setFollowing])

  // 피드 타입에 따라 게시물 필터링
  const filteredPosts =
    feedType === 'following' && user
      ? posts.filter(
          (post) =>
            following.includes(post.userId) || post.userId === user.id
        )
      : posts

  return (
    <div className="min-h-screen bg-primary-gray">
      <Header />
      <main className="pt-18 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-primary-dark mb-2">
                  {feedType === 'following' ? 'FOLLOWER FEED' : '最新の投稿'}
                </h2>
                <p className="text-gray-600">
                  {feedType === 'following'
                    ? 'フォローユーザーの投稿をご覧ください'
                    : 'みんなの部屋のインテリアを見てみましょう'}
                </p>
              </div>
              {user && (
                <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm">
                  <button
                    onClick={() => setFeedType('following')}
                    className={`px-4 py-2 rounded-md font-semibold transition-colors ${
                      feedType === 'following'
                        ? 'bg-primary-blue text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    팔로우
                  </button>
                  <button
                    onClick={() => setFeedType('all')}
                    className={`px-4 py-2 rounded-md font-semibold transition-colors ${
                      feedType === 'all'
                        ? 'bg-primary-blue text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    전체
                  </button>
                </div>
              )}
            </div>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {feedType === 'following'
                  ? '팔로우한 사용자의 게시물이 없습니다'
                  : 'まだ投稿がありません'}
              </p>
              {feedType === 'following' && following.length === 0 && (
                <p className="text-gray-400 mb-4 text-sm">
                  프로필을 방문하여 사용자를 팔로우해보세요
                </p>
              )}
              {user && (
                <a
                  href="/post/create"
                  className="inline-block px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-opacity-90"
                >
                  {feedType === 'following'
                    ? '게시물 작성하기'
                    : '最初の投稿を作成'}
                </a>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

