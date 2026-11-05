/**
 * 首页:项目介绍(用户视角文案)+ 三部分导览(每部分说明"这部分演示什么"),显色按钮入口。
 * 出处:briefs 03 修复轮 C 建页 + 修复轮 2 任务 3 文案转译(术语加括号白话,杜绝代号语)。
 * 约束:server 组件零交互,导览走 Link;样式一律 token 消费(css-style §1)。
 */
import Link from 'next/link'

import styles from './home.module.css'

const parts = [
  {
    order: '①',
    title: 'Schema 能力示例',
    what: '看五份"表单图纸"(JSON 数据):每张图纸配了说明——哪个字段怎么改、界面会跟着怎么变。适合先弄明白"一份 JSON 是怎么把表单描述出来的"。',
    href: '/examples',
    action: '看示例数据',
  },
  {
    order: '②',
    title: '表单全流程演示',
    what: '亲手填一张四模块表单:字段按你的选择出现/隐藏(联动),填错当场被拦(跨字段校验),全部通过才能一次性提交(统一提交),点错还能跳回出错位置。',
    href: '/flow',
    action: '进入全流程',
  },
  {
    order: '③',
    title: '三形态外壳演示',
    what: '同一份表单换三种外壳:整页铺开、居中弹窗、右侧抽屉——内容一个字不改,只换壳;弹窗支持 Esc 关闭、点空白关闭、键盘焦点锁定。适合看展示形态怎么切换。',
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
          用一份 JSON 描述表单的结构、校验与联动,引擎负责把它渲染成可交互的网页表单——改 JSON
          就能改表单,不用动组件代码。表单引擎已完成第二期开发:嵌套分组也能画(递归渲染)、字段按条件显隐(联动)、跨字段规则校验、多模块一次性提交、三种展示形态。
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
        第二期(M2)· schema v0.2 · AI 协作开发 · push main 即自动部署
      </footer>
    </main>
  )
}
