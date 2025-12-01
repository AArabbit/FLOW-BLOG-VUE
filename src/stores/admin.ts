import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types'

// 模拟初始用户列表
const MOCK_USERS: User[] = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@mindflow.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    role: 'admin',
    bookmarks: [1, 3, 5]
  },
  {
    id: 2,
    name: 'Sarah Jen',
    email: 'sarah@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    role: 'user',
    bookmarks: [2]
  },
  {
    id: 3,
    name: 'Mike Ross',
    email: 'mike@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    role: 'user',
    bookmarks: []
  }
]

export const useAdminStore = defineStore('admin', () => {
  const userList = ref<User[]>(MOCK_USERS)

  // 查找用户 (用于登录验证)
  function findUserByUsername(username: string) {
    return userList.value.find(u => u.name.toLowerCase() === username.toLowerCase())
  }

  function findAdmin() {
    return userList.value.find(u => u.role === 'admin')
  }

  // 添加新用户 (注册)
  function addUser(user: User) {
    userList.value.push(user)
  }

  // 删除用户 (管理功能)
  function deleteUser(id: number) {
    const index = userList.value.findIndex(u => u.id === id)
    if (index !== -1) {
      userList.value.splice(index, 1)
    }
  }

  // 更新用户 (管理功能 + 个人资料更新)
  function updateUser(updatedUser: Partial<User>) {
    const index = userList.value.findIndex(u => u.id === updatedUser.id)
    if (index !== -1) {
      userList.value[index] = { ...userList.value[index], ...updatedUser }
      return userList.value[index] // 返回更新后的对象
    }
    return null
  }

  return {
    userList,
    findUserByUsername,
    findAdmin,
    addUser,
    deleteUser,
    updateUser
  }
})
