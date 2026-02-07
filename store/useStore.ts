import { create } from 'zustand'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  interests?: string[]
  residenceType?: string
}

export interface Post {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  images: string[]
  title: string
  description?: string
  tags: string[]
  likes: number
  liked: boolean
  comments: Comment[]
  createdAt: string
}

export interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  createdAt: string
  edited?: boolean
  updatedAt?: string
}

export interface Notification {
  id: string
  userId: string // 알림을 받을 사용자 ID
  type: 'mention' | 'like' | 'comment' | 'follow'
  fromUserId: string // 알림을 보낸 사용자 ID
  fromUserName: string
  fromUserAvatar?: string
  postId?: string // 관련 게시물 ID (mention, like, comment의 경우)
  commentId?: string // 관련 댓글 ID (comment의 경우)
  content?: string // 알림 내용 (댓글 내용 등)
  read: boolean
  createdAt: string
}

interface AppState {
  user: User | null
  posts: Post[]
  following: string[] // 팔로우한 사용자 ID 목록
  notifications: Notification[] // 알림 목록
  setUser: (user: User | null) => void
  addPost: (post: Post) => void
  updatePost: (postId: string, updates: Partial<Post>) => void
  deletePost: (postId: string) => void
  toggleLike: (postId: string) => void
  addComment: (postId: string, comment: Comment) => void
  updateComment: (postId: string, commentId: string, content: string) => void
  deleteComment: (postId: string, commentId: string) => void
  followUser: (userId: string) => void
  unfollowUser: (userId: string) => void
  isFollowing: (userId: string) => boolean
  setFollowing: (following: string[]) => void
  addNotification: (notification: Notification) => void
  markNotificationAsRead: (notificationId: string) => void
  markAllNotificationsAsRead: () => void
  getUnreadNotificationCount: () => number
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  posts: [],
  following: [],
  notifications: [],
  setUser: (user) => {
    set({ user })
    if (typeof window !== 'undefined') {
      localStorage.setItem('my-room-user', JSON.stringify(user))
      // 사용자 변경 시 팔로우 목록도 로드
      if (user) {
        const savedFollowing = localStorage.getItem(`my-room-following-${user.id}`)
        if (savedFollowing) {
          set({ following: JSON.parse(savedFollowing) })
        }
        // 알림 목록 로드
        const savedNotifications = localStorage.getItem(`my-room-notifications-${user.id}`)
        if (savedNotifications) {
          try {
            const parsed = JSON.parse(savedNotifications)
            set({ notifications: Array.isArray(parsed) ? parsed : [] })
          } catch {
            set({ notifications: [] })
          }
        } else {
          set({ notifications: [] })
        }
      }
    }
  },
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  updatePost: (postId, updates) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId ? { ...post, ...updates } : post
      ),
    })),
  deletePost: (postId) =>
    set((state) => ({
      posts: state.posts.filter((post) => post.id !== postId),
    })),
  toggleLike: (postId) => {
    const state = get()
    const post = state.posts.find((p) => p.id === postId)
    if (!post || !state.user) return
    
    const wasLiked = post.liked
    const newLiked = !wasLiked
    
    set({
      posts: state.posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              liked: newLiked,
              likes: wasLiked ? p.likes - 1 : p.likes + 1,
            }
          : p
      ),
    })
    
    // 좋아요 알림 생성 (본인의 게시물이 아니고, 좋아요를 누른 경우에만)
    if (typeof window !== 'undefined' && newLiked && post.userId !== state.user.id) {
      // 게시물 작성자의 알림 목록에 추가
      const postOwnerNotificationsKey = `my-room-notifications-${post.userId}`
      const existingNotifications = localStorage.getItem(postOwnerNotificationsKey)
      const notifications = existingNotifications 
        ? JSON.parse(existingNotifications) 
        : []
      
      const newNotification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userId: post.userId, // 게시물 작성자
        type: 'like' as const,
        fromUserId: state.user.id, // 좋아요를 누른 사용자
        fromUserName: state.user.name,
        fromUserAvatar: state.user.avatar,
        postId: postId,
        read: false,
        createdAt: new Date().toISOString(),
      }
      
      notifications.unshift(newNotification)
      localStorage.setItem(postOwnerNotificationsKey, JSON.stringify(notifications))
      
      // 현재 로그인한 사용자가 게시물 작성자인 경우 알림 목록 업데이트
      if (state.user.id === post.userId) {
        set({ notifications })
      }
    }
  },
  addComment: (postId, comment) => {
    const state = get()
    const post = state.posts.find((p) => p.id === postId)
    if (!post) return
    
    set({
      posts: state.posts.map((p) =>
        p.id === postId
          ? { ...p, comments: [...p.comments, comment] }
          : p
      ),
    })
    
    // 댓글 알림 생성 (본인의 게시물이 아닌 경우에만)
    if (typeof window !== 'undefined' && post.userId !== comment.userId) {
      // 게시물 작성자의 알림 목록에 추가
      const postOwnerNotificationsKey = `my-room-notifications-${post.userId}`
      const existingNotifications = localStorage.getItem(postOwnerNotificationsKey)
      const notifications = existingNotifications 
        ? JSON.parse(existingNotifications) 
        : []
      
      const newNotification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userId: post.userId, // 게시물 작성자
        type: 'comment' as const,
        fromUserId: comment.userId, // 댓글을 작성한 사용자
        fromUserName: comment.userName,
        fromUserAvatar: comment.userAvatar,
        postId: postId,
        commentId: comment.id,
        content: comment.content,
        read: false,
        createdAt: new Date().toISOString(),
      }
      
      notifications.unshift(newNotification)
      localStorage.setItem(postOwnerNotificationsKey, JSON.stringify(notifications))
      
      // 현재 로그인한 사용자가 게시물 작성자인 경우 알림 목록 업데이트
      if (state.user && state.user.id === post.userId) {
        set({ notifications })
      }
    }
  },
  updateComment: (postId, commentId, content) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId
                  ? { ...comment, content, edited: true, updatedAt: new Date().toISOString() }
                  : comment
              ),
            }
          : post
      ),
    })),
  deleteComment: (postId, commentId) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.filter((comment) => comment.id !== commentId),
            }
          : post
      ),
    })),
  followUser: (userId) => {
    const state = get()
    // 본인은 자기 자신을 팔로우할 수 없음
    if (!state.user || state.user.id === userId) return
    // 이미 팔로우 중이면 리턴
    if (state.following.includes(userId)) return
    
    const newFollowing = [...state.following, userId]
    set({ following: newFollowing })
    
    if (typeof window !== 'undefined' && state.user) {
      localStorage.setItem(
        `my-room-following-${state.user.id}`,
        JSON.stringify(newFollowing)
      )
      
      // 팔로우 당한 사용자에게 알림 생성 (본인이 아닌 경우에만)
      if (state.user.id !== userId) {
        // 팔로우 당한 사용자의 정보 찾기 (게시물에서)
        const followedUserPost = state.posts.find((p) => p.userId === userId)
        if (followedUserPost) {
          // 팔로우 당한 사용자의 알림 목록에 추가
          const followedUserNotificationsKey = `my-room-notifications-${userId}`
          const existingNotifications = localStorage.getItem(followedUserNotificationsKey)
          const notifications = existingNotifications 
            ? JSON.parse(existingNotifications) 
            : []
          
          const newNotification = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            userId: userId, // 팔로우 당한 사용자
            type: 'follow' as const,
            fromUserId: state.user.id, // 팔로우를 한 사용자
            fromUserName: state.user.name,
            fromUserAvatar: state.user.avatar,
            read: false,
            createdAt: new Date().toISOString(),
          }
          
          notifications.unshift(newNotification)
          localStorage.setItem(followedUserNotificationsKey, JSON.stringify(notifications))
          
          // 현재 로그인한 사용자가 팔로우 당한 사용자인 경우 알림 목록 업데이트
          // (팔로우 당한 사용자가 현재 로그인한 사용자와 같은 경우)
          if (state.user && state.user.id === userId) {
            set({ notifications })
          }
        }
      }
    }
  },
  unfollowUser: (userId) => {
    const state = get()
    const newFollowing = state.following.filter((id) => id !== userId)
    set({ following: newFollowing })
    
    if (typeof window !== 'undefined' && state.user) {
      localStorage.setItem(
        `my-room-following-${state.user.id}`,
        JSON.stringify(newFollowing)
      )
    }
  },
  isFollowing: (userId) => {
    return get().following.includes(userId)
  },
  setFollowing: (following) => {
    const state = get()
    // 본인은 팔로우 목록에서 제외
    const userId = state.user?.id
    const filteredFollowing = userId 
      ? following.filter((id) => id !== userId)
      : following
    set({ following: filteredFollowing })
    
    if (typeof window !== 'undefined' && state.user) {
      localStorage.setItem(
        `my-room-following-${state.user.id}`,
        JSON.stringify(filteredFollowing)
      )
    }
  },
  addNotification: (notification) => {
    // 알림을 받을 사용자의 알림 목록에 추가
    if (typeof window !== 'undefined') {
      const targetUserId = notification.userId
      const targetUserNotificationsKey = `my-room-notifications-${targetUserId}`
      const existingNotifications = localStorage.getItem(targetUserNotificationsKey)
      const notifications = existingNotifications 
        ? JSON.parse(existingNotifications) 
        : []
      
      notifications.unshift(notification)
      localStorage.setItem(targetUserNotificationsKey, JSON.stringify(notifications))
      
      // 현재 로그인한 사용자가 알림을 받을 사용자인 경우 알림 목록 업데이트
      const state = get()
      if (state.user && state.user.id === targetUserId) {
        set({ notifications })
      }
    }
  },
  markNotificationAsRead: (notificationId) => {
    set((state) => ({
      notifications: Array.isArray(state.notifications)
        ? state.notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        : [],
    }))
    const state = get()
    if (typeof window !== 'undefined' && state.user) {
      localStorage.setItem(
        `my-room-notifications-${state.user.id}`,
        JSON.stringify(state.notifications)
      )
    }
  },
  markAllNotificationsAsRead: () => {
    set((state) => ({
      notifications: Array.isArray(state.notifications)
        ? state.notifications.map((n) => ({ ...n, read: true }))
        : [],
    }))
    const state = get()
    if (typeof window !== 'undefined' && state.user) {
      localStorage.setItem(
        `my-room-notifications-${state.user.id}`,
        JSON.stringify(state.notifications)
      )
    }
  },
  getUnreadNotificationCount: () => {
    const state = get()
    if (!Array.isArray(state.notifications)) {
      return 0
    }
    return state.notifications.filter((n) => !n.read).length
  },
}))

