export const enhanceCodeBlocks = (root: HTMLElement) => {
  const pres = root.querySelectorAll('pre')

  pres.forEach((pre) => {
    if (pre.parentElement?.classList.contains('code-block-body')) return

    const code = pre.querySelector('code')
    if (!code) return

    // language
    let lang = 'TEXT'
    const classes = [...Array.from(code.classList), ...Array.from(pre.classList)]
    for (const cls of classes) {
      const match = cls.match(/language-(\w+)/)
      if (match) {
        lang = match[1].toUpperCase()
        break
      }
    }

    // Calculate lines
    const content = code.innerText || ''
    const lines = content.split('\n')
    const lineCount = lines.length > 1 && lines[lines.length - 1].trim() === ''
      ? lines.length - 1
      : lines.length

    // Build DOM
    const wrapper = document.createElement('div')
    wrapper.className = 'code-block-wrapper'

    const header = document.createElement('div')
    header.className = 'code-block-header'

    const body = document.createElement('div')
    body.className = 'code-block-body'

    // Header content
    const langSpan = document.createElement('span')
    langSpan.className = 'code-lang'
    langSpan.innerText = lang

    const actions = document.createElement('div')
    actions.className = 'code-actions'

    // Copy Button
    const copyBtn = document.createElement('span')
    copyBtn.className = 'action-btn'
    copyBtn.innerText = '复制代码'
    copyBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(content)
        copyBtn.innerText = '已复制'
        setTimeout(() => copyBtn.innerText = '复制代码', 2000)
      } catch (e) {
        console.error(e)
      }
    }

    // Collapse Button
    const collapseBtn = document.createElement('span')
    collapseBtn.className = 'action-btn'
    collapseBtn.innerText = '收起'
    collapseBtn.onclick = () => {
      const isCollapsed = wrapper.classList.toggle('collapsed')
      collapseBtn.innerText = isCollapsed ? '展开' : '收起'
    }

    actions.append(collapseBtn, copyBtn)
    header.append(langSpan, actions)

    // Line Numbers
    const lineNumbers = document.createElement('div')
    lineNumbers.className = 'line-numbers'
    let lineHtml = ''
    for (let i = 1; i <= lineCount; i++) {
      lineHtml += `<span>${i}</span>`
    }
    lineNumbers.innerHTML = lineHtml

    // DOM Manipulation
    pre.parentNode?.insertBefore(wrapper, pre)
    body.appendChild(lineNumbers)
    body.appendChild(pre)
    wrapper.appendChild(header)
    wrapper.appendChild(body)
  })
}
