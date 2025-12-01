/**
 * 锁定滚动条并处理布局抖动
 * @param locked 是否锁定
 */
export function handleScrollLock(locked: boolean) {
  if (locked) {
    // 1. 计算滚动条的物理宽度
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
    
    // 2. 如果存在滚动条，设置 CSS 变量和 Body Padding
    if (scrollBarWidth > 0) {
      // 设置全局变量，供 Navbar 等 fixed 元素使用
      document.documentElement.style.setProperty('--scrollbar-gap', `${scrollBarWidth}px`)
      // 给 body 添加 padding，防止流体布局内容跳动
      document.body.style.paddingRight = `${scrollBarWidth}px`
    }
    
    // 3. 暂停 Lenis 滚动和原生滚动
    document.documentElement.classList.add('lenis-stopped')
    // 额外防止原生滚动穿透
    document.body.style.overflow = 'hidden'
    
  } else {
    // 解锁：清理样式
    // 延迟一小会儿移除变量，防止动画结束前瞬间闪烁（可选，这里直接移除通常也可以）
    document.documentElement.style.removeProperty('--scrollbar-gap')
    document.body.style.paddingRight = ''
    document.body.style.overflow = ''
    document.documentElement.classList.remove('lenis-stopped')
  }
}
