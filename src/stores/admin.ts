import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types'
import * as authApi from '@/api/auth'

export const useAdminStore = defineStore('admin', () => {
  const userList = ref<User[]>([])
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(30)
  const isLoading = ref(false)

  async function fetchUsers(page = 1, size = 30) {
    isLoading.value = true
    try {
      const res = await authApi.getUserList({ page, page_size: size })
      const list = res.useList || []

      userList.value = list.map((u: any) => ({
        ...u,
        name: u.username || u.name || 'Unknown',
        role: u.role || 'user'
      }))

      total.value = res.total
      currentPage.value = page
      pageSize.value = size
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      isLoading.value = false
    }
  }

  // 查找用户
  function findUserByUsername(username: string) {
    return userList.value.find(u => u.name.toLowerCase() === username.toLowerCase())
  }

  function findAdmin() {
    return userList.value.find(u => u.role === 'admin')
  }

  // 添加新用户
  function addUser(user: User) {
    userList.value.unshift(user)
  }

  // 删除用户
  async function deleteUser(id: number) {
    try {
      await authApi.deleteUser(id)
      await fetchUsers(currentPage.value, pageSize.value)
      return true
    } catch (error) {
      console.error('Failed to delete user:', error)
      throw error
    }
  }

  // 更新用户
  async function updateUser(updatedUser: Partial<User>) {
    if (!updatedUser.id) return null

    try {
      await authApi.updateUser(updatedUser.id, {
        user_name: updatedUser.name || '',
        email: updatedUser.email || '',
        role: updatedUser.role || 'user',
        avatar: updatedUser.avatar || ''
      })

      // Refresh list
      await fetchUsers(currentPage.value, pageSize.value)
      return updatedUser
    } catch (error) {
      console.error('Failed to update user:', error)
      throw error
    }
  }

  return {
    userList,
    total,
    currentPage,
    pageSize,
    isLoading,
    fetchUsers,
    findUserByUsername,
    findAdmin,
    addUser,
    deleteUser,
    updateUser
  }
})
