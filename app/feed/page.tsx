'use client'

import { useEffect, useState, useMemo } from 'react'
import Header from '@/components/Header'
import PostCard from '@/components/PostCard'
import { useStore } from '@/store/useStore'

export default function FeedPage() {
  const { posts, user, following, setFollowing } = useStore()
  const [feedType, setFeedType] = useState<'all' | 'following'>('following')

  useEffect(() => {
    // 初期データの読み込み（ローカルストレージから）
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('my-room-user')
      if (savedUser && !user) {
        useStore.getState().setUser(JSON.parse(savedUser))
      }
    }
  }, [user])

  useEffect(() => {
    // フォローリストの読み込み（userが変更されるたびに）
    if (typeof window !== 'undefined' && user) {
      const savedFollowing = localStorage.getItem(`my-room-following-${user.id}`)
      if (savedFollowing) {
        const followingList = JSON.parse(savedFollowing)
        if (Array.isArray(followingList)) {
          setFollowing(followingList)
        }
      } else {
        // フォローリストがない場合は空配列で初期化
        setFollowing([])
      }
    }

  }, [user, setFollowing])

  useEffect(() => {
    // サンプルデータ（開発用）
    if (typeof window !== 'undefined' && posts.length === 0) {
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
  }, [posts.length])

  // フィードタイプに応じて投稿をフィルタリング
  const filteredPosts = useMemo(() => {
    if (feedType === 'following') {
      // フォローフィードの場合
      if (!user || !user.id) {
        // ログインしていない場合は空配列を返す
        return []
      }
      // followingが配列でないか空の場合は空配列を返す
      if (!Array.isArray(following) || following.length === 0) {
        return []
      }
      // Setを使用して高速かつ正確な検索を実現
      // すべてのIDを文字列に正規化してSetに格納
      const followingSet = new Set(
        following
          .filter((id) => id != null && id !== '')
          .map((id) => String(id).trim())
      )
      
      // フォローしたユーザーの投稿のみをフィルタリング
      return posts.filter((post) => {
        // post.userIdが存在しない場合は除外
        if (!post.userId || post.userId === '') {
          return false
        }
        // userIdを文字列に正規化してSetで検索
        const normalizedUserId = String(post.userId).trim()
        // Setに存在する場合のみtrueを返す
        return followingSet.has(normalizedUserId)
      })
    }
    return posts
  }, [feedType, user, posts, following])

  return (
    <div className="min-h-screen bg-primary-gray">
      <Header />
      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 mt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-sm lg:text-base font-extrabold uppercase leading-[0.8] tracking-[0.15em] text-primary-blue mb-2">
                  {feedType === 'following' ? 'FOLLOWER FEED' : 'LATEST POSTS'}
                </h2>
                <p className="text-gray-600">
                  {feedType === 'following'
                    ? 'フォローユーザーの投稿をご覧ください'
                    : 'みんなの部屋のインテリアを見てみましょう'}
                </p>
              </div>
              <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm ml-4">
                <button
                  onClick={() => {
                    if (!user) {
                      window.location.href = '/auth/login'
                      return
                    }
                    setFeedType('all')
                  }}
                  className={`px-4 py-2 rounded-md font-semibold transition-colors ${
                    feedType === 'all'
                      ? 'bg-primary-blue text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  すべて
                </button>
                <button
                  onClick={() => {
                    if (!user) {
                      window.location.href = '/auth/login'
                      return
                    }
                    setFeedType('following')
                  }}
                  className={`px-4 py-2 rounded-md font-semibold transition-colors ${
                    feedType === 'following'
                      ? 'bg-primary-blue text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  フォロー
                </button>
              </div>
            </div>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {feedType === 'following'
                  ? 'フォロー中のユーザーの投稿がありません'
                  : 'まだ投稿がありません'}
              </p>
              {feedType === 'following' && following.length === 0 && (
                <>
                  <p className="text-gray-400 mb-4 text-sm">
                    プロフィールを訪問してユーザーをフォローしてみましょう
                  </p>
                  <button
                    onClick={() => setFeedType('all')}
                    className="inline-block px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-opacity-90"
                  >
                    他のユーザーの投稿を見る
                  </button>
                </>
              )}
              {user && feedType !== 'following' && (
                <a
                  href="/post/create"
                  className="inline-block px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-opacity-90"
                >
                  最初の投稿を作成
                </a>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
              {/* 投稿が4つ未満の場合でもカードサイズを維持するための空白スペース */}
              {feedType === 'following' &&
                filteredPosts.length < 4 &&
                Array.from({ length: 4 - filteredPosts.length }).map((_, index) => (
                  <div key={`empty-${index}`} className="hidden lg:block" aria-hidden="true" />
                ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
