/**
 * 根布局(App Router):全局字体变量与站点 metadata 的唯一挂载点。
 * 出处:briefs 01——M1 建仓,create-next-app 脚手架生成后仅适配中文 metadata。
 * 约束:模板级文件保持极简,业务标记与内容一律由子路由/页面承载。
 */
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'SchemaWeaver',
  description: 'Schema 驱动的表单引擎:一份 JSON Schema 描述结构、校验与联动,引擎负责渲染',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
