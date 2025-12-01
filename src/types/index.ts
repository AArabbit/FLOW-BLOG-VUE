export interface Category {
  id: number
  name: string
  slug: string
}

// 文章类型
export interface Post {
  id: number
  title: string
  desc: string
  date: string
  category: Category
  readTime: number
  views: number
  cover: string
  codeSnippet?: string
}

// 修改 User 接口
export interface User {
  id: number
  name: string
  email: string
  avatar: string
  role: 'admin' | 'user'
  bookmarks: number[]
}

export interface GroupedPosts {
  [year: string]: Post[]
}
