<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import Matter from 'matter-js'
import { useThemeStore } from '@/stores/theme'

// 显示的关键字
const KEYWORDS = [
  { text: 'FLOW', type: 'primary', scale: 1.2 },
  { text: 'BLOG', type: 'outline', scale: 1.2 },
  { text: 'Gorm', type: 'solid', scale: 0.9 },
  { text: 'Code', type: 'solid', scale: 0.9 },
  { text: 'Gin', type: 'solid', scale: 0.9 },
  { text: 'Create', type: 'outline', scale: 0.8 },
  { text: 'Vue3', type: 'outline', scale: 0.8 },
  { text: 'React', type: 'solid', scale: 0.8 },
  { text: '无界', type: 'solid', scale: 0.8 },
  { text: 'Explore', type: 'solid', scale: 0.8 },
  { text: 'Golang', type: 'primary', scale: 0.9 },
  { text: 'Typescript', type: 'solid', scale: 0.8 },
  { text: 'JavaScript', type: 'outline', scale: 0.7 },
  { text: 'CSS', type: 'outline', scale: 0.6 },
  { text: 'HTML5', type: 'outline', scale: 0.6 }
]

const themeStore = useThemeStore()
const containerRef = ref<HTMLElement | null>(null)
let engine: Matter.Engine | null = null
let render: Matter.Render | null = null
let runner: Matter.Runner | null = null
let mouseConstraint: Matter.MouseConstraint | null = null

const getTextWidth = (text: string, fontSize: number) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.font = `700 ${fontSize}px system-ui, sans-serif`
    return ctx.measureText(text).width + 32
  }
  return 80
}

