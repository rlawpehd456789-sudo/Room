'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { UserPlus, UserMinus } from 'lucide-react'
import Header from '@/components/Header'
import PostCard from '@/components/PostCard'
import { useStore } from '@/store/useStore'

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user, posts, followUser, unfollowUser, isFollowing, setFollowing } = useStore()
  const profileUserId = params.id as string
  const isOwnProfile = user?.id === profileUserId
  const userPosts = posts.filter((post) => post.userId === profileUserId)
  const following = isFollowing(profileUserId)
  
  // 게시물에서 사용자 정보 가져오기 (첫 번째 게시물 기준)
  const profileUserFromPost = userPosts.length > 0 
    ? {
        id: profileUserId,
        name: userPosts[0].userName,
        email: `${userPosts[0].userName}@example.com`, // 임시 이메일
        avatar: userPosts[0].userAvatar,
        interests: [],
        residenceType: undefined,
      }
    : null
  
  const profileUser = isOwnProfile ? user : profileUserFromPost

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 로드
    if (typeof window !== 'undefined') {
      if (!user) {
        const savedUser = localStorage.getItem('my-room-user')
        if (savedUser) {
          useStore.getState().setUser(JSON.parse(savedUser))
        }
      }
      // 팔로우 목록 로드
      if (user) {
        const savedFollowing = localStorage.getItem(`my-room-following-${user.id}`)
        if (savedFollowing) {
          setFollowing(JSON.parse(savedFollowing))
        }
      }
    }
  }, [user, setFollowing])

  // 프로필 사용자 정보 결정
  const displayUser = profileUser || (isOwnProfile ? user : null)

  if (!displayUser) {
    return (
      <div className="min-h-screen bg-primary-gray">
        <Header />
        <main className="pt-20 pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center py-12 text-gray-500">
              {userPosts.length === 0 
                ? 'このユーザーの投稿が見つかりません' 
                : 'ユーザー情報を読み込めません'}
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-gray">
      <Header />
      <main className="pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* プロフィールヘッダー */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6 mt-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {displayUser.avatar ? (
                <img
                  src={displayUser.avatar}
                  alt={displayUser.name}
                  width={100}
                  height={100}
                  className="rounded-full w-24 h-24 object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary-blue flex items-center justify-center text-white text-3xl">
                  {displayUser.name.charAt(0)}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-3xl font-bold">{displayUser.name}</h1>
                  {!isOwnProfile && user && (
                    <button
                      onClick={() => {
                        if (following) {
                          unfollowUser(profileUserId)
                        } else {
                          followUser(profileUserId)
                        }
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                        following
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-primary-blue text-white hover:bg-opacity-90'
                      }`}
                    >
                      {following ? (
                        <>
                          <UserMinus size={18} />
                          <span>フォロー中</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={18} />
                          <span>フォロー</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{displayUser.email}</p>
                {displayUser.interests && displayUser.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {displayUser.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-blue text-white rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
                {displayUser.residenceType && (
                  <p className="text-sm text-gray-500">
                    住居タイプ: {displayUser.residenceType}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 投稿一覧 */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold">投稿</h2>
              {isOwnProfile && (
                <button
                  onClick={() => router.push('/post/create')}
                  className="text-2xl hover:scale-110 transition-transform cursor-pointer"
                  title="新しい投稿を作成"
                >
                  ➕
                </button>
              )}
            </div>
            {userPosts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-500">まだ投稿がありません</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {userPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

