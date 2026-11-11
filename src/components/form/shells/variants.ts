/**
 * 三形态外壳行为配置(page/modal/drawer):形态差异收敛为纯数据,供 FormShell 与测试消费。
 * 出处:briefs 03——M2 三形态拍板(原生手写焦点圈禁/滚动锁/Esc/backdrop);
 * "三形态渲染判定"测试种子锚定此文件(briefs 03 测试准备节)。
 * 约束:page 形态零壳行为;modal 居中弹窗/drawer 右侧抽屉——布局差异在 css,行为差异在此。
 */

export type FormShellVariant = 'page' | 'modal' | 'drawer'

export interface ShellBehavior {
  /** 半透明遮罩,点击可关闭 */
  hasBackdrop: boolean
  /** 打开期间锁定页面滚动 */
  lockScroll: boolean
  /** Tab 焦点圈禁在壳内 */
  trapFocus: boolean
  /** Esc 关闭 */
  closeOnEsc: boolean
  /** 顶部标题栏(标题+关闭按钮) */
  hasHeader: boolean
}

export const SHELL_VARIANTS: Readonly<Record<FormShellVariant, ShellBehavior>> = {
  page: {
    hasBackdrop: false,
    lockScroll: false,
    trapFocus: false,
    closeOnEsc: false,
    hasHeader: false,
  },
  modal: {
    hasBackdrop: true,
    lockScroll: true,
    trapFocus: true,
    closeOnEsc: true,
    hasHeader: true,
  },
  drawer: {
    hasBackdrop: true,
    lockScroll: true,
    trapFocus: true,
    closeOnEsc: true,
    hasHeader: true,
  },
}