const initGame = () => {
  if (!containerRef.value) return

  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight
  const wallThick = 60

  engine = Matter.Engine.create()
  runner = Matter.Runner.create()

  render = Matter.Render.create({
    element: containerRef.value,
    engine: engine,
    options: {
      width,
      height,
      background: 'transparent',
      wireframes: false,
      pixelRatio: window.devicePixelRatio
    }
  })

  // 边界
  const walls = [
    Matter.Bodies.rectangle(width / 2, height + wallThick / 2 - 2, width, wallThick, { isStatic: true, render: { visible: false } }),
    Matter.Bodies.rectangle(0 - wallThick / 2, height / 2, wallThick, height * 2, { isStatic: true, render: { visible: false } }),
    Matter.Bodies.rectangle(width + wallThick / 2, height / 2, wallThick, height * 2, { isStatic: true, render: { visible: false } })
  ]
  Matter.Composite.add(engine.world, walls)

  // 创建物体
  const bodies: Matter.Body[] = []

  KEYWORDS.forEach((item) => {
    const fontSize = 20 * item.scale
    const boxWidth = getTextWidth(item.text, fontSize)
    const boxHeight = fontSize * 2.0

    // 初始位置
    const x = Math.random() * (width - 200) + 100
    const y = -Math.random() * 400 - 50

    const body = Matter.Bodies.rectangle(x, y, boxWidth, boxHeight, {
      chamfer: { radius: boxHeight / 2 },
      restitution: 0.6,
      friction: 0.05,
      density: 0.04,
      render: { opacity: 0 }
    })

      ; (body as any).customData = {
        text: item.text,
        type: item.type,
        fontSize: fontSize,
        width: boxWidth,
        height: boxHeight
      }
    bodies.push(body)
  })

  Matter.Composite.add(engine.world, bodies)

  // 鼠标交互
  const mouse = Matter.Mouse.create(render.canvas)
  mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: { stiffness: 0.2, render: { visible: false } }
  })
  Matter.Composite.add(engine.world, mouseConstraint)

  mouse.element.removeEventListener("mousewheel", (mouse as any).mousewheel)
  mouse.element.removeEventListener("DOMMouseScroll", (mouse as any).mousewheel)

  // 渲染循环
  Matter.Events.on(render, 'afterRender', () => {
    if (!render) return
    const ctx = render.context
    const primaryColor = themeStore.themeColor
    const textColorMain = getComputedStyle(document.body).getPropertyValue('--text-main').trim()
    const cardBg = getComputedStyle(document.body).getPropertyValue('--card-bg').trim()
    const isDark = document.documentElement.classList.contains('dark') || themeStore.isDark === true

    const allBodies = Matter.Composite.allBodies(engine!.world)

    allBodies.forEach((body) => {
      if ((body.isStatic && !body.render.visible) || !(body as any).customData) return

      const { position, angle } = body
      const { text, type, fontSize, width, height } = (body as any).customData

      ctx.save()
      ctx.translate(position.x, position.y)
      ctx.rotate(angle)

      // 绘制形状
      ctx.beginPath()
      if (ctx.roundRect) {
        ctx.roundRect(-width / 2, -height / 2, width, height, height / 2)
      } else {
        ctx.rect(-width / 2, -height / 2, width, height)
      }
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)'
      ctx.shadowBlur = 15
      ctx.shadowOffsetY = 8

      if (type === 'primary') {
        // 主题色块
        ctx.fillStyle = primaryColor
        ctx.fill()
        ctx.fillStyle = '#ffffff'
      } else if (type === 'solid') {
        if (cardBg.includes('#fff') || cardBg.includes('255')) {
          // 亮色模式
          ctx.fillStyle = '#ffffff'
        } else {
          // 暗色模式
          ctx.fillStyle = '#2a2a2a'
        }
        ctx.fill()
        ctx.lineWidth = 1
        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
        ctx.stroke()

        ctx.fillStyle = textColorMain
      } else {
        // Outline 块
        ctx.lineWidth = 1.5
        ctx.strokeStyle = textColorMain
        ctx.stroke()
        ctx.fillStyle = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
        ctx.fill()
        ctx.fillStyle = textColorMain
      }

      // 绘制文字
      ctx.shadowColor = 'transparent'
      ctx.font = `700 ${fontSize}px system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, 0, 1)

      ctx.restore()
    })
  })

  Matter.Runner.run(runner, engine)
  Matter.Render.run(render)
}

const handleResize = () => {
  // 适配
}

onMounted(() => {
  initGame()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (render) {
    Matter.Render.stop(render)
    if (render.canvas) render.canvas.remove()
  }
  if (runner) Matter.Runner.stop(runner)
  if (engine) Matter.Engine.clear(engine)
})
</script>

<template>
  <div class="hero-game-wrapper" ref="containerRef">
    <!-- 背景文字层 -->
    <div class="background-layer">
      <!-- 左侧：FLOW BLOG -->
      <div class="bg-text-group left">
        <span class="solid">FLOW</span>
        <span class="outline">BLOG</span>
      </div>

      <!-- 右侧：WEL COME -->
      <div class="bg-text-group right">
        <span class="outline">WEL</span>
        <span class="solid">COME</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_variables.scss" as *;

.hero-game-wrapper {
  width: 100%;
  height: 280px;
  position: relative;
  overflow: hidden;
  cursor: grab;
  user-select: none;
  margin-bottom: 20px;

  &:active {
    cursor: grabbing;
  }
}

.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
}

.bg-text-group {
  display: flex;
  flex-direction: column;
  line-height: 0.85;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(50px, 13vw, 150px);
  letter-spacing: -0.04em;

  // 左侧组
  &.left {
    transform: translateX(-20px);
    text-align: left;
    z-index: 1;
  }

  // 右侧组
  &.right {
    text-align: right;
    margin-right: 25vw;
    transform: translateY(20px);
  }

  span {
    color: var(--text-main);
    opacity: 0.06;
    transition: opacity 0.3s;
    white-space: nowrap;

    &.outline {
      color: transparent;
      -webkit-text-stroke: 2px var(--text-main);
      opacity: 0.08;
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .bg-text-group {
    // 手机上字号调小
    font-size: clamp(40px, 12vw, 80px);

    &.left {
      transform: translateX(-10px);
    }

    &.right {
      margin-right: 20px;
    }
  }
}
</style>