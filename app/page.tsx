'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Header from '@/components/Header'
import PostCard from '@/components/PostCard'
import { useStore } from '@/store/useStore'
import { motion } from 'framer-motion'

export default function Home() {
  const { posts, user, following, setFollowing } = useStore()
  const [feedType, setFeedType] = useState<'all' | 'following'>('all')
  const [scrollDirection, setScrollDirection] = useState<'down' | 'up'>('down')
  const [lastScrollY, setLastScrollY] = useState(0)

  // 스크롤 방향 감지
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY && currentScrollY > 10) {
        setScrollDirection('down')
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up')
      }
      setLastScrollY(currentScrollY)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY])

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
      <main>
        {/* 소개글 섹션 */}
        <section className="relative bg-white border-b border-primary-gray min-h-screen flex items-center pt-16 overflow-hidden">
          {/* 배경 이미지 */}
          <motion.div 
            className="absolute inset-0 z-0"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <Image
              src="/소개페이지4.jpeg"
              alt="Background"
              fill
              className="object-cover"
              priority
            />
          </motion.div>
          
          {/* 오버레이 (텍스트 가독성 향상) */}
          <div className="absolute inset-0 bg-black/10 z-[1]" />
          
        </section>

        {/* 팔로우 피드 섹션 */}
        <section id="feed" className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: scrollDirection === 'down' ? 0.8 : 0, ease: "easeOut" }}
            >
              <div className="flex items-center justify-between mb-4">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, margin: "-100px" }}
                  transition={{ duration: scrollDirection === 'down' ? 0.6 : 0, delay: scrollDirection === 'down' ? 0.2 : 0, ease: "easeOut" }}
                >
                  <h2 className="text-2xl font-bold text-primary-dark mb-2">
                    {feedType === 'following' ? 'FOLLOWER FEED' : '最新の投稿'}
                  </h2>
                  <p className="text-gray-600">
                    {feedType === 'following'
                      ? 'フォローユーザーの投稿をご覧ください'
                      : 'みんなの部屋のインテリアを見てみましょう'}
                  </p>
                </motion.div>
                {user && (
                  <motion.div 
                    className="flex gap-2 bg-white rounded-lg p-1 shadow-sm"
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, margin: "-100px" }}
                    transition={{ duration: scrollDirection === 'down' ? 0.6 : 0, delay: scrollDirection === 'down' ? 0.3 : 0, ease: "easeOut" }}
                  >
                    <button
                      onClick={() => setFeedType('all')}
                      className={`px-4 py-2 rounded-md font-semibold transition-colors whitespace-nowrap text-center ${
                        feedType === 'all'
                          ? 'bg-primary-blue text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      すべて
                    </button>
                    <button
                      onClick={() => setFeedType('following')}
                      className={`px-4 py-2 rounded-md font-semibold transition-colors whitespace-nowrap text-center ${
                        feedType === 'following'
                          ? 'bg-primary-blue text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      フォロー
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {filteredPosts.length === 0 ? (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-50px" }}
                transition={{ duration: scrollDirection === 'down' ? 0.6 : 0, ease: "easeOut" }}
              >
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
              </motion.div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, margin: "-50px" }}
                transition={{ duration: scrollDirection === 'down' ? 0.6 : 0, ease: "easeOut" }}
              >
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "-50px" }}
                    transition={{ 
                      duration: scrollDirection === 'down' ? 0.6 : 0, 
                      delay: scrollDirection === 'down' ? index * 0.1 : 0,
                      ease: "easeOut" 
                    }}
                  >
                    <PostCard post={post} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

