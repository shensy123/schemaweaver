import { describe, expect, it } from 'vitest'

import { SHELL_VARIANTS } from '../variants'

describe('components/form/shells/variants 三形态渲染判定', () => {
  it('三形态键齐全闭合(page/modal/drawer)', () => {
    // Assert
    expect(Object.keys(SHELL_VARIANTS).sort()).toEqual(['drawer', 'modal', 'page'])
  })

  it('page 形态零壳行为:无遮罩/不锁滚/不圈禁/不响应 Esc/无标题栏', () => {
    // Assert
    expect(SHELL_VARIANTS.page).toEqual({
      hasBackdrop: false,
      lockScroll: false,
      trapFocus: false,
      closeOnEsc: false,
      hasHeader: false,
    })
  })

  it('modal 与 drawer 全行为开启:遮罩/锁滚/圈禁/Esc/标题栏', () => {
    // Assert
    for (const variant of ['modal', 'drawer'] as const) {
      expect(SHELL_VARIANTS[variant]).toEqual({
        hasBackdrop: true,
        lockScroll: true,
        trapFocus: true,
        closeOnEsc: true,
        hasHeader: true,
      })
    }
  })

  it('modal 与 drawer 行为一致:形态差异只由布局承担(css 层)', () => {
    // Assert
    expect(SHELL_VARIANTS.modal).toEqual(SHELL_VARIANTS.drawer)
  })
})
