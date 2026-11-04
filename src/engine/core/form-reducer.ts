/**
 * 表单状态机:纯 reducer,承载"填→联动→提交"全程的值与触碰状态流转。
 * 出处:briefs 03——M2 core 分块;隐藏字段值保留在 values、由提交侧剔除(D3 拍板)。
 * 修复轮(2026-11-05 A1 拍板):SET_FIELD/UPDATE_CELL 同时标记 touched——
 * 值变化即交互,错误随输入实时出现/清除(输入即校验),不再只等 blur。
 * 约束:纯函数+不可变更新;不感知 React(UI 薄壳 useFormEngine 包装,步骤 7 落地)。
 */
import type { ArrayRow, FormState } from './types'

export type FormAction =
  | { type: 'SET_FIELD'; key: string; value: unknown }
  | { type: 'TOUCH_FIELD'; key: string }
  | { type: 'ADD_ROW'; key: string }
  | { type: 'REMOVE_ROW'; key: string; index: number }
  | { type: 'UPDATE_CELL'; key: string; row: number; column: string; value: unknown }
  | { type: 'SUBMIT_ATTEMPT' }
  | { type: 'RESET' }

/** 初始状态:values 全省略(未填即不出现),首填即落键 */
export function createInitialState(): FormState {
  return { values: {}, touched: {}, submitted: false }
}

export function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD': {
      if (state.values[action.key] === action.value) return state
      return {
        ...state,
        values: { ...state.values, [action.key]: action.value },
        touched: { ...state.touched, [action.key]: true },
      }
    }
    case 'TOUCH_FIELD': {
      if (state.touched[action.key]) return state
      return { ...state, touched: { ...state.touched, [action.key]: true } }
    }
    case 'ADD_ROW': {
      const rows = asRows(state.values[action.key])
      return { ...state, values: { ...state.values, [action.key]: [...rows, {}] } }
    }
    case 'REMOVE_ROW': {
      const rows = asRows(state.values[action.key])
      return {
        ...state,
        values: {
          ...state.values,
          [action.key]: rows.filter((_, index) => index !== action.index),
        },
      }
    }
    case 'UPDATE_CELL': {
      const rows = asRows(state.values[action.key])
      const nextRows = rows.map((row, index) =>
        index === action.row ? { ...row, [action.column]: action.value } : row,
      )
      return {
        ...state,
        values: { ...state.values, [action.key]: nextRows },
        touched: { ...state.touched, [action.key]: true },
      }
    }
    case 'SUBMIT_ATTEMPT': {
      if (state.submitted) return state
      return { ...state, submitted: true }
    }
    case 'RESET':
      return createInitialState()
  }
}

/** array 字段值防御性读取:非数组(含 undefined)一律视为空行集 */
function asRows(value: unknown): ArrayRow[] {
  return Array.isArray(value) ? (value as ArrayRow[]) : []
}
