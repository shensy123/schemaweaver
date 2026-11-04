'use client'

/**
 * 示例库页:五份 schema 卡片化(序号+标题+介绍文案),「查看数据」弹窗内看高亮 JSON,
 * 弹窗底部上一个/下一个循环切换(尾→首、首→尾)。
 * 出处:briefs 03 修复轮 B2(2026-11-05 用户方案);弹窗复用 FormShell(modal)。
 * 约束:介绍文案按各 JSON 实际数据撰写(做什么+一个使用场景),不虚构能力。
 */
import { useState, type ReactNode } from 'react'

import { FormShell } from '@/components/form/shells/FormShell'
import crossField from '@/schema/examples/cross-field-validation.json'
import dynamicRendering from '@/schema/examples/dynamic-rendering.json'
import dynamicRows from '@/schema/examples/dynamic-rows.json'
import fieldLinkage from '@/schema/examples/field-linkage.json'
import nestedContainers from '@/schema/examples/nested-containers.json'

import styles from './examples.module.css'

interface ExampleCard {
  key: string
  order: string
  title: string
  intro: string
  schema: unknown
}

const EXAMPLES: ExampleCard[] = [
  {
    key: 'dynamic-rendering',
    order: '①',
    title: '动态渲染 · 会员注册',
    intro:
      '一份 JSON 声明字段与类型,引擎自动渲染文本、数字、下拉、开关、日期五种控件。使用场景:注册表单要增删字段时只改 JSON,不动组件代码。',
    schema: dynamicRendering,
  },
  {
    key: 'cross-field-validation',
    order: '②',
    title: '跨字段校验 · 项目周期设置',
    intro:
      '两次密码一致(match)、结束日期晚于开始(greaterThan)——比较规则写在 schema,引擎统一求值并把错误挂到对应字段。使用场景:活动报名表需要密码确认与起止日期合理性校验。',
    schema: crossField,
  },
  {
    key: 'field-linkage',
    order: '③',
    title: '字段联动 · 开发者信息登记',
    intro:
      '就业状态选"自由职业"才显示接单平台与月收入;隐藏字段不参与校验、不进提交数据。使用场景:问卷按用户回答动态展开追问,减少无关题目的干扰。',
    schema: fieldLinkage,
  },
  {
    key: 'dynamic-rows',
    order: '④',
    title: '动态增删行 · 家庭成员登记',
    intro:
      'array 字段渲染成可增删的行,每行按列定义逐格输入、逐格校验。使用场景:补贴申报需按家庭人数动态填写多名成员信息,行数由填报人决定。',
    schema: dynamicRows,
  },
  {
    key: 'nested-containers',
    order: '⑤',
    title: '嵌套容器(v0.2)· 项目立项登记',
    intro:
      'object 分组容器多层嵌套,组内可再含数组和条件显隐;不满足条件的整棵分组被剪枝。使用场景:复杂审批表单按项目类型(自研/外包)展开不同的信息分组。',
    schema: nestedContainers,
  },
]

/** JSON 语法高亮:键/字符串/布尔空值/数字四类着色(仓库自有数据,无注入面) */
const TOKEN_RE =
  /("(?:[^"\\]|\\.)*"\s*:)|("(?:[^"\\]|\\.)*")|(\b(?:true|false|null)\b)|(-?\d+(?:\.\d+)?)/g

function highlightJson(source: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let last = 0
  let seq = 0
  for (const match of source.matchAll(TOKEN_RE)) {
    const start = match.index ?? 0
    if (start > last) nodes.push(source.slice(last, start))
    const kind =
      match[1] !== undefined
        ? 'key'
        : match[2] !== undefined
          ? 'string'
          : match[3] !== undefined
            ? 'bool'
            : 'number'
    nodes.push(
      <span key={`token-${seq++}`} className={styles[`token-${kind}`]}>
        {match[0]}
      </span>,
    )
    last = start + match[0].length
  }
  if (last < source.length) nodes.push(source.slice(last))
  return nodes
}

export default function ExamplesPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const active: ExampleCard | undefined = activeIndex === null ? undefined : EXAMPLES[activeIndex]

  const show = (index: number): void => {
    setActiveIndex(((index % EXAMPLES.length) + EXAMPLES.length) % EXAMPLES.length)
  }

  return (
    <main className={styles['page']}>
      <header className={styles['header']}>
        <h1>Schema 能力示例</h1>
        <p className={styles['note']}>
          检验:一份 JSON 能把表单描述到什么程度。五份示例覆盖 M1 四能力+v0.2
          嵌套容器,点「查看数据」看完整 schema。
        </p>
      </header>
      <div className={styles['grid']}>
        {EXAMPLES.map((example, index) => (
          <section key={example.key} className={styles['card']}>
            <h2 className={styles['card-title']}>
              <span className={styles['card-order']}>{example.order}</span>
              {example.title}
            </h2>
            <p className={styles['card-intro']}>{example.intro}</p>
            <button type="button" className={styles['ghost-btn']} onClick={() => show(index)}>
              查看数据
            </button>
          </section>
        ))}
      </div>
      <FormShell
        variant="modal"
        title={active === undefined ? '' : `${active.order} ${active.title}`}
        open={active !== undefined}
        onClose={() => setActiveIndex(null)}
      >
        {active !== undefined ? (
          <div className={styles['viewer']}>
            <p className={styles['viewer-intro']}>{active.intro}</p>
            <pre className={styles['viewer-json']}>
              {highlightJson(JSON.stringify(active.schema, null, 2))}
            </pre>
            <div className={styles['viewer-nav']}>
              <button
                type="button"
                className={styles['ghost-btn']}
                onClick={() => show((activeIndex ?? 0) - 1)}
              >
                ← 上一个
              </button>
              <span className={styles['viewer-position']}>
                {(activeIndex ?? 0) + 1} / {EXAMPLES.length}
              </span>
              <button
                type="button"
                className={styles['ghost-btn']}
                onClick={() => show((activeIndex ?? 0) + 1)}
              >
                下一个 →
              </button>
            </div>
          </div>
        ) : null}
      </FormShell>
    </main>
  )
}
