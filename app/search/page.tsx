'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import PostCard from '@/components/PostCard'
import { useStore } from '@/store/useStore'
import { Search } from 'lucide-react'

export default function SearchPage() {
  const router = useRouter()
  const { posts, user } = useStore()
  const [searchQuery, setSearchQuery] = useState('')

  // URL 쿼리 파라미터 읽기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const q = params.get('q')
      if (q) {
        setSearchQuery(q)
      }
    }
  }, [])

  // 검색어로 게시물 필터링
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return []
    
    const query = searchQuery.toLowerCase().trim()
    return posts.filter((post) => {
      const titleMatch = post.title.toLowerCase().includes(query)
      const descriptionMatch = post.description?.toLowerCase().includes(query)
      const tagsMatch = post.tags.some((tag) => tag.toLowerCase().includes(query))
      const userNameMatch = post.userName.toLowerCase().includes(query)
      
      return titleMatch || descriptionMatch || tagsMatch || userNameMatch
    })
  }, [posts, searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="min-h-screen bg-primary-gray">
      <Header />
      <main className="pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary-dark mb-4">検索</h2>
            
            {/* 검색 입력 필드 */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="投稿、ユーザー、タグで検索..."
                  className="w-full px-4 py-3 pl-12 pr-4 bg-white border border-primary-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                />
                <Search 
                  size={20} 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
            </form>

            {/* 검색 결과 */}
            {searchQuery.trim() ? (
              filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">
                    「{searchQuery}」の検索結果が見つかりませんでした
                  </p>
                  <p className="text-gray-400 text-sm">
                    別のキーワードで検索してみてください
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">
                    「{searchQuery}」の検索結果: {filteredPosts.length}件
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  検索キーワードを入力してください
                </p>
                <p className="text-gray-400 text-sm">
                  投稿のタイトル、説明、タグ、ユーザー名で検索できます
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

