/**
 * 锁定滚动条并处理布局抖动
 * @param locked 是否锁定
 */
export function handleScrollLock(locked: boolean) {
  if (locked) {
    // 计算滚动条的物理宽度
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth

    // 如果存在滚动条，设置 CSS 变量和 Body Padding
    if (scrollBarWidth > 0) {
      // 设置全局变量
      document.documentElement.style.setProperty('--scrollbar-gap', `${scrollBarWidth}px`)
      document.body.style.paddingRight = `${scrollBarWidth}px`
    }

    // 暂停 Lenis 滚动和原生滚动
    document.documentElement.classList.add('lenis-stopped')
    document.body.style.overflow = 'hidden'

  } else {
    // 解锁：清理样式
    document.documentElement.style.removeProperty('--scrollbar-gap')
    document.body.style.paddingRight = ''
    document.body.style.overflow = ''
    document.documentElement.classList.remove('lenis-stopped')
  }
}
