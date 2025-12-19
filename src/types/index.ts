export interface Category {
  id: number
  name: string
  slug: string
}


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
  content?: string
  category_id?: number
  user_id?: number
  author?: User
  is_curated?: boolean
  created_at?: string
  updated_at?: string
}


export interface User {
  id: number
  name: string
  username?: string
  email: string
  avatar: string
  role: 'admin' | 'user'
  bookmarks?: number[]
  created_at?: string
  updated_at?: string
}

export interface GroupedPosts {
  [year: string]: Post[]
}
