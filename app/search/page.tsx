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
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // "#" 제거 헬퍼 함수
  const removeHashPrefix = (text: string): string => {
    return text.startsWith('#') ? text.slice(1) : text
  }

  // URL 쿼리 파라미터 읽기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const q = params.get('q')
      const tag = params.get('tag')
      if (q) {
        // "#"로 시작하면 제거
        const cleanedQuery = removeHashPrefix(q)
        setSearchQuery(cleanedQuery)
      }
      if (tag) {
        setSelectedTag(tag)
        setSearchQuery('') // 태그가 있으면 검색어 초기화
      }
    }
  }, [])

  // 검색어 또는 태그로 게시물 필터링
  const filteredPosts = useMemo(() => {
    // 태그로 필터링
    if (selectedTag) {
      return posts.filter((post) => 
        post.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())
      )
    }
    
    // 검색어로 필터링
    if (!searchQuery.trim()) return []
    
    // "#"로 시작하면 제거
    const cleanedQuery = removeHashPrefix(searchQuery).toLowerCase().trim()
    if (!cleanedQuery) return []
    
    return posts.filter((post) => {
      const titleMatch = post.title.toLowerCase().includes(cleanedQuery)
      const descriptionMatch = post.description?.toLowerCase().includes(cleanedQuery)
      const tagsMatch = post.tags.some((tag) => tag.toLowerCase().includes(cleanedQuery))
      const userNameMatch = post.userName.toLowerCase().includes(cleanedQuery)
      
      return titleMatch || descriptionMatch || tagsMatch || userNameMatch
    })
  }, [posts, searchQuery, selectedTag])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSelectedTag(null) // 검색 시 태그 초기화
      // "#"로 시작하면 제거
      const cleanedQuery = removeHashPrefix(searchQuery).trim()
      if (cleanedQuery) {
        router.push(`/search?q=${encodeURIComponent(cleanedQuery)}`)
      }
    }
  }

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag)
    setSearchQuery('')
    router.push(`/search?tag=${encodeURIComponent(tag)}`)
  }

  const clearFilter = () => {
    setSelectedTag(null)
    setSearchQuery('')
    router.push('/search')
  }

  return (
    <div className="min-h-screen bg-primary-gray">
      <Header />
      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary-dark mb-4">検索</h2>
            
            {/* 선택된 태그 표시 */}
            {selectedTag && (
              <div className="mb-4 flex items-center gap-2">
                <span className="text-sm text-gray-600">フィルター:</span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-blue text-white rounded-full text-sm">
                  #{selectedTag}
                  <button
                    onClick={clearFilter}
                    className="hover:text-gray-200 ml-1"
                  >
                    ×
                  </button>
                </span>
              </div>
            )}
            
            {/* 검색 입력 필드 */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    let value = e.target.value
                    // "#"로 시작하는 경우 자동으로 제거하지 않고 그대로 표시
                    // (검색 시에만 제거)
                    setSearchQuery(value)
                    if (selectedTag) {
                      setSelectedTag(null)
                    }
                  }}
                  placeholder="投稿、ユーザー、タグで検索（#タグ名でも検索可能）..."
                  className="w-full px-4 py-3 pl-12 pr-4 bg-white border border-primary-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                />
                <Search 
                  size={20} 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
            </form>

            {/* 검색 결과 */}
            {selectedTag || searchQuery.trim() ? (
              filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">
                    {selectedTag 
                      ? `「#${selectedTag}」のタグが付いた投稿が見つかりませんでした`
                      : `「${removeHashPrefix(searchQuery)}」の検索結果が見つかりませんでした`}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {selectedTag 
                      ? '別のタグを試してみてください'
                      : '別のキーワードで検索してみてください'}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">
                    {selectedTag 
                      ? `「#${selectedTag}」のタグが付いた投稿: ${filteredPosts.length}件`
                      : `「${removeHashPrefix(searchQuery)}」の検索結果: ${filteredPosts.length}件`}
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
                  投稿のタグを入力してください
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

