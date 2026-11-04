'use client'

/**
 * FormShell:弹窗/抽屉/页面三形态外壳,同一 children(表单)可切换形态。
 * 出处:briefs 03——M2 三形态拍板(2026-10-20):原生手写,零组件库——
 * 焦点圈禁(Tab 循环)/滚动锁(body overflow)/Esc/backdrop 点击关闭均在此实现。
 * 约束:行为开关来自 variants.ts 纯配置;page 形态直通渲染,不挂遮罩不进 portal。
 */
import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { SHELL_VARIANTS, type FormShellVariant } from './variants'
import styles from './form-shell.module.css'

const FOCUSABLE_SELECTOR =
  'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])'

export function FormShell({
  variant,
  title,
  open = true,
  onClose,
  children,
}: {
  variant: FormShellVariant
  title: string
  open?: boolean
  onClose?: () => void
  children: ReactNode
}) {
  const behavior = SHELL_VARIANTS[variant]
  const dialogRef = useRef<HTMLDivElement>(null)

  // 滚动锁:打开期间锁 body 滚动,卸载时恢复原值
  useEffect(() => {
    if (!behavior.lockScroll || !open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [behavior.lockScroll, open])

  // Esc 关闭:窗口级监听,打开期间生效
  useEffect(() => {
    if (!behavior.closeOnEsc || !open || onClose === undefined) return
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [behavior.closeOnEsc, open, onClose])

  // 初始焦点落壳内,圈禁起点成立
  useEffect(() => {
    if (!behavior.trapFocus || !open) return
    dialogRef.current?.focus()
  }, [behavior.trapFocus, open])

  // Tab 圈禁:在壳内首尾可聚焦元素间循环
  const handleTabTrap = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!behavior.trapFocus || event.key !== 'Tab') return
    const container = dialogRef.current
    if (container === null) return
    const focusables = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (first === undefined || last === undefined) {
      event.preventDefault()
      container.focus()
      return
    }
    const active = document.activeElement
    if (event.shiftKey) {
      if (active === first || active === container) {
        event.preventDefault()
        last.focus()
      }
    } else if (active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  if (variant === 'page') {
    return <section className={styles['page']}>{children}</section>
  }
  if (!open) return null

  return createPortal(
    <div
      className={styles['backdrop']}
      onClick={behavior.hasBackdrop && onClose !== undefined ? onClose : undefined}
    >
      <div
        ref={dialogRef}
        className={variant === 'modal' ? styles['modal'] : styles['drawer']}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onKeyDown={handleTabTrap}
        onClick={(event) => event.stopPropagation()}
      >
        {behavior.hasHeader ? (
          <header className={styles['header']}>
            <h2 className={styles['title']}>{title}</h2>
            <button type="button" className={styles['close']} onClick={onClose} aria-label="关闭">
              ×
            </button>
          </header>
        ) : null}
        <div className={styles['body']}>{children}</div>
      </div>
    </div>,
    document.body,
  )
}
