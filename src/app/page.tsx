/**
 * 首页:项目介绍(用户视角文案)+ 三部分导览卡(关键词清单式,修复轮 3),显色按钮入口。
 * 出处:briefs 03 修复轮 C 建页→轮 2 文案转译→轮 3 清单化(详细说明转存 docs/demo-guide.md)。
 * 约束:server 组件零交互,导览走 Link;样式一律 token 消费(css-style §1)。
 */
import Link from 'next/link'

import styles from './home.module.css'

const parts = [
  {
    order: '①',
    title: 'Schema 能力示例',
    items: [
      '动态渲染 · 会员注册',
      '跨字段校验 · 项目周期设置',
      '字段联动 · 开发者信息登记',
      '动态增删行 · 家庭成员登记',
      '嵌套容器(v0.2)· 项目立项登记',
    ],
    href: '/examples',
    action: '看示例数据',
  },
  {
    order: '②',
    title: '表单全流程演示',
    items: [
      '字段按选择出现/隐藏(联动)',
      '填错当场拦截(跨字段校验)',
      '全部通过才放行(统一提交)',
      '点错误一键跳回出错位置',
    ],
    href: '/flow',
    action: '进入全流程',
  },
  {
    order: '③',
    title: '三形态外壳演示',
    items: ['page 整页铺开', 'modal 居中弹窗', 'drawer 右侧抽屉', 'Esc/点空白关闭 · 焦点锁定'],
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
        <p className={styles['hint']}>三部分演示各有侧重,看清单选入口 ↓</p>
      </header>
      <nav className={styles['parts']}>
        {parts.map((part) => (
          <section key={part.href} className={styles['card']}>
            <h2 className={styles['card-title']}>
              <span className={styles['card-order']}>{part.order}</span>
              {part.title}
            </h2>
            <ul className={styles['card-list']}>
              {part.items.map((item) => (
                <li key={item} className={styles['card-item']}>
                  {item}
                </li>
              ))}
            </ul>
            <Link href={part.href} className={styles['primary-btn']}>
              {part.action}
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
