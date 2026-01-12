'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Plus, Tag } from 'lucide-react'
import Header from '@/components/Header'
import { useStore } from '@/store/useStore'

export default function CreatePostPage() {
  const router = useRouter()
  const { user, addPost, posts, addNotification } = useStore()
  const [images, setImages] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [prevTagInput, setPrevTagInput] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [mentionQuery, setMentionQuery] = useState('')
  const [showMentionDropdown, setShowMentionDropdown] = useState(false)
  const [mentionPosition, setMentionPosition] = useState(0)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      if (images.length >= 20) {
        alert('最大20枚までアップロードできます')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleTagInputChange = (value: string) => {
    // "#"로 시작하는 경우 처리
    if (value.startsWith('#')) {
      const tagText = value.slice(1)
      
      // 이전 값과 비교하여 공백이 새로 추가되었는지 확인
      const prevTagText = prevTagInput.startsWith('#') ? prevTagInput.slice(1) : prevTagInput
      
      // 공백이 새로 추가되었고, 공백 전에 텍스트가 있는 경우에만 태그 추가
      if (tagText.includes(' ') && !prevTagText.includes(' ')) {
        const spaceIndex = tagText.indexOf(' ')
        const newTag = tagText.substring(0, spaceIndex).trim()
        
        // 공백 전에 실제 텍스트가 있는 경우에만 태그 추가
        if (newTag && newTag.length > 0 && !tags.includes(newTag)) {
          setTags((prev) => [...prev, newTag])
        }
        
        // 공백 후의 텍스트만 남김 (공백 제거)
        const remaining = tagText.substring(spaceIndex + 1).trim()
        setTagInput(remaining ? `#${remaining}` : '')
        setPrevTagInput(remaining ? `#${remaining}` : '')
        return
      }
    }
    
    setTagInput(value)
    setPrevTagInput(value)
  }

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      
      let tagToAdd = tagInput.trim()
      
      // "#"로 시작하면 제거
      if (tagToAdd.startsWith('#')) {
        tagToAdd = tagToAdd.slice(1).trim()
      }
      
      if (tagToAdd && !tags.includes(tagToAdd)) {
        setTags((prev) => [...prev, tagToAdd])
      }
      setTagInput('')
      setPrevTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  // 멘션 가능한 사용자 목록 추출 (모든 게시글 작성자 + 모든 코멘트 작성자)
  const allUsersMap = new Map<string, { id: string; name: string; avatar?: string }>()
  posts.forEach((p) => {
    if (!allUsersMap.has(p.userId)) {
      allUsersMap.set(p.userId, { id: p.userId, name: p.userName, avatar: p.userAvatar })
    }
    p.comments.forEach((c) => {
      if (!allUsersMap.has(c.userId)) {
        allUsersMap.set(c.userId, { id: c.userId, name: c.userName, avatar: c.userAvatar })
      }
    })
  })
  const availableUsers = Array.from(allUsersMap.values()).filter((u) => u.id !== user?.id)

  // 멘션 필터링된 사용자 목록
  const filteredMentionUsers = availableUsers.filter((u) =>
    u.name.toLowerCase().includes(mentionQuery.toLowerCase())
  )

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setDescription(value)

    // @ 입력 감지
    const cursorPosition = e.target.selectionStart || 0
    const textBeforeCursor = value.slice(0, cursorPosition)
    
    // @ 패턴 찾기 (가장 가까운 것, 공백이나 줄바꿈 뒤에 @가 오는 경우)
    // 한글, 영문, 숫자, 언더스코어를 포함한 닉네임 지원
    const mentionPattern = /(?:^|\s)@([가-힣a-zA-Z0-9_]*)$/
    const match = textBeforeCursor.match(mentionPattern)

    if (match) {
      const query = match[1] || ''
      const mentionStart = textBeforeCursor.lastIndexOf('@')
      
      if (mentionStart !== -1) {
        setMentionQuery(query)
        setMentionPosition(mentionStart)
        setShowMentionDropdown(true)
      } else {
        setShowMentionDropdown(false)
      }
    } else {
      setShowMentionDropdown(false)
    }
  }

  const handleMentionSelect = (userName: string) => {
    const textBeforeMention = description.slice(0, mentionPosition)
    const textAfterMention = description.slice(mentionPosition + 1 + mentionQuery.length)
    const newText = `${textBeforeMention}@${userName} ${textAfterMention}`
    setDescription(newText)
    setShowMentionDropdown(false)
    setMentionQuery('')
    
    // 입력 필드에 포커스 유지 및 커서 위치 조정
    setTimeout(() => {
      const textarea = document.getElementById('description') as HTMLTextAreaElement
      if (textarea) {
        const newCursorPosition = mentionPosition + 1 + userName.length + 1 // @닉네임 + 공백
        textarea.focus()
        textarea.setSelectionRange(newCursorPosition, newCursorPosition)
      }
    }, 0)
  }

  // 멘션 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.mention-dropdown-container')) {
        setShowMentionDropdown(false)
      }
    }

    if (showMentionDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showMentionDropdown])

  // 멘션된 사용자 ID 목록 추출
  const extractMentionedUserIds = (text: string): string[] => {
    const mentionRegex = /@([가-힣a-zA-Z0-9_]+)/g
    const mentionedUserIds: string[] = []
    let match

    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionedName = match[1]
      const mentionedUser = availableUsers.find((u) => u.name === mentionedName)
      if (mentionedUser && mentionedUser.id !== user?.id) {
        mentionedUserIds.push(mentionedUser.id)
      }
    }

    // 중복 제거
    return Array.from(new Set(mentionedUserIds))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      alert('タイトルを入力してください')
      return
    }

    if (images.length === 0) {
      alert('少なくとも1枚の画像をアップロードしてください')
      return
    }

    const newPost = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      images,
      title,
      description,
      tags,
      likes: 0,
      liked: false,
      comments: [],
      createdAt: new Date().toISOString(),
    }

    addPost(newPost)

    // 설명에 멘션된 사용자들에게 알림 생성
    if (description) {
      const mentionedUserIds = extractMentionedUserIds(description)
      mentionedUserIds.forEach((mentionedUserId) => {
        const mentionedUser = availableUsers.find((u) => u.id === mentionedUserId)
        if (mentionedUser) {
          addNotification({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            userId: mentionedUserId,
            type: 'mention',
            fromUserId: user.id,
            fromUserName: user.name,
            fromUserAvatar: user.avatar,
            postId: newPost.id,
            content: description,
            read: false,
            createdAt: new Date().toISOString(),
          })
        }
      })
    }

    router.push(`/post/${newPost.id}`)
  }

  return (
    <div className="min-h-screen bg-primary-gray">
      <Header />
      <main className="pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8 mt-8">
            <h1 className="text-3xl font-bold mb-8">新しい投稿</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 画像アップロード */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  写真（最大20枚）
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={image}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  {images.length < 20 && (
                    <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-blue hover:bg-blue-50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Plus size={32} className="text-gray-400" />
                    </label>
                  )}
                </div>
              </div>

              {/* タイトル */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  placeholder="例: シンプルなワンルーム"
                  required
                />
              </div>

              {/* 説明 */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  説明
                </label>
                <div className="relative mention-dropdown-container">
                  <textarea
                    id="description"
                    value={description}
                    onChange={handleDescriptionChange}
                    onKeyDown={(e) => {
                      if (showMentionDropdown) {
                        if (e.key === 'ArrowDown') {
                          e.preventDefault()
                        } else if (e.key === 'Enter' && filteredMentionUsers.length > 0) {
                          e.preventDefault()
                          handleMentionSelect(filteredMentionUsers[0].name)
                          return
                        } else if (e.key === 'Escape') {
                          e.preventDefault()
                          setShowMentionDropdown(false)
                          return
                        }
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowMentionDropdown(false), 200)
                    }}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    placeholder="あなたの部屋について教えてください... @닉네임으로 멘션"
                  />
                  {showMentionDropdown && availableUsers.length > 0 && (
                    <div className="absolute bottom-full left-0 mb-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                      {filteredMentionUsers.length > 0 ? (
                        filteredMentionUsers.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault() // onBlur 이벤트 방지
                              handleMentionSelect(u.name)
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                          >
                            {u.avatar ? (
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary-blue flex items-center justify-center text-white text-sm">
                                {u.name.charAt(0)}
                              </div>
                            )}
                            <span className="font-semibold">{u.name}</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500 text-sm">
                          사용자를 찾을 수 없습니다
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* タグ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タグ
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <Tag size={20} className="text-gray-400" />
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => handleTagInputChange(e.target.value)}
                    onKeyDown={handleTagAdd}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    placeholder="#タグ名を入力（Enterキーまたはスペースで追加）"
                  />
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary-blue text-white rounded-full text-sm"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-gray-200"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 公開設定 */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4 text-primary-blue border-gray-300 rounded focus:ring-primary-blue"
                  />
                  <span className="text-sm text-gray-700">公開する</span>
                </label>
              </div>

              {/* 送信ボタン */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-blue text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
                >
                  投稿する
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

