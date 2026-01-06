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

interface AppState {
  user: User | null
  posts: Post[]
  following: string[] // 팔로우한 사용자 ID 목록
  setUser: (user: User | null) => void
  addPost: (post: Post) => void
  updatePost: (postId: string, updates: Partial<Post>) => void
  toggleLike: (postId: string) => void
  addComment: (postId: string, comment: Comment) => void
  updateComment: (postId: string, commentId: string, content: string) => void
  deleteComment: (postId: string, commentId: string) => void
  followUser: (userId: string) => void
  unfollowUser: (userId: string) => void
  isFollowing: (userId: string) => boolean
  setFollowing: (following: string[]) => void
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  posts: [],
  following: [],
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
}))

