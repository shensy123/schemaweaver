/**
 * 首页:项目介绍 + 三部分导览(示例库/全流程/三形态),每部分说明"检验什么"。
 * 出处:briefs 03 修复轮 C(2026-11-05 用户方案)——信息架构三拆,显色按钮可辨认。
 * 约束:server 组件零交互,导览走 Link;样式一律 token 消费(css-style §1)。
 */
import Link from 'next/link'

import styles from './home.module.css'

const parts = [
  {
    order: '①',
    title: 'Schema 能力示例',
    what: '这一部分检验:一份 JSON 能把表单描述到什么程度。动态渲染、跨字段校验、字段联动、动态增删行、嵌套容器(v0.2)五份实例数据逐份查看,卡片配介绍文案,弹窗内看高亮 JSON。',
    href: '/examples',
    action: '看示例数据',
  },
  {
    order: '②',
    title: '表单全流程演示',
    what: '这一部分检验:引擎把 schema 渲染成真表单。填写 → 联动显隐 → 跨字段校验 → 统一提交(全模块通过才放行,错误可定位跳转)一条链路走通;四个模块覆盖全部控件形态。',
    href: '/flow',
    action: '进入全流程',
  },
  {
    order: '③',
    title: '三形态外壳演示',
    what: '这一部分检验:同一份 schema 换壳不改内容。page 内联 / modal 弹窗 / drawer 抽屉三种形态,Esc 关闭、遮罩点击、Tab 焦点圈禁、滚动锁行为一致(原生手写,零组件库)。',
    href: '/shells',
    action: '切换三形态',
  },
]

export default function Home() {
  return (
    <main className={styles['page']}>
      <header className={styles['hero']}>
        <h1>SchemaWeaver</h1>
        <p className={styles['intro']}>
          Schema 驱动的表单引擎:用一份 JSON Schema
          描述表单的结构、校验与联动,引擎负责渲染成可交互表单。 当前 Schema v0.2,M2
          引擎已落地(递归渲染 / 联动 / 校验聚合 / 三形态)。
        </p>
        <p className={styles['hint']}>三部分演示各有侧重,看说明选入口 ↓</p>
      </header>
      <nav className={styles['parts']}>
        {parts.map((part) => (
          <section key={part.href} className={styles['card']}>
            <h2 className={styles['card-title']}>
              <span className={styles['card-order']}>{part.order}</span>
              {part.title}
            </h2>
            <p className={styles['card-what']}>{part.what}</p>
            <Link href={part.href} className={styles['primary-btn']}>
              {part.action} →
            </Link>
          </section>
        ))}
      </nav>
      <footer className={styles['footer']}>
        M2 · schema v0.2 · AI 协作开发 · push main 即自动部署
      </footer>
    </main>
  )
}
