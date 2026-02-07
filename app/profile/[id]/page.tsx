'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { UserPlus, UserMinus, Plus, X } from 'lucide-react'
import Header from '@/components/Header'
import PostCard from '@/components/PostCard'
import { useStore } from '@/store/useStore'

interface UserInfo {
  id: string
  name: string
  avatar?: string
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user, posts, followUser, unfollowUser, isFollowing, setFollowing } = useStore()
  const profileUserId = params.id as string
  const isOwnProfile = user?.id === profileUserId
  const userPosts = posts.filter((post) => post.userId === profileUserId)
  const following = isFollowing(profileUserId)
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [showFollowersModal, setShowFollowersModal] = useState(false)
  const [showFollowingModal, setShowFollowingModal] = useState(false)
  const [followersList, setFollowersList] = useState<UserInfo[]>([])
  const [followingList, setFollowingList] = useState<UserInfo[]>([])
  const modalRef = useRef<HTMLDivElement>(null)
  
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

  // 팔로워 목록 가져오기
  const getFollowersList = (): UserInfo[] => {
    if (typeof window === 'undefined') return []
    
    const followers: UserInfo[] = []
    const followerIds: string[] = []
    
    // 모든 사용자의 팔로우 목록에서 현재 프로필 사용자를 팔로우한 사용자 찾기
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('my-room-following-')) {
        const userId = key.replace('my-room-following-', '')
        if (userId !== profileUserId) {
          try {
            const followingList = JSON.parse(localStorage.getItem(key) || '[]')
            if (Array.isArray(followingList) && followingList.includes(profileUserId)) {
              followerIds.push(userId)
            }
          } catch {
            // 무시
          }
        }
      }
    }
    
    // 게시물에서 사용자 정보 가져오기
    followerIds.forEach((followerId) => {
      const followerPost = posts.find((post) => post.userId === followerId)
      if (followerPost) {
        followers.push({
          id: followerId,
          name: followerPost.userName,
          avatar: followerPost.userAvatar,
        })
      }
    })
    
    return followers
  }

  // 팔로잉 목록 가져오기
  const getFollowingList = (): UserInfo[] => {
    if (typeof window === 'undefined') return []
    
    const following: UserInfo[] = []
    const profileFollowingKey = `my-room-following-${profileUserId}`
    const profileFollowing = localStorage.getItem(profileFollowingKey)
    
    if (profileFollowing) {
      try {
        const followingIds = JSON.parse(profileFollowing)
        if (Array.isArray(followingIds)) {
          // 게시물에서 사용자 정보 가져오기
          followingIds.forEach((followingId: string) => {
            const followingPost = posts.find((post) => post.userId === followingId)
            if (followingPost) {
              following.push({
                id: followingId,
                name: followingPost.userName,
                avatar: followingPost.userAvatar,
              })
            }
          })
        }
      } catch {
        // 무시
      }
    }
    
    return following
  }

  // 팔로워/팔로잉 수 계산 함수
  const calculateCounts = () => {
    if (typeof window === 'undefined') return
    
    // 프로필 사용자의 팔로잉 수 계산
    const profileFollowingKey = `my-room-following-${profileUserId}`
    const profileFollowing = localStorage.getItem(profileFollowingKey)
    if (profileFollowing) {
      try {
        const followingList = JSON.parse(profileFollowing)
        setFollowingCount(Array.isArray(followingList) ? followingList.length : 0)
      } catch {
        setFollowingCount(0)
      }
    } else {
      setFollowingCount(0)
    }
    
    // 프로필 사용자의 팔로워 수 계산 (모든 사용자의 팔로우 목록에서 확인)
    let followers = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('my-room-following-')) {
        const userId = key.replace('my-room-following-', '')
        // 자기 자신의 팔로우 목록은 제외
        if (userId !== profileUserId) {
          try {
            const followingList = JSON.parse(localStorage.getItem(key) || '[]')
            if (Array.isArray(followingList) && followingList.includes(profileUserId)) {
              followers++
            }
          } catch {
            // 무시
          }
        }
      }
    }
    setFollowerCount(followers)
  }

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
      
      // 팔로워/팔로잉 수 계산
      calculateCounts()
    }
  }, [user, setFollowing, profileUserId])

  // 팔로우 상태 변경 시 숫자 업데이트
  useEffect(() => {
    calculateCounts()
  }, [following, profileUserId, posts])

  // 모달 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowFollowersModal(false)
        setShowFollowingModal(false)
      }
    }

    if (showFollowersModal || showFollowingModal) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showFollowersModal, showFollowingModal])

  // 모달 열릴 때 목록 업데이트
  useEffect(() => {
    if (showFollowersModal) {
      setFollowersList(getFollowersList())
    }
  }, [showFollowersModal, posts, profileUserId])

  useEffect(() => {
    if (showFollowingModal) {
      setFollowingList(getFollowingList())
    }
  }, [showFollowingModal, posts, profileUserId])

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
                        // 팔로우/언팔로우 후 숫자 업데이트
                        setTimeout(() => {
                          calculateCounts()
                        }, 100)
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
                
                {/* 게시물/팔로워/팔로잉 통계 */}
                <div className="flex gap-6 mb-4">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-primary-blue">{userPosts.length}</span>
                    <span className="text-sm text-gray-600">投稿</span>
                  </div>
                  <button
                    onClick={() => setShowFollowersModal(true)}
                    className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <span className="text-2xl font-bold text-primary-blue">{followerCount}</span>
                    <span className="text-sm text-gray-600">フォロワー</span>
                  </button>
                  <button
                    onClick={() => setShowFollowingModal(true)}
                    className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <span className="text-2xl font-bold text-primary-blue">{followingCount}</span>
                    <span className="text-sm text-gray-600">フォロー中</span>
                  </button>
                </div>
                
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
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg lg:text-xl font-extrabold uppercase leading-[0.8] tracking-[0.15em] transition-colors text-primary-blue">
                MYFEED
              </span>
              {isOwnProfile && (
                <button
                  onClick={() => router.push('/post/create')}
                  className="hover:scale-110 transition-transform cursor-pointer"
                  title="新しい投稿を作成"
                >
                  <Plus size={24} className="text-primary-blue" />
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

      {/* 팔로워 모달 */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold">フォロワー</h2>
              <button
                onClick={() => setShowFollowersModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              {followersList.length === 0 ? (
                <p className="text-center text-gray-500 py-8">フォロワーがいません</p>
              ) : (
                <div className="space-y-3">
                  {followersList.map((follower) => (
                    <div
                      key={follower.id}
                      onClick={() => {
                        setShowFollowersModal(false)
                        router.push(`/profile/${follower.id}`)
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    >
                      {follower.avatar ? (
                        <img
                          src={follower.avatar}
                          alt={follower.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary-blue flex items-center justify-center text-white text-lg">
                          {follower.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold">{follower.name}</p>
                      </div>
                      {user && follower.id !== user.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (isFollowing(follower.id)) {
                              unfollowUser(follower.id)
                            } else {
                              followUser(follower.id)
                            }
                            setTimeout(() => {
                              setFollowersList(getFollowersList())
                              calculateCounts()
                            }, 100)
                          }}
                          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                            isFollowing(follower.id)
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              : 'bg-primary-blue text-white hover:bg-opacity-90'
                          }`}
                        >
                          {isFollowing(follower.id) ? 'フォロー中' : 'フォロー'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 팔로잉 모달 */}
      {showFollowingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold">フォロー中</h2>
              <button
                onClick={() => setShowFollowingModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              {followingList.length === 0 ? (
                <p className="text-center text-gray-500 py-8">フォロー中のユーザーがいません</p>
              ) : (
                <div className="space-y-3">
                  {followingList.map((followingUser) => (
                    <div
                      key={followingUser.id}
                      onClick={() => {
                        setShowFollowingModal(false)
                        router.push(`/profile/${followingUser.id}`)
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    >
                      {followingUser.avatar ? (
                        <img
                          src={followingUser.avatar}
                          alt={followingUser.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary-blue flex items-center justify-center text-white text-lg">
                          {followingUser.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold">{followingUser.name}</p>
                      </div>
                      {user && followingUser.id !== user.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (isFollowing(followingUser.id)) {
                              unfollowUser(followingUser.id)
                            } else {
                              followUser(followingUser.id)
                            }
                            setTimeout(() => {
                              setFollowingList(getFollowingList())
                              calculateCounts()
                            }, 100)
                          }}
                          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                            isFollowing(followingUser.id)
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              : 'bg-primary-blue text-white hover:bg-opacity-90'
                          }`}
                        >
                          {isFollowing(followingUser.id) ? 'フォロー中' : 'フォロー'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

