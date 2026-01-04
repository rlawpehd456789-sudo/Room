'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Plus, Tag } from 'lucide-react'
import Header from '@/components/Header'
import { useStore } from '@/store/useStore'

export default function CreatePostPage() {
  const router = useRouter()
  const { user, addPost } = useStore()
  const [images, setImages] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  if (!user) {
    router.push('/auth/login')
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

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags((prev) => [...prev, tagInput.trim()])
      }
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
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
    router.push('/feed')
  }

  return (
    <div className="min-h-screen bg-primary-gray">
      <Header />
      <main className="pt-16 pb-8">
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
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  placeholder="あなたの部屋について教えてください..."
                />
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
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagAdd}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    placeholder="タグを入力してEnterキーを押してください"
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

