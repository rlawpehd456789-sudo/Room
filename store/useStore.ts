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
  toggleLike: (postId) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post
      ),
    })),
  addComment: (postId, comment) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, comment] }
          : post
      ),
    })),
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
    if (state.following.includes(userId)) return
    
    const newFollowing = [...state.following, userId]
    set({ following: newFollowing })
    
    if (typeof window !== 'undefined' && state.user) {
      localStorage.setItem(
        `my-room-following-${state.user.id}`,
        JSON.stringify(newFollowing)
      )
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
    set({ following })
    const state = get()
    if (typeof window !== 'undefined' && state.user) {
      localStorage.setItem(
        `my-room-following-${state.user.id}`,
        JSON.stringify(following)
      )
    }
  },
  addNotification: (notification) => {
    set((state) => ({ notifications: [notification, ...state.notifications] }))
    const state = get()
    if (typeof window !== 'undefined' && state.user) {
      localStorage.setItem(
        `my-room-notifications-${state.user.id}`,
        JSON.stringify(state.notifications)
      )
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

